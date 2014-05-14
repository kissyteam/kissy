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
  _$jscoverage['/editor/dom.js'].lineData[15] = 0;
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
  _$jscoverage['/editor/dom.js'].lineData[135] = 0;
  _$jscoverage['/editor/dom.js'].lineData[136] = 0;
  _$jscoverage['/editor/dom.js'].lineData[137] = 0;
  _$jscoverage['/editor/dom.js'].lineData[139] = 0;
  _$jscoverage['/editor/dom.js'].lineData[145] = 0;
  _$jscoverage['/editor/dom.js'].lineData[146] = 0;
  _$jscoverage['/editor/dom.js'].lineData[149] = 0;
  _$jscoverage['/editor/dom.js'].lineData[151] = 0;
  _$jscoverage['/editor/dom.js'].lineData[152] = 0;
  _$jscoverage['/editor/dom.js'].lineData[155] = 0;
  _$jscoverage['/editor/dom.js'].lineData[160] = 0;
  _$jscoverage['/editor/dom.js'].lineData[163] = 0;
  _$jscoverage['/editor/dom.js'].lineData[164] = 0;
  _$jscoverage['/editor/dom.js'].lineData[167] = 0;
  _$jscoverage['/editor/dom.js'].lineData[168] = 0;
  _$jscoverage['/editor/dom.js'].lineData[169] = 0;
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
  _$jscoverage['/editor/dom.js'].lineData[290] = 0;
  _$jscoverage['/editor/dom.js'].lineData[291] = 0;
  _$jscoverage['/editor/dom.js'].lineData[292] = 0;
  _$jscoverage['/editor/dom.js'].lineData[293] = 0;
  _$jscoverage['/editor/dom.js'].lineData[295] = 0;
  _$jscoverage['/editor/dom.js'].lineData[301] = 0;
  _$jscoverage['/editor/dom.js'].lineData[302] = 0;
  _$jscoverage['/editor/dom.js'].lineData[303] = 0;
  _$jscoverage['/editor/dom.js'].lineData[304] = 0;
  _$jscoverage['/editor/dom.js'].lineData[308] = 0;
  _$jscoverage['/editor/dom.js'].lineData[313] = 0;
  _$jscoverage['/editor/dom.js'].lineData[314] = 0;
  _$jscoverage['/editor/dom.js'].lineData[316] = 0;
  _$jscoverage['/editor/dom.js'].lineData[318] = 0;
  _$jscoverage['/editor/dom.js'].lineData[321] = 0;
  _$jscoverage['/editor/dom.js'].lineData[324] = 0;
  _$jscoverage['/editor/dom.js'].lineData[325] = 0;
  _$jscoverage['/editor/dom.js'].lineData[327] = 0;
  _$jscoverage['/editor/dom.js'].lineData[330] = 0;
  _$jscoverage['/editor/dom.js'].lineData[331] = 0;
  _$jscoverage['/editor/dom.js'].lineData[334] = 0;
  _$jscoverage['/editor/dom.js'].lineData[335] = 0;
  _$jscoverage['/editor/dom.js'].lineData[338] = 0;
  _$jscoverage['/editor/dom.js'].lineData[339] = 0;
  _$jscoverage['/editor/dom.js'].lineData[342] = 0;
  _$jscoverage['/editor/dom.js'].lineData[347] = 0;
  _$jscoverage['/editor/dom.js'].lineData[348] = 0;
  _$jscoverage['/editor/dom.js'].lineData[349] = 0;
  _$jscoverage['/editor/dom.js'].lineData[350] = 0;
  _$jscoverage['/editor/dom.js'].lineData[354] = 0;
  _$jscoverage['/editor/dom.js'].lineData[359] = 0;
  _$jscoverage['/editor/dom.js'].lineData[360] = 0;
  _$jscoverage['/editor/dom.js'].lineData[362] = 0;
  _$jscoverage['/editor/dom.js'].lineData[364] = 0;
  _$jscoverage['/editor/dom.js'].lineData[367] = 0;
  _$jscoverage['/editor/dom.js'].lineData[370] = 0;
  _$jscoverage['/editor/dom.js'].lineData[371] = 0;
  _$jscoverage['/editor/dom.js'].lineData[373] = 0;
  _$jscoverage['/editor/dom.js'].lineData[376] = 0;
  _$jscoverage['/editor/dom.js'].lineData[377] = 0;
  _$jscoverage['/editor/dom.js'].lineData[380] = 0;
  _$jscoverage['/editor/dom.js'].lineData[381] = 0;
  _$jscoverage['/editor/dom.js'].lineData[384] = 0;
  _$jscoverage['/editor/dom.js'].lineData[385] = 0;
  _$jscoverage['/editor/dom.js'].lineData[388] = 0;
  _$jscoverage['/editor/dom.js'].lineData[394] = 0;
  _$jscoverage['/editor/dom.js'].lineData[396] = 0;
  _$jscoverage['/editor/dom.js'].lineData[397] = 0;
  _$jscoverage['/editor/dom.js'].lineData[400] = 0;
  _$jscoverage['/editor/dom.js'].lineData[401] = 0;
  _$jscoverage['/editor/dom.js'].lineData[404] = 0;
  _$jscoverage['/editor/dom.js'].lineData[406] = 0;
  _$jscoverage['/editor/dom.js'].lineData[407] = 0;
  _$jscoverage['/editor/dom.js'].lineData[408] = 0;
  _$jscoverage['/editor/dom.js'].lineData[412] = 0;
  _$jscoverage['/editor/dom.js'].lineData[418] = 0;
  _$jscoverage['/editor/dom.js'].lineData[419] = 0;
  _$jscoverage['/editor/dom.js'].lineData[420] = 0;
  _$jscoverage['/editor/dom.js'].lineData[421] = 0;
  _$jscoverage['/editor/dom.js'].lineData[427] = 0;
  _$jscoverage['/editor/dom.js'].lineData[428] = 0;
  _$jscoverage['/editor/dom.js'].lineData[430] = 0;
  _$jscoverage['/editor/dom.js'].lineData[432] = 0;
  _$jscoverage['/editor/dom.js'].lineData[433] = 0;
  _$jscoverage['/editor/dom.js'].lineData[437] = 0;
  _$jscoverage['/editor/dom.js'].lineData[440] = 0;
  _$jscoverage['/editor/dom.js'].lineData[441] = 0;
  _$jscoverage['/editor/dom.js'].lineData[445] = 0;
  _$jscoverage['/editor/dom.js'].lineData[453] = 0;
  _$jscoverage['/editor/dom.js'].lineData[455] = 0;
  _$jscoverage['/editor/dom.js'].lineData[456] = 0;
  _$jscoverage['/editor/dom.js'].lineData[461] = 0;
  _$jscoverage['/editor/dom.js'].lineData[462] = 0;
  _$jscoverage['/editor/dom.js'].lineData[466] = 0;
  _$jscoverage['/editor/dom.js'].lineData[468] = 0;
  _$jscoverage['/editor/dom.js'].lineData[469] = 0;
  _$jscoverage['/editor/dom.js'].lineData[472] = 0;
  _$jscoverage['/editor/dom.js'].lineData[473] = 0;
  _$jscoverage['/editor/dom.js'].lineData[476] = 0;
  _$jscoverage['/editor/dom.js'].lineData[477] = 0;
  _$jscoverage['/editor/dom.js'].lineData[487] = 0;
  _$jscoverage['/editor/dom.js'].lineData[492] = 0;
  _$jscoverage['/editor/dom.js'].lineData[493] = 0;
  _$jscoverage['/editor/dom.js'].lineData[494] = 0;
  _$jscoverage['/editor/dom.js'].lineData[500] = 0;
  _$jscoverage['/editor/dom.js'].lineData[507] = 0;
  _$jscoverage['/editor/dom.js'].lineData[511] = 0;
  _$jscoverage['/editor/dom.js'].lineData[512] = 0;
  _$jscoverage['/editor/dom.js'].lineData[513] = 0;
  _$jscoverage['/editor/dom.js'].lineData[516] = 0;
  _$jscoverage['/editor/dom.js'].lineData[521] = 0;
  _$jscoverage['/editor/dom.js'].lineData[522] = 0;
  _$jscoverage['/editor/dom.js'].lineData[523] = 0;
  _$jscoverage['/editor/dom.js'].lineData[525] = 0;
  _$jscoverage['/editor/dom.js'].lineData[526] = 0;
  _$jscoverage['/editor/dom.js'].lineData[529] = 0;
  _$jscoverage['/editor/dom.js'].lineData[531] = 0;
  _$jscoverage['/editor/dom.js'].lineData[536] = 0;
  _$jscoverage['/editor/dom.js'].lineData[537] = 0;
  _$jscoverage['/editor/dom.js'].lineData[542] = 0;
  _$jscoverage['/editor/dom.js'].lineData[543] = 0;
  _$jscoverage['/editor/dom.js'].lineData[544] = 0;
  _$jscoverage['/editor/dom.js'].lineData[545] = 0;
  _$jscoverage['/editor/dom.js'].lineData[548] = 0;
  _$jscoverage['/editor/dom.js'].lineData[549] = 0;
  _$jscoverage['/editor/dom.js'].lineData[550] = 0;
  _$jscoverage['/editor/dom.js'].lineData[551] = 0;
  _$jscoverage['/editor/dom.js'].lineData[552] = 0;
  _$jscoverage['/editor/dom.js'].lineData[554] = 0;
  _$jscoverage['/editor/dom.js'].lineData[557] = 0;
  _$jscoverage['/editor/dom.js'].lineData[563] = 0;
  _$jscoverage['/editor/dom.js'].lineData[564] = 0;
  _$jscoverage['/editor/dom.js'].lineData[565] = 0;
  _$jscoverage['/editor/dom.js'].lineData[566] = 0;
  _$jscoverage['/editor/dom.js'].lineData[568] = 0;
  _$jscoverage['/editor/dom.js'].lineData[569] = 0;
  _$jscoverage['/editor/dom.js'].lineData[570] = 0;
  _$jscoverage['/editor/dom.js'].lineData[571] = 0;
  _$jscoverage['/editor/dom.js'].lineData[572] = 0;
  _$jscoverage['/editor/dom.js'].lineData[575] = 0;
  _$jscoverage['/editor/dom.js'].lineData[578] = 0;
  _$jscoverage['/editor/dom.js'].lineData[581] = 0;
  _$jscoverage['/editor/dom.js'].lineData[582] = 0;
  _$jscoverage['/editor/dom.js'].lineData[583] = 0;
  _$jscoverage['/editor/dom.js'].lineData[586] = 0;
  _$jscoverage['/editor/dom.js'].lineData[593] = 0;
  _$jscoverage['/editor/dom.js'].lineData[596] = 0;
  _$jscoverage['/editor/dom.js'].lineData[598] = 0;
  _$jscoverage['/editor/dom.js'].lineData[601] = 0;
  _$jscoverage['/editor/dom.js'].lineData[604] = 0;
  _$jscoverage['/editor/dom.js'].lineData[605] = 0;
  _$jscoverage['/editor/dom.js'].lineData[611] = 0;
  _$jscoverage['/editor/dom.js'].lineData[612] = 0;
  _$jscoverage['/editor/dom.js'].lineData[616] = 0;
  _$jscoverage['/editor/dom.js'].lineData[617] = 0;
  _$jscoverage['/editor/dom.js'].lineData[618] = 0;
  _$jscoverage['/editor/dom.js'].lineData[623] = 0;
  _$jscoverage['/editor/dom.js'].lineData[624] = 0;
  _$jscoverage['/editor/dom.js'].lineData[626] = 0;
  _$jscoverage['/editor/dom.js'].lineData[627] = 0;
  _$jscoverage['/editor/dom.js'].lineData[629] = 0;
  _$jscoverage['/editor/dom.js'].lineData[630] = 0;
  _$jscoverage['/editor/dom.js'].lineData[631] = 0;
  _$jscoverage['/editor/dom.js'].lineData[632] = 0;
  _$jscoverage['/editor/dom.js'].lineData[638] = 0;
  _$jscoverage['/editor/dom.js'].lineData[639] = 0;
  _$jscoverage['/editor/dom.js'].lineData[640] = 0;
  _$jscoverage['/editor/dom.js'].lineData[642] = 0;
  _$jscoverage['/editor/dom.js'].lineData[645] = 0;
  _$jscoverage['/editor/dom.js'].lineData[650] = 0;
  _$jscoverage['/editor/dom.js'].lineData[651] = 0;
  _$jscoverage['/editor/dom.js'].lineData[654] = 0;
  _$jscoverage['/editor/dom.js'].lineData[655] = 0;
  _$jscoverage['/editor/dom.js'].lineData[656] = 0;
  _$jscoverage['/editor/dom.js'].lineData[659] = 0;
  _$jscoverage['/editor/dom.js'].lineData[660] = 0;
  _$jscoverage['/editor/dom.js'].lineData[661] = 0;
  _$jscoverage['/editor/dom.js'].lineData[663] = 0;
  _$jscoverage['/editor/dom.js'].lineData[668] = 0;
  _$jscoverage['/editor/dom.js'].lineData[669] = 0;
  _$jscoverage['/editor/dom.js'].lineData[676] = 0;
  _$jscoverage['/editor/dom.js'].lineData[680] = 0;
  _$jscoverage['/editor/dom.js'].lineData[685] = 0;
  _$jscoverage['/editor/dom.js'].lineData[687] = 0;
  _$jscoverage['/editor/dom.js'].lineData[688] = 0;
  _$jscoverage['/editor/dom.js'].lineData[690] = 0;
  _$jscoverage['/editor/dom.js'].lineData[691] = 0;
  _$jscoverage['/editor/dom.js'].lineData[692] = 0;
  _$jscoverage['/editor/dom.js'].lineData[695] = 0;
  _$jscoverage['/editor/dom.js'].lineData[697] = 0;
  _$jscoverage['/editor/dom.js'].lineData[698] = 0;
  _$jscoverage['/editor/dom.js'].lineData[700] = 0;
  _$jscoverage['/editor/dom.js'].lineData[704] = 0;
  _$jscoverage['/editor/dom.js'].lineData[707] = 0;
  _$jscoverage['/editor/dom.js'].lineData[709] = 0;
  _$jscoverage['/editor/dom.js'].lineData[710] = 0;
  _$jscoverage['/editor/dom.js'].lineData[711] = 0;
  _$jscoverage['/editor/dom.js'].lineData[716] = 0;
  _$jscoverage['/editor/dom.js'].lineData[720] = 0;
  _$jscoverage['/editor/dom.js'].lineData[721] = 0;
  _$jscoverage['/editor/dom.js'].lineData[723] = 0;
  _$jscoverage['/editor/dom.js'].lineData[727] = 0;
  _$jscoverage['/editor/dom.js'].lineData[729] = 0;
  _$jscoverage['/editor/dom.js'].lineData[730] = 0;
  _$jscoverage['/editor/dom.js'].lineData[731] = 0;
  _$jscoverage['/editor/dom.js'].lineData[732] = 0;
  _$jscoverage['/editor/dom.js'].lineData[733] = 0;
  _$jscoverage['/editor/dom.js'].lineData[737] = 0;
  _$jscoverage['/editor/dom.js'].lineData[740] = 0;
  _$jscoverage['/editor/dom.js'].lineData[743] = 0;
  _$jscoverage['/editor/dom.js'].lineData[744] = 0;
  _$jscoverage['/editor/dom.js'].lineData[747] = 0;
  _$jscoverage['/editor/dom.js'].lineData[748] = 0;
  _$jscoverage['/editor/dom.js'].lineData[751] = 0;
  _$jscoverage['/editor/dom.js'].lineData[752] = 0;
  _$jscoverage['/editor/dom.js'].lineData[758] = 0;
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
  _$jscoverage['/editor/dom.js'].branchData['136'] = [];
  _$jscoverage['/editor/dom.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['145'] = [];
  _$jscoverage['/editor/dom.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['151'] = [];
  _$jscoverage['/editor/dom.js'].branchData['151'][1] = new BranchData();
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
  _$jscoverage['/editor/dom.js'].branchData['301'] = [];
  _$jscoverage['/editor/dom.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['304'] = [];
  _$jscoverage['/editor/dom.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['308'] = [];
  _$jscoverage['/editor/dom.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['313'] = [];
  _$jscoverage['/editor/dom.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['314'] = [];
  _$jscoverage['/editor/dom.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['314'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['315'] = [];
  _$jscoverage['/editor/dom.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['321'] = [];
  _$jscoverage['/editor/dom.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['324'] = [];
  _$jscoverage['/editor/dom.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['324'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['330'] = [];
  _$jscoverage['/editor/dom.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['334'] = [];
  _$jscoverage['/editor/dom.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['334'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['338'] = [];
  _$jscoverage['/editor/dom.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['338'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['347'] = [];
  _$jscoverage['/editor/dom.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['350'] = [];
  _$jscoverage['/editor/dom.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['354'] = [];
  _$jscoverage['/editor/dom.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['359'] = [];
  _$jscoverage['/editor/dom.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['360'] = [];
  _$jscoverage['/editor/dom.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['361'] = [];
  _$jscoverage['/editor/dom.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['367'] = [];
  _$jscoverage['/editor/dom.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['370'] = [];
  _$jscoverage['/editor/dom.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['370'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['376'] = [];
  _$jscoverage['/editor/dom.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['380'] = [];
  _$jscoverage['/editor/dom.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['384'] = [];
  _$jscoverage['/editor/dom.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['396'] = [];
  _$jscoverage['/editor/dom.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['400'] = [];
  _$jscoverage['/editor/dom.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['407'] = [];
  _$jscoverage['/editor/dom.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['416'] = [];
  _$jscoverage['/editor/dom.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['419'] = [];
  _$jscoverage['/editor/dom.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['427'] = [];
  _$jscoverage['/editor/dom.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['432'] = [];
  _$jscoverage['/editor/dom.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['440'] = [];
  _$jscoverage['/editor/dom.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['455'] = [];
  _$jscoverage['/editor/dom.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['461'] = [];
  _$jscoverage['/editor/dom.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['466'] = [];
  _$jscoverage['/editor/dom.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['466'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['467'] = [];
  _$jscoverage['/editor/dom.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['468'] = [];
  _$jscoverage['/editor/dom.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['472'] = [];
  _$jscoverage['/editor/dom.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['476'] = [];
  _$jscoverage['/editor/dom.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['477'] = [];
  _$jscoverage['/editor/dom.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['477'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['477'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['479'] = [];
  _$jscoverage['/editor/dom.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['492'] = [];
  _$jscoverage['/editor/dom.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['493'] = [];
  _$jscoverage['/editor/dom.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['494'] = [];
  _$jscoverage['/editor/dom.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['500'] = [];
  _$jscoverage['/editor/dom.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['511'] = [];
  _$jscoverage['/editor/dom.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['511'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['522'] = [];
  _$jscoverage['/editor/dom.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['523'] = [];
  _$jscoverage['/editor/dom.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['544'] = [];
  _$jscoverage['/editor/dom.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['548'] = [];
  _$jscoverage['/editor/dom.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['551'] = [];
  _$jscoverage['/editor/dom.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['565'] = [];
  _$jscoverage['/editor/dom.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['568'] = [];
  _$jscoverage['/editor/dom.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['571'] = [];
  _$jscoverage['/editor/dom.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['581'] = [];
  _$jscoverage['/editor/dom.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['583'] = [];
  _$jscoverage['/editor/dom.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['584'] = [];
  _$jscoverage['/editor/dom.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['584'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['585'] = [];
  _$jscoverage['/editor/dom.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['596'] = [];
  _$jscoverage['/editor/dom.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['597'] = [];
  _$jscoverage['/editor/dom.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['597'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['601'] = [];
  _$jscoverage['/editor/dom.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['602'] = [];
  _$jscoverage['/editor/dom.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['602'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['603'] = [];
  _$jscoverage['/editor/dom.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['612'] = [];
  _$jscoverage['/editor/dom.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['614'] = [];
  _$jscoverage['/editor/dom.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['630'] = [];
  _$jscoverage['/editor/dom.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['640'] = [];
  _$jscoverage['/editor/dom.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['642'] = [];
  _$jscoverage['/editor/dom.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['650'] = [];
  _$jscoverage['/editor/dom.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['654'] = [];
  _$jscoverage['/editor/dom.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['654'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['656'] = [];
  _$jscoverage['/editor/dom.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['657'] = [];
  _$jscoverage['/editor/dom.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['657'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['657'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['660'] = [];
  _$jscoverage['/editor/dom.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['668'] = [];
  _$jscoverage['/editor/dom.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['677'] = [];
  _$jscoverage['/editor/dom.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['678'] = [];
  _$jscoverage['/editor/dom.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['680'] = [];
  _$jscoverage['/editor/dom.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['687'] = [];
  _$jscoverage['/editor/dom.js'].branchData['687'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['687'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['690'] = [];
  _$jscoverage['/editor/dom.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['697'] = [];
  _$jscoverage['/editor/dom.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['700'] = [];
  _$jscoverage['/editor/dom.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['700'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['701'] = [];
  _$jscoverage['/editor/dom.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['701'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['702'] = [];
  _$jscoverage['/editor/dom.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['703'] = [];
  _$jscoverage['/editor/dom.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['709'] = [];
  _$jscoverage['/editor/dom.js'].branchData['709'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['723'] = [];
  _$jscoverage['/editor/dom.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['723'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['729'] = [];
  _$jscoverage['/editor/dom.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['732'] = [];
  _$jscoverage['/editor/dom.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['737'] = [];
  _$jscoverage['/editor/dom.js'].branchData['737'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['751'] = [];
  _$jscoverage['/editor/dom.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['751'][2] = new BranchData();
}
_$jscoverage['/editor/dom.js'].branchData['751'][2].init(694, 50, 'innerSibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit275_751_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['751'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['751'][1].init(675, 69, 'innerSibling[0] && innerSibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit274_751_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['737'][1].init(542, 42, 'element._4eIsIdentical(sibling, undefined)');
function visit273_737_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['737'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['732'][1].init(160, 8, '!sibling');
function visit272_732_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['729'][1].init(209, 76, 'sibling.attr(\'_ke_bookmark\') || sibling._4eIsEmptyInlineRemovable(undefined)');
function visit271_729_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['723'][2].init(99, 45, 'sibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit270_723_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['723'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['723'][1].init(88, 56, 'sibling && sibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit269_723_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['709'][1].init(443, 23, 'currentIndex === target');
function visit268_709_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['703'][1].init(57, 40, 'candidate.previousSibling.nodeType === 3');
function visit267_703_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['702'][1].init(56, 98, 'candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit266_702_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['701'][2].init(146, 24, 'candidate.nodeType === 3');
function visit265_701_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['701'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['701'][1].init(51, 155, 'candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit264_701_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['700'][2].init(92, 19, 'normalized === TRUE');
function visit263_700_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['700'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['700'][1].init(92, 207, 'normalized === TRUE && candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit262_700_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['697'][1].init(287, 23, 'j < $.childNodes.length');
function visit261_697_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['690'][1].init(76, 11, '!normalized');
function visit260_690_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['687'][2].init(87, 18, 'i < address.length');
function visit259_687_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['687'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['687'][1].init(82, 23, '$ && i < address.length');
function visit258_687_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['680'][1].init(323, 19, 'dtd && dtd[\'#text\']');
function visit257_680_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['678'][1].init(59, 33, 'xhtmlDtd[name] || xhtmlDtd.span');
function visit256_678_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['677'][1].init(55, 94, '!xhtmlDtd.$nonEditable[name] && (xhtmlDtd[name] || xhtmlDtd.span)');
function visit255_677_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['668'][1].init(1452, 23, 'el.style.cssText !== \'\'');
function visit254_668_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['660'][1].init(181, 18, 'attrValue === NULL');
function visit253_660_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['657'][3].init(76, 20, 'attrName === \'value\'');
function visit252_657_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['657'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['657'][2].init(57, 39, 'attribute.value && attrName === \'value\'');
function visit251_657_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['657'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['657'][1].init(48, 48, 'UA.ie && attribute.value && attrName === \'value\'');
function visit250_657_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['656'][1].init(691, 98, 'attribute.specified || (UA.ie && attribute.value && attrName === \'value\')');
function visit249_656_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['654'][2].init(533, 22, 'attrName === \'checked\'');
function visit248_654_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['654'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['654'][1].init(533, 62, 'attrName === \'checked\' && (attrValue = Dom.attr(el, attrName))');
function visit247_654_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['650'][1].init(418, 26, 'attrName in skipAttributes');
function visit246_650_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['642'][1].init(185, 21, 'n < attributes.length');
function visit245_642_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['640'][1].init(128, 20, 'skipAttributes || {}');
function visit244_640_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['630'][1].init(351, 18, 'removeFromDatabase');
function visit243_630_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['614'][1].init(172, 127, 'element.data(\'list_marker_names\') || (element.data(\'list_marker_names\', {}).data(\'list_marker_names\'))');
function visit242_614_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['612'][1].init(73, 127, 'element.data(\'list_marker_id\') || (element.data(\'list_marker_id\', util.guid()).data(\'list_marker_id\'))');
function visit241_612_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['603'][1].init(69, 32, 'Dom.nodeName(lastChild) !== \'br\'');
function visit240_603_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['602'][2].init(384, 45, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE');
function visit239_602_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['602'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['602'][1].init(34, 102, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit238_602_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['601'][1].init(347, 137, '!lastChild || lastChild.nodeType === Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit237_601_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['597'][2].init(163, 45, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE');
function visit236_597_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['597'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['597'][1].init(33, 80, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE && !util.trim(lastChild.nodeValue)');
function visit235_597_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['596'][1].init(127, 114, 'lastChild && lastChild.nodeType === Dom.NodeType.TEXT_NODE && !util.trim(lastChild.nodeValue)');
function visit234_596_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['585'][1].init(48, 28, 'Dom.nodeName(child) === \'br\'');
function visit233_585_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['584'][2].init(105, 20, 'child.nodeType === 1');
function visit232_584_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['584'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['584'][1].init(33, 77, 'child.nodeType === 1 && Dom.nodeName(child) === \'br\'');
function visit231_584_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['583'][1].init(69, 111, 'child && child.nodeType === 1 && Dom.nodeName(child) === \'br\'');
function visit230_583_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['581'][1].init(873, 6, '!UA.ie');
function visit229_581_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['571'][1].init(309, 31, 'trimmed.length < originalLength');
function visit228_571_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['568'][1].init(169, 8, '!trimmed');
function visit227_568_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['565'][1].init(26, 37, 'child.type === Dom.NodeType.TEXT_NODE');
function visit226_565_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['551'][1].init(311, 31, 'trimmed.length < originalLength');
function visit225_551_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['548'][1].init(171, 8, '!trimmed');
function visit224_548_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['544'][1].init(26, 41, 'child.nodeType === Dom.NodeType.TEXT_NODE');
function visit223_544_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['523'][1].init(26, 16, 'preserveChildren');
function visit222_523_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['522'][1].init(67, 6, 'parent');
function visit221_522_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['511'][2].init(176, 25, 'node !== $documentElement');
function visit220_511_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['511'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['511'][1].init(168, 33, 'node && node !== $documentElement');
function visit219_511_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['500'][1].init(2154, 44, 'addressOfThis.length < addressOfOther.length');
function visit218_500_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['494'][1].init(33, 40, 'addressOfThis[i] < addressOfOther[i]');
function visit217_494_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['493'][1].init(26, 42, 'addressOfThis[i] !== addressOfOther[i]');
function visit216_493_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['492'][1].init(1770, 17, 'i <= minLevel - 1');
function visit215_492_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['479'][1].init(134, 35, 'el.sourceIndex < $other.sourceIndex');
function visit214_479_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['477'][3].init(56, 22, '$other.sourceIndex < 0');
function visit213_477_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['477'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['477'][2].init(34, 18, 'el.sourceIndex < 0');
function visit212_477_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['477'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['477'][1].init(34, 44, 'el.sourceIndex < 0 || $other.sourceIndex < 0');
function visit211_477_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['476'][1].init(346, 19, '\'sourceIndex\' in el');
function visit210_476_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['472'][1].init(184, 24, 'Dom.contains($other, el)');
function visit209_472_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['468'][1].init(26, 24, 'Dom.contains(el, $other)');
function visit208_468_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['467'][1].init(61, 41, '$other.nodeType === NodeType.ELEMENT_NODE');
function visit207_467_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['466'][2].init(479, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit206_466_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['466'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['466'][1].init(479, 103, 'el.nodeType === NodeType.ELEMENT_NODE && $other.nodeType === NodeType.ELEMENT_NODE');
function visit205_466_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['461'][1].init(295, 13, 'el === $other');
function visit204_461_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['455'][1].init(78, 26, 'el.compareDocumentPosition');
function visit203_455_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['440'][1].init(59, 8, 'UA.gecko');
function visit202_440_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['432'][1].init(46, 19, 'attribute.specified');
function visit201_432_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['427'][1].init(439, 24, 'el.getAttribute(\'class\')');
function visit200_427_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['419'][1].init(91, 21, 'i < attributes.length');
function visit199_419_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['416'][1].init(12063, 13, 'UA.ieMode < 9');
function visit198_416_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['407'][1].init(26, 25, 'Dom.contains(start, node)');
function visit197_407_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['400'][1].init(158, 22, 'Dom.contains(node, el)');
function visit196_400_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['396'][1].init(69, 11, 'el === node');
function visit195_396_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['384'][2].init(1463, 26, 'node.nodeType !== nodeType');
function visit194_384_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['384'][1].init(1451, 38, 'nodeType && node.nodeType !== nodeType');
function visit193_384_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['380'][2].init(1350, 21, 'guard(node) === FALSE');
function visit192_380_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['380'][1].init(1341, 30, 'guard && guard(node) === FALSE');
function visit191_380_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['376'][1].init(1256, 5, '!node');
function visit190_376_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['370'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit189_370_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['370'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['370'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit188_370_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['367'][1].init(849, 37, '!node && (parent = parent.parentNode)');
function visit187_367_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['361'][2].init(103, 25, 'guard(el, TRUE) === FALSE');
function visit186_361_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['361'][1].init(65, 34, 'guard && guard(el, TRUE) === FALSE');
function visit185_361_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['360'][2].init(26, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit184_360_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['360'][1].init(26, 100, 'el.nodeType === NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit183_360_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['359'][1].init(557, 5, '!node');
function visit182_359_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['354'][1].init(275, 33, '!startFromSibling && el.lastChild');
function visit181_354_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['350'][1].init(33, 18, 'node !== guardNode');
function visit180_350_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['347'][1].init(22, 20, 'guard && !guard.call');
function visit179_347_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['338'][2].init(1526, 26, 'nodeType !== node.nodeType');
function visit178_338_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['338'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['338'][1].init(1514, 38, 'nodeType && nodeType !== node.nodeType');
function visit177_338_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['334'][2].init(1413, 21, 'guard(node) === FALSE');
function visit176_334_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['334'][1].init(1404, 30, 'guard && guard(node) === FALSE');
function visit175_334_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['330'][1].init(1319, 5, '!node');
function visit174_330_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['324'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit173_324_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['324'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['324'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit172_324_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['321'][1].init(916, 37, '!node && (parent = parent.parentNode)');
function visit171_321_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['315'][2].init(103, 25, 'guard(el, TRUE) === FALSE');
function visit170_315_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['315'][1].init(65, 34, 'guard && guard(el, TRUE) === FALSE');
function visit169_315_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['314'][2].init(26, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit168_314_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['314'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['314'][1].init(26, 100, 'el.nodeType === NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit167_314_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['313'][1].init(628, 5, '!node');
function visit166_313_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['308'][1].init(345, 34, '!startFromSibling && el.firstChild');
function visit165_308_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['304'][1].init(33, 18, 'node !== guardNode');
function visit164_304_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['301'][1].init(92, 20, 'guard && !guard.call');
function visit163_301_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['279'][1].init(1079, 20, '!!(doc.documentMode)');
function visit162_279_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['264'][2].init(405, 30, 'offset === el.nodeValue.length');
function visit161_264_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['264'][1].init(396, 39, 'UA.ie && offset === el.nodeValue.length');
function visit160_264_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['258'][1].init(69, 38, 'el.nodeType !== Dom.NodeType.TEXT_NODE');
function visit159_258_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['247'][1].init(111, 36, 'REMOVE_EMPTY[thisElement.nodeName()]');
function visit158_247_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['226'][1].init(198, 7, 'toStart');
function visit157_226_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['220'][1].init(71, 22, 'thisElement === target');
function visit156_220_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][2].init(418, 35, 'nodeType === Dom.NodeType.TEXT_NODE');
function visit155_209_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][1].init(103, 65, 'nodeType === Dom.NodeType.TEXT_NODE && util.trim(child.nodeValue)');
function visit154_209_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][3].init(312, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit153_208_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][2].init(312, 75, 'nodeType === NodeType.ELEMENT_NODE && !Dom._4eIsEmptyInlineRemovable(child)');
function visit152_208_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['208'][1].init(312, 169, 'nodeType === NodeType.ELEMENT_NODE && !Dom._4eIsEmptyInlineRemovable(child) || nodeType === Dom.NodeType.TEXT_NODE && util.trim(child.nodeValue)');
function visit151_208_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['203'][2].init(126, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit150_203_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['203'][1].init(126, 97, 'nodeType === NodeType.ELEMENT_NODE && child.getAttribute(\'_ke_bookmark\')');
function visit149_203_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['199'][1].init(243, 9, 'i < count');
function visit148_199_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['195'][1].init(22, 49, '!xhtmlDtd.$removeEmpty[Dom.nodeName(thisElement)]');
function visit147_195_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['184'][1].init(51, 60, 'Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit146_184_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['183'][1].init(137, 112, 'attribute.specified && Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit145_183_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['180'][1].init(34, 15, 'i < otherLength');
function visit144_180_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['179'][1].init(1294, 13, 'UA.ieMode < 8');
function visit143_179_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['171'][1].init(47, 60, 'Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit142_171_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['170'][1].init(122, 108, 'attribute.specified && Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit141_170_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['167'][1].init(738, 14, 'i < thisLength');
function visit140_167_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['163'][1].init(619, 26, 'thisLength !== otherLength');
function visit139_163_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['151'][1].init(177, 56, 'Dom.nodeName(thisElement) !== Dom.nodeName(otherElement)');
function visit138_151_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['145'][1].init(22, 13, '!otherElement');
function visit137_145_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['136'][1].init(69, 7, 'toStart');
function visit136_136_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['126'][1].init(423, 16, 'candidate === el');
function visit135_126_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['120'][1].init(53, 40, 'candidate.previousSibling.nodeType === 3');
function visit134_120_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['119'][1].init(52, 94, 'candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit133_119_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][2].init(150, 24, 'candidate.nodeType === 3');
function visit132_118_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][1].init(38, 147, 'candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit131_118_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['117'][1].init(109, 186, 'normalized && candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit130_117_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['113'][1].init(166, 19, 'i < siblings.length');
function visit129_113_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['104'][1].init(124, 90, 'blockBoundaryDisplayMatch[Dom.css(el, \'display\')] || nodeNameMatches[Dom.nodeName(el)]');
function visit128_104_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['98'][2].init(116, 22, 'e1p === el2.parentNode');
function visit127_98_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['98'][1].init(109, 29, 'e1p && e1p === el2.parentNode');
function visit126_98_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['88'][2].init(28, 11, 'el[0] || el');
function visit125_88_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['88'][1].init(21, 19, 'el && (el[0] || el)');
function visit124_88_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/dom.js'].functionData[0]++;
  _$jscoverage['/editor/dom.js'].lineData[11]++;
  var util = require('util');
  _$jscoverage['/editor/dom.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/dom.js'].lineData[13]++;
  var Editor = require('./base');
  _$jscoverage['/editor/dom.js'].lineData[14]++;
  var Utils = require('./utils');
  _$jscoverage['/editor/dom.js'].lineData[15]++;
  var TRUE = true, FALSE = false, NULL = null, xhtmlDtd = Editor.XHTML_DTD, Dom = require('dom'), NodeType = Dom.NodeType, UA = require('ua'), REMOVE_EMPTY = {
  a: 1, 
  abbr: 1, 
  acronym: 1, 
  address: 1, 
  b: 1, 
  bdo: 1, 
  big: 1, 
  cite: 1, 
  code: 1, 
  del: 1, 
  dfn: 1, 
  em: 1, 
  font: 1, 
  i: 1, 
  ins: 1, 
  label: 1, 
  kbd: 1, 
  q: 1, 
  s: 1, 
  samp: 1, 
  small: 1, 
  span: 1, 
  strike: 1, 
  strong: 1, 
  sub: 1, 
  sup: 1, 
  tt: 1, 
  u: 1, 
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
  block: 1, 
  'list-item': 1, 
  table: 1, 
  'table-row-group': 1, 
  'table-header-group': 1, 
  'table-footer-group': 1, 
  'table-row': 1, 
  'table-column-group': 1, 
  'table-column': 1, 
  'table-cell': 1, 
  'table-caption': 1}, blockBoundaryNodeNameMatch = {
  hr: 1}, normalElDom = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[1]++;
  _$jscoverage['/editor/dom.js'].lineData[88]++;
  return visit124_88_1(el && (visit125_88_2(el[0] || el)));
}, normalEl = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[2]++;
  _$jscoverage['/editor/dom.js'].lineData[91]++;
  return new Node(el);
}, editorDom = {
  _4eSameLevel: function(el1, el2) {
  _$jscoverage['/editor/dom.js'].functionData[3]++;
  _$jscoverage['/editor/dom.js'].lineData[96]++;
  el2 = normalElDom(el2);
  _$jscoverage['/editor/dom.js'].lineData[97]++;
  var e1p = el1.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[98]++;
  return visit126_98_1(e1p && visit127_98_2(e1p === el2.parentNode));
}, 
  _4eIsBlockBoundary: function(el, customNodeNames) {
  _$jscoverage['/editor/dom.js'].functionData[4]++;
  _$jscoverage['/editor/dom.js'].lineData[103]++;
  var nodeNameMatches = util.merge(blockBoundaryNodeNameMatch, customNodeNames);
  _$jscoverage['/editor/dom.js'].lineData[104]++;
  return !!(visit128_104_1(blockBoundaryDisplayMatch[Dom.css(el, 'display')] || nodeNameMatches[Dom.nodeName(el)]));
}, 
  _4eIndex: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[5]++;
  _$jscoverage['/editor/dom.js'].lineData[109]++;
  var siblings = el.parentNode.childNodes, candidate, currentIndex = -1;
  _$jscoverage['/editor/dom.js'].lineData[113]++;
  for (var i = 0; visit129_113_1(i < siblings.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[114]++;
    candidate = siblings[i];
    _$jscoverage['/editor/dom.js'].lineData[117]++;
    if (visit130_117_1(normalized && visit131_118_1(visit132_118_2(candidate.nodeType === 3) && visit133_119_1(candidate.previousSibling && visit134_120_1(candidate.previousSibling.nodeType === 3))))) {
      _$jscoverage['/editor/dom.js'].lineData[121]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[124]++;
    currentIndex++;
    _$jscoverage['/editor/dom.js'].lineData[126]++;
    if (visit135_126_1(candidate === el)) {
      _$jscoverage['/editor/dom.js'].lineData[127]++;
      return currentIndex;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[130]++;
  return -1;
}, 
  _4eMove: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[6]++;
  _$jscoverage['/editor/dom.js'].lineData[135]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[136]++;
  if (visit136_136_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[137]++;
    target.insertBefore(thisElement, target.firstChild);
  } else {
    _$jscoverage['/editor/dom.js'].lineData[139]++;
    target.appendChild(thisElement);
  }
}, 
  _4eIsIdentical: function(thisElement, otherElement) {
  _$jscoverage['/editor/dom.js'].functionData[7]++;
  _$jscoverage['/editor/dom.js'].lineData[145]++;
  if (visit137_145_1(!otherElement)) {
    _$jscoverage['/editor/dom.js'].lineData[146]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[149]++;
  otherElement = normalElDom(otherElement);
  _$jscoverage['/editor/dom.js'].lineData[151]++;
  if (visit138_151_1(Dom.nodeName(thisElement) !== Dom.nodeName(otherElement))) {
    _$jscoverage['/editor/dom.js'].lineData[152]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[155]++;
  var thisAttributes = thisElement.attributes, attribute, name, otherAttributes = otherElement.attributes;
  _$jscoverage['/editor/dom.js'].lineData[160]++;
  var thisLength = thisAttributes.length, otherLength = otherAttributes.length;
  _$jscoverage['/editor/dom.js'].lineData[163]++;
  if (visit139_163_1(thisLength !== otherLength)) {
    _$jscoverage['/editor/dom.js'].lineData[164]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[167]++;
  for (var i = 0; visit140_167_1(i < thisLength); i++) {
    _$jscoverage['/editor/dom.js'].lineData[168]++;
    attribute = thisAttributes[i];
    _$jscoverage['/editor/dom.js'].lineData[169]++;
    name = attribute.name;
    _$jscoverage['/editor/dom.js'].lineData[170]++;
    if (visit141_170_1(attribute.specified && visit142_171_1(Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)))) {
      _$jscoverage['/editor/dom.js'].lineData[172]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[179]++;
  if (visit143_179_1(UA.ieMode < 8)) {
    _$jscoverage['/editor/dom.js'].lineData[180]++;
    for (i = 0; visit144_180_1(i < otherLength); i++) {
      _$jscoverage['/editor/dom.js'].lineData[181]++;
      attribute = otherAttributes[i];
      _$jscoverage['/editor/dom.js'].lineData[182]++;
      name = attribute.name;
      _$jscoverage['/editor/dom.js'].lineData[183]++;
      if (visit145_183_1(attribute.specified && visit146_184_1(Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)))) {
        _$jscoverage['/editor/dom.js'].lineData[185]++;
        return FALSE;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[190]++;
  return TRUE;
}, 
  _4eIsEmptyInlineRemovable: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[8]++;
  _$jscoverage['/editor/dom.js'].lineData[195]++;
  if (visit147_195_1(!xhtmlDtd.$removeEmpty[Dom.nodeName(thisElement)])) {
    _$jscoverage['/editor/dom.js'].lineData[196]++;
    return false;
  }
  _$jscoverage['/editor/dom.js'].lineData[198]++;
  var children = thisElement.childNodes;
  _$jscoverage['/editor/dom.js'].lineData[199]++;
  for (var i = 0, count = children.length; visit148_199_1(i < count); i++) {
    _$jscoverage['/editor/dom.js'].lineData[200]++;
    var child = children[i], nodeType = child.nodeType;
    _$jscoverage['/editor/dom.js'].lineData[203]++;
    if (visit149_203_1(visit150_203_2(nodeType === NodeType.ELEMENT_NODE) && child.getAttribute('_ke_bookmark'))) {
      _$jscoverage['/editor/dom.js'].lineData[205]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[208]++;
    if (visit151_208_1(visit152_208_2(visit153_208_3(nodeType === NodeType.ELEMENT_NODE) && !Dom._4eIsEmptyInlineRemovable(child)) || visit154_209_1(visit155_209_2(nodeType === Dom.NodeType.TEXT_NODE) && util.trim(child.nodeValue)))) {
      _$jscoverage['/editor/dom.js'].lineData[210]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[213]++;
  return TRUE;
}, 
  _4eMoveChildren: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[9]++;
  _$jscoverage['/editor/dom.js'].lineData[218]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[220]++;
  if (visit156_220_1(thisElement === target)) {
    _$jscoverage['/editor/dom.js'].lineData[221]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[224]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[226]++;
  if (visit157_226_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[227]++;
    while ((child = thisElement.lastChild)) {
      _$jscoverage['/editor/dom.js'].lineData[228]++;
      target.insertBefore(thisElement.removeChild(child), target.firstChild);
    }
  } else {
    _$jscoverage['/editor/dom.js'].lineData[231]++;
    while ((child = thisElement.firstChild)) {
      _$jscoverage['/editor/dom.js'].lineData[232]++;
      target.appendChild(thisElement.removeChild(child));
    }
  }
}, 
  _4eMergeSiblings: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[10]++;
  _$jscoverage['/editor/dom.js'].lineData[245]++;
  thisElement = normalEl(thisElement);
  _$jscoverage['/editor/dom.js'].lineData[247]++;
  if (visit158_247_1(REMOVE_EMPTY[thisElement.nodeName()])) {
    _$jscoverage['/editor/dom.js'].lineData[248]++;
    mergeElements(thisElement, TRUE);
    _$jscoverage['/editor/dom.js'].lineData[249]++;
    mergeElements(thisElement);
  }
}, 
  _4eSplitText: function(el, offset) {
  _$jscoverage['/editor/dom.js'].functionData[11]++;
  _$jscoverage['/editor/dom.js'].lineData[256]++;
  var doc = el.ownerDocument;
  _$jscoverage['/editor/dom.js'].lineData[258]++;
  if (visit159_258_1(el.nodeType !== Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/dom.js'].lineData[259]++;
    return undefined;
  }
  _$jscoverage['/editor/dom.js'].lineData[264]++;
  if (visit160_264_1(UA.ie && visit161_264_2(offset === el.nodeValue.length))) {
    _$jscoverage['/editor/dom.js'].lineData[265]++;
    var next = doc.createTextNode('');
    _$jscoverage['/editor/dom.js'].lineData[266]++;
    Dom.insertAfter(next, el);
    _$jscoverage['/editor/dom.js'].lineData[267]++;
    return next;
  }
  _$jscoverage['/editor/dom.js'].lineData[270]++;
  var ret = el.splitText(offset);
  _$jscoverage['/editor/dom.js'].lineData[279]++;
  if (visit162_279_1(!!(doc.documentMode))) {
    _$jscoverage['/editor/dom.js'].lineData[280]++;
    var workaround = doc.createTextNode('');
    _$jscoverage['/editor/dom.js'].lineData[281]++;
    Dom.insertAfter(workaround, ret);
    _$jscoverage['/editor/dom.js'].lineData[282]++;
    Dom.remove(workaround);
  }
  _$jscoverage['/editor/dom.js'].lineData[285]++;
  return ret;
}, 
  _4eParents: function(node, closerFirst) {
  _$jscoverage['/editor/dom.js'].functionData[12]++;
  _$jscoverage['/editor/dom.js'].lineData[290]++;
  var parents = [];
  _$jscoverage['/editor/dom.js'].lineData[291]++;
  parents.__IS_NODELIST = 1;
  _$jscoverage['/editor/dom.js'].lineData[292]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[293]++;
    parents[closerFirst ? 'push' : 'unshift'](node);
  } while ((node = node.parentNode));
  _$jscoverage['/editor/dom.js'].lineData[295]++;
  return parents;
}, 
  _4eNextSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[13]++;
  _$jscoverage['/editor/dom.js'].lineData[301]++;
  if (visit163_301_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[302]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[303]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[14]++;
  _$jscoverage['/editor/dom.js'].lineData[304]++;
  return visit164_304_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[308]++;
  var node = visit165_308_1(!startFromSibling && el.firstChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[313]++;
  if (visit166_313_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[314]++;
    if (visit167_314_1(visit168_314_2(el.nodeType === NodeType.ELEMENT_NODE) && visit169_315_1(guard && visit170_315_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[316]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[318]++;
    node = el.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[321]++;
  while (visit171_321_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[324]++;
    if (visit172_324_1(guard && visit173_324_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[325]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[327]++;
    node = parent.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[330]++;
  if (visit174_330_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[331]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[334]++;
  if (visit175_334_1(guard && visit176_334_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[335]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[338]++;
  if (visit177_338_1(nodeType && visit178_338_2(nodeType !== node.nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[339]++;
    return Dom._4eNextSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[342]++;
  return node;
}, 
  _4ePreviousSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[15]++;
  _$jscoverage['/editor/dom.js'].lineData[347]++;
  if (visit179_347_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[348]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[349]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[16]++;
  _$jscoverage['/editor/dom.js'].lineData[350]++;
  return visit180_350_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[354]++;
  var node = visit181_354_1(!startFromSibling && el.lastChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[359]++;
  if (visit182_359_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[360]++;
    if (visit183_360_1(visit184_360_2(el.nodeType === NodeType.ELEMENT_NODE) && visit185_361_1(guard && visit186_361_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[362]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[364]++;
    node = el.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[367]++;
  while (visit187_367_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[370]++;
    if (visit188_370_1(guard && visit189_370_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[371]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[373]++;
    node = parent.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[376]++;
  if (visit190_376_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[377]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[380]++;
  if (visit191_380_1(guard && visit192_380_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[381]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[384]++;
  if (visit193_384_1(nodeType && visit194_384_2(node.nodeType !== nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[385]++;
    return Dom._4ePreviousSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[388]++;
  return node;
}, 
  _4eCommonAncestor: function(el, node) {
  _$jscoverage['/editor/dom.js'].functionData[17]++;
  _$jscoverage['/editor/dom.js'].lineData[394]++;
  node = normalElDom(node);
  _$jscoverage['/editor/dom.js'].lineData[396]++;
  if (visit195_396_1(el === node)) {
    _$jscoverage['/editor/dom.js'].lineData[397]++;
    return el;
  }
  _$jscoverage['/editor/dom.js'].lineData[400]++;
  if (visit196_400_1(Dom.contains(node, el))) {
    _$jscoverage['/editor/dom.js'].lineData[401]++;
    return node;
  }
  _$jscoverage['/editor/dom.js'].lineData[404]++;
  var start = el;
  _$jscoverage['/editor/dom.js'].lineData[406]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[407]++;
    if (visit197_407_1(Dom.contains(start, node))) {
      _$jscoverage['/editor/dom.js'].lineData[408]++;
      return start;
    }
  } while ((start = start.parentNode));
  _$jscoverage['/editor/dom.js'].lineData[412]++;
  return NULL;
}, 
  _4eHasAttributes: visit198_416_1(UA.ieMode < 9) ? function(el) {
  _$jscoverage['/editor/dom.js'].functionData[18]++;
  _$jscoverage['/editor/dom.js'].lineData[418]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[419]++;
  for (var i = 0; visit199_419_1(i < attributes.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[420]++;
    var attribute = attributes[i];
    _$jscoverage['/editor/dom.js'].lineData[421]++;
    switch (attribute.name) {
      case 'class':
        _$jscoverage['/editor/dom.js'].lineData[427]++;
        if (visit200_427_1(el.getAttribute('class'))) {
          _$jscoverage['/editor/dom.js'].lineData[428]++;
          return TRUE;
        }
        _$jscoverage['/editor/dom.js'].lineData[430]++;
        break;
      default:
        _$jscoverage['/editor/dom.js'].lineData[432]++;
        if (visit201_432_1(attribute.specified)) {
          _$jscoverage['/editor/dom.js'].lineData[433]++;
          return TRUE;
        }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[437]++;
  return FALSE;
} : function(el) {
  _$jscoverage['/editor/dom.js'].functionData[19]++;
  _$jscoverage['/editor/dom.js'].lineData[440]++;
  if (visit202_440_1(UA.gecko)) {
    _$jscoverage['/editor/dom.js'].lineData[441]++;
    el.removeAttribute('_moz_dirty');
  }
  _$jscoverage['/editor/dom.js'].lineData[445]++;
  return el.hasAttributes();
}, 
  _4ePosition: function(el, otherNode) {
  _$jscoverage['/editor/dom.js'].functionData[20]++;
  _$jscoverage['/editor/dom.js'].lineData[453]++;
  var $other = normalElDom(otherNode);
  _$jscoverage['/editor/dom.js'].lineData[455]++;
  if (visit203_455_1(el.compareDocumentPosition)) {
    _$jscoverage['/editor/dom.js'].lineData[456]++;
    return el.compareDocumentPosition($other);
  }
  _$jscoverage['/editor/dom.js'].lineData[461]++;
  if (visit204_461_1(el === $other)) {
    _$jscoverage['/editor/dom.js'].lineData[462]++;
    return KEP.POSITION_IDENTICAL;
  }
  _$jscoverage['/editor/dom.js'].lineData[466]++;
  if (visit205_466_1(visit206_466_2(el.nodeType === NodeType.ELEMENT_NODE) && visit207_467_1($other.nodeType === NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/dom.js'].lineData[468]++;
    if (visit208_468_1(Dom.contains(el, $other))) {
      _$jscoverage['/editor/dom.js'].lineData[469]++;
      return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
    }
    _$jscoverage['/editor/dom.js'].lineData[472]++;
    if (visit209_472_1(Dom.contains($other, el))) {
      _$jscoverage['/editor/dom.js'].lineData[473]++;
      return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
    }
    _$jscoverage['/editor/dom.js'].lineData[476]++;
    if (visit210_476_1('sourceIndex' in el)) {
      _$jscoverage['/editor/dom.js'].lineData[477]++;
      return (visit211_477_1(visit212_477_2(el.sourceIndex < 0) || visit213_477_3($other.sourceIndex < 0))) ? KEP.POSITION_DISCONNECTED : (visit214_479_1(el.sourceIndex < $other.sourceIndex)) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[487]++;
  var addressOfThis = Dom._4eAddress(el), addressOfOther = Dom._4eAddress($other), minLevel = Math.min(addressOfThis.length, addressOfOther.length);
  _$jscoverage['/editor/dom.js'].lineData[492]++;
  for (var i = 0; visit215_492_1(i <= minLevel - 1); i++) {
    _$jscoverage['/editor/dom.js'].lineData[493]++;
    if (visit216_493_1(addressOfThis[i] !== addressOfOther[i])) {
      _$jscoverage['/editor/dom.js'].lineData[494]++;
      return visit217_494_1(addressOfThis[i] < addressOfOther[i]) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[500]++;
  return (visit218_500_1(addressOfThis.length < addressOfOther.length)) ? KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING : KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
}, 
  _4eAddress: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[21]++;
  _$jscoverage['/editor/dom.js'].lineData[507]++;
  var address = [], $documentElement = el.ownerDocument.documentElement, node = el;
  _$jscoverage['/editor/dom.js'].lineData[511]++;
  while (visit219_511_1(node && visit220_511_2(node !== $documentElement))) {
    _$jscoverage['/editor/dom.js'].lineData[512]++;
    address.unshift(Dom._4eIndex(node, normalized));
    _$jscoverage['/editor/dom.js'].lineData[513]++;
    node = node.parentNode;
  }
  _$jscoverage['/editor/dom.js'].lineData[516]++;
  return address;
}, 
  _4eRemove: function(el, preserveChildren) {
  _$jscoverage['/editor/dom.js'].functionData[22]++;
  _$jscoverage['/editor/dom.js'].lineData[521]++;
  var parent = el.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[522]++;
  if (visit221_522_1(parent)) {
    _$jscoverage['/editor/dom.js'].lineData[523]++;
    if (visit222_523_1(preserveChildren)) {
      _$jscoverage['/editor/dom.js'].lineData[525]++;
      for (var child; (child = el.firstChild); ) {
        _$jscoverage['/editor/dom.js'].lineData[526]++;
        parent.insertBefore(el.removeChild(child), el);
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[529]++;
    parent.removeChild(el);
  }
  _$jscoverage['/editor/dom.js'].lineData[531]++;
  return el;
}, 
  _4eTrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[23]++;
  _$jscoverage['/editor/dom.js'].lineData[536]++;
  Dom._4eLtrim(el);
  _$jscoverage['/editor/dom.js'].lineData[537]++;
  Dom._4eRtrim(el);
}, 
  _4eLtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[24]++;
  _$jscoverage['/editor/dom.js'].lineData[542]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[543]++;
  while ((child = el.firstChild)) {
    _$jscoverage['/editor/dom.js'].lineData[544]++;
    if (visit223_544_1(child.nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[545]++;
      var trimmed = Utils.ltrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[548]++;
      if (visit224_548_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[549]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[550]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[551]++;
        if (visit225_551_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[552]++;
          Dom._4eSplitText(child, originalLength - trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[554]++;
          el.removeChild(el.firstChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[557]++;
    break;
  }
}, 
  _4eRtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[25]++;
  _$jscoverage['/editor/dom.js'].lineData[563]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[564]++;
  while ((child = el.lastChild)) {
    _$jscoverage['/editor/dom.js'].lineData[565]++;
    if (visit226_565_1(child.type === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[566]++;
      var trimmed = Utils.rtrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[568]++;
      if (visit227_568_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[569]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[570]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[571]++;
        if (visit228_571_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[572]++;
          Dom._4eSplitText(child, trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[575]++;
          el.removeChild(el.lastChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[578]++;
    break;
  }
  _$jscoverage['/editor/dom.js'].lineData[581]++;
  if (visit229_581_1(!UA.ie)) {
    _$jscoverage['/editor/dom.js'].lineData[582]++;
    child = el.lastChild;
    _$jscoverage['/editor/dom.js'].lineData[583]++;
    if (visit230_583_1(child && visit231_584_1(visit232_584_2(child.nodeType === 1) && visit233_585_1(Dom.nodeName(child) === 'br')))) {
      _$jscoverage['/editor/dom.js'].lineData[586]++;
      el.removeChild(child);
    }
  }
}, 
  _4eAppendBogus: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[26]++;
  _$jscoverage['/editor/dom.js'].lineData[593]++;
  var lastChild = el.lastChild, bogus;
  _$jscoverage['/editor/dom.js'].lineData[596]++;
  while (visit234_596_1(lastChild && visit235_597_1(visit236_597_2(lastChild.nodeType === Dom.NodeType.TEXT_NODE) && !util.trim(lastChild.nodeValue)))) {
    _$jscoverage['/editor/dom.js'].lineData[598]++;
    lastChild = lastChild.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[601]++;
  if (visit237_601_1(!lastChild || visit238_602_1(visit239_602_2(lastChild.nodeType === Dom.NodeType.TEXT_NODE) || visit240_603_1(Dom.nodeName(lastChild) !== 'br')))) {
    _$jscoverage['/editor/dom.js'].lineData[604]++;
    bogus = el.ownerDocument.createElement('br');
    _$jscoverage['/editor/dom.js'].lineData[605]++;
    el.appendChild(bogus);
  }
}, 
  _4eSetMarker: function(element, database, name, value) {
  _$jscoverage['/editor/dom.js'].functionData[27]++;
  _$jscoverage['/editor/dom.js'].lineData[611]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[612]++;
  var id = visit241_612_1(element.data('list_marker_id') || (element.data('list_marker_id', util.guid()).data('list_marker_id'))), markerNames = visit242_614_1(element.data('list_marker_names') || (element.data('list_marker_names', {}).data('list_marker_names')));
  _$jscoverage['/editor/dom.js'].lineData[616]++;
  database[id] = element;
  _$jscoverage['/editor/dom.js'].lineData[617]++;
  markerNames[name] = 1;
  _$jscoverage['/editor/dom.js'].lineData[618]++;
  return element.data(name, value);
}, 
  _4eClearMarkers: function(element, database, removeFromDatabase) {
  _$jscoverage['/editor/dom.js'].functionData[28]++;
  _$jscoverage['/editor/dom.js'].lineData[623]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[624]++;
  var names = element.data('list_marker_names'), id = element.data('list_marker_id');
  _$jscoverage['/editor/dom.js'].lineData[626]++;
  for (var i in names) {
    _$jscoverage['/editor/dom.js'].lineData[627]++;
    element.removeData(i);
  }
  _$jscoverage['/editor/dom.js'].lineData[629]++;
  element.removeData('list_marker_names');
  _$jscoverage['/editor/dom.js'].lineData[630]++;
  if (visit243_630_1(removeFromDatabase)) {
    _$jscoverage['/editor/dom.js'].lineData[631]++;
    element.removeData('list_marker_id');
    _$jscoverage['/editor/dom.js'].lineData[632]++;
    delete database[id];
  }
}, 
  _4eCopyAttributes: function(el, target, skipAttributes) {
  _$jscoverage['/editor/dom.js'].functionData[29]++;
  _$jscoverage['/editor/dom.js'].lineData[638]++;
  target = normalEl(target);
  _$jscoverage['/editor/dom.js'].lineData[639]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[640]++;
  skipAttributes = visit244_640_1(skipAttributes || {});
  _$jscoverage['/editor/dom.js'].lineData[642]++;
  for (var n = 0; visit245_642_1(n < attributes.length); n++) {
    _$jscoverage['/editor/dom.js'].lineData[645]++;
    var attribute = attributes[n], attrName = attribute.name.toLowerCase(), attrValue;
    _$jscoverage['/editor/dom.js'].lineData[650]++;
    if (visit246_650_1(attrName in skipAttributes)) {
      _$jscoverage['/editor/dom.js'].lineData[651]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[654]++;
    if (visit247_654_1(visit248_654_2(attrName === 'checked') && (attrValue = Dom.attr(el, attrName)))) {
      _$jscoverage['/editor/dom.js'].lineData[655]++;
      target.attr(attrName, attrValue);
    } else {
      _$jscoverage['/editor/dom.js'].lineData[656]++;
      if (visit249_656_1(attribute.specified || (visit250_657_1(UA.ie && visit251_657_2(attribute.value && visit252_657_3(attrName === 'value')))))) {
        _$jscoverage['/editor/dom.js'].lineData[659]++;
        attrValue = Dom.attr(el, attrName);
        _$jscoverage['/editor/dom.js'].lineData[660]++;
        if (visit253_660_1(attrValue === NULL)) {
          _$jscoverage['/editor/dom.js'].lineData[661]++;
          attrValue = attribute.nodeValue;
        }
        _$jscoverage['/editor/dom.js'].lineData[663]++;
        target.attr(attrName, attrValue);
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[668]++;
  if (visit254_668_1(el.style.cssText !== '')) {
    _$jscoverage['/editor/dom.js'].lineData[669]++;
    target[0].style.cssText = el.style.cssText;
  }
}, 
  _4eIsEditable: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[30]++;
  _$jscoverage['/editor/dom.js'].lineData[676]++;
  var name = Dom.nodeName(el), dtd = visit255_677_1(!xhtmlDtd.$nonEditable[name] && (visit256_678_1(xhtmlDtd[name] || xhtmlDtd.span)));
  _$jscoverage['/editor/dom.js'].lineData[680]++;
  return visit257_680_1(dtd && dtd['#text']);
}, 
  _4eGetByAddress: function(doc, address, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[31]++;
  _$jscoverage['/editor/dom.js'].lineData[685]++;
  var $ = doc.documentElement;
  _$jscoverage['/editor/dom.js'].lineData[687]++;
  for (var i = 0; visit258_687_1($ && visit259_687_2(i < address.length)); i++) {
    _$jscoverage['/editor/dom.js'].lineData[688]++;
    var target = address[i];
    _$jscoverage['/editor/dom.js'].lineData[690]++;
    if (visit260_690_1(!normalized)) {
      _$jscoverage['/editor/dom.js'].lineData[691]++;
      $ = $.childNodes[target];
      _$jscoverage['/editor/dom.js'].lineData[692]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[695]++;
    var currentIndex = -1;
    _$jscoverage['/editor/dom.js'].lineData[697]++;
    for (var j = 0; visit261_697_1(j < $.childNodes.length); j++) {
      _$jscoverage['/editor/dom.js'].lineData[698]++;
      var candidate = $.childNodes[j];
      _$jscoverage['/editor/dom.js'].lineData[700]++;
      if (visit262_700_1(visit263_700_2(normalized === TRUE) && visit264_701_1(visit265_701_2(candidate.nodeType === 3) && visit266_702_1(candidate.previousSibling && visit267_703_1(candidate.previousSibling.nodeType === 3))))) {
        _$jscoverage['/editor/dom.js'].lineData[704]++;
        continue;
      }
      _$jscoverage['/editor/dom.js'].lineData[707]++;
      currentIndex++;
      _$jscoverage['/editor/dom.js'].lineData[709]++;
      if (visit268_709_1(currentIndex === target)) {
        _$jscoverage['/editor/dom.js'].lineData[710]++;
        $ = candidate;
        _$jscoverage['/editor/dom.js'].lineData[711]++;
        break;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[716]++;
  return $;
}};
  _$jscoverage['/editor/dom.js'].lineData[720]++;
  function mergeElements(element, isNext) {
    _$jscoverage['/editor/dom.js'].functionData[32]++;
    _$jscoverage['/editor/dom.js'].lineData[721]++;
    var sibling = element[isNext ? 'next' : 'prev'](undefined, 1);
    _$jscoverage['/editor/dom.js'].lineData[723]++;
    if (visit269_723_1(sibling && visit270_723_2(sibling[0].nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom.js'].lineData[727]++;
      var pendingNodes = [];
      _$jscoverage['/editor/dom.js'].lineData[729]++;
      while (visit271_729_1(sibling.attr('_ke_bookmark') || sibling._4eIsEmptyInlineRemovable(undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[730]++;
        pendingNodes.push(sibling);
        _$jscoverage['/editor/dom.js'].lineData[731]++;
        sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
        _$jscoverage['/editor/dom.js'].lineData[732]++;
        if (visit272_732_1(!sibling)) {
          _$jscoverage['/editor/dom.js'].lineData[733]++;
          return;
        }
      }
      _$jscoverage['/editor/dom.js'].lineData[737]++;
      if (visit273_737_1(element._4eIsIdentical(sibling, undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[740]++;
        var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);
        _$jscoverage['/editor/dom.js'].lineData[743]++;
        while (pendingNodes.length) {
          _$jscoverage['/editor/dom.js'].lineData[744]++;
          pendingNodes.shift()._4eMove(element, !isNext, undefined);
        }
        _$jscoverage['/editor/dom.js'].lineData[747]++;
        sibling._4eMoveChildren(element, !isNext, undefined);
        _$jscoverage['/editor/dom.js'].lineData[748]++;
        sibling.remove();
        _$jscoverage['/editor/dom.js'].lineData[751]++;
        if (visit274_751_1(innerSibling[0] && visit275_751_2(innerSibling[0].nodeType === NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/dom.js'].lineData[752]++;
          innerSibling._4eMergeSiblings();
        }
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[758]++;
  Utils.injectDom(editorDom);
});
