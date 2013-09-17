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
  _$jscoverage['/editor/dom.js'].lineData[55] = 0;
  _$jscoverage['/editor/dom.js'].lineData[63] = 0;
  _$jscoverage['/editor/dom.js'].lineData[71] = 0;
  _$jscoverage['/editor/dom.js'].lineData[86] = 0;
  _$jscoverage['/editor/dom.js'].lineData[89] = 0;
  _$jscoverage['/editor/dom.js'].lineData[94] = 0;
  _$jscoverage['/editor/dom.js'].lineData[95] = 0;
  _$jscoverage['/editor/dom.js'].lineData[96] = 0;
  _$jscoverage['/editor/dom.js'].lineData[101] = 0;
  _$jscoverage['/editor/dom.js'].lineData[102] = 0;
  _$jscoverage['/editor/dom.js'].lineData[107] = 0;
  _$jscoverage['/editor/dom.js'].lineData[111] = 0;
  _$jscoverage['/editor/dom.js'].lineData[112] = 0;
  _$jscoverage['/editor/dom.js'].lineData[115] = 0;
  _$jscoverage['/editor/dom.js'].lineData[119] = 0;
  _$jscoverage['/editor/dom.js'].lineData[122] = 0;
  _$jscoverage['/editor/dom.js'].lineData[124] = 0;
  _$jscoverage['/editor/dom.js'].lineData[125] = 0;
  _$jscoverage['/editor/dom.js'].lineData[128] = 0;
  _$jscoverage['/editor/dom.js'].lineData[134] = 0;
  _$jscoverage['/editor/dom.js'].lineData[135] = 0;
  _$jscoverage['/editor/dom.js'].lineData[136] = 0;
  _$jscoverage['/editor/dom.js'].lineData[138] = 0;
  _$jscoverage['/editor/dom.js'].lineData[145] = 0;
  _$jscoverage['/editor/dom.js'].lineData[146] = 0;
  _$jscoverage['/editor/dom.js'].lineData[149] = 0;
  _$jscoverage['/editor/dom.js'].lineData[151] = 0;
  _$jscoverage['/editor/dom.js'].lineData[152] = 0;
  _$jscoverage['/editor/dom.js'].lineData[155] = 0;
  _$jscoverage['/editor/dom.js'].lineData[158] = 0;
  _$jscoverage['/editor/dom.js'].lineData[161] = 0;
  _$jscoverage['/editor/dom.js'].lineData[162] = 0;
  _$jscoverage['/editor/dom.js'].lineData[165] = 0;
  _$jscoverage['/editor/dom.js'].lineData[166] = 0;
  _$jscoverage['/editor/dom.js'].lineData[168] = 0;
  _$jscoverage['/editor/dom.js'].lineData[170] = 0;
  _$jscoverage['/editor/dom.js'].lineData[177] = 0;
  _$jscoverage['/editor/dom.js'].lineData[178] = 0;
  _$jscoverage['/editor/dom.js'].lineData[179] = 0;
  _$jscoverage['/editor/dom.js'].lineData[180] = 0;
  _$jscoverage['/editor/dom.js'].lineData[181] = 0;
  _$jscoverage['/editor/dom.js'].lineData[183] = 0;
  _$jscoverage['/editor/dom.js'].lineData[188] = 0;
  _$jscoverage['/editor/dom.js'].lineData[193] = 0;
  _$jscoverage['/editor/dom.js'].lineData[194] = 0;
  _$jscoverage['/editor/dom.js'].lineData[196] = 0;
  _$jscoverage['/editor/dom.js'].lineData[197] = 0;
  _$jscoverage['/editor/dom.js'].lineData[198] = 0;
  _$jscoverage['/editor/dom.js'].lineData[201] = 0;
  _$jscoverage['/editor/dom.js'].lineData[203] = 0;
  _$jscoverage['/editor/dom.js'].lineData[206] = 0;
  _$jscoverage['/editor/dom.js'].lineData[208] = 0;
  _$jscoverage['/editor/dom.js'].lineData[211] = 0;
  _$jscoverage['/editor/dom.js'].lineData[216] = 0;
  _$jscoverage['/editor/dom.js'].lineData[218] = 0;
  _$jscoverage['/editor/dom.js'].lineData[219] = 0;
  _$jscoverage['/editor/dom.js'].lineData[222] = 0;
  _$jscoverage['/editor/dom.js'].lineData[224] = 0;
  _$jscoverage['/editor/dom.js'].lineData[225] = 0;
  _$jscoverage['/editor/dom.js'].lineData[226] = 0;
  _$jscoverage['/editor/dom.js'].lineData[229] = 0;
  _$jscoverage['/editor/dom.js'].lineData[230] = 0;
  _$jscoverage['/editor/dom.js'].lineData[243] = 0;
  _$jscoverage['/editor/dom.js'].lineData[245] = 0;
  _$jscoverage['/editor/dom.js'].lineData[246] = 0;
  _$jscoverage['/editor/dom.js'].lineData[247] = 0;
  _$jscoverage['/editor/dom.js'].lineData[254] = 0;
  _$jscoverage['/editor/dom.js'].lineData[256] = 0;
  _$jscoverage['/editor/dom.js'].lineData[257] = 0;
  _$jscoverage['/editor/dom.js'].lineData[262] = 0;
  _$jscoverage['/editor/dom.js'].lineData[263] = 0;
  _$jscoverage['/editor/dom.js'].lineData[264] = 0;
  _$jscoverage['/editor/dom.js'].lineData[265] = 0;
  _$jscoverage['/editor/dom.js'].lineData[268] = 0;
  _$jscoverage['/editor/dom.js'].lineData[277] = 0;
  _$jscoverage['/editor/dom.js'].lineData[278] = 0;
  _$jscoverage['/editor/dom.js'].lineData[279] = 0;
  _$jscoverage['/editor/dom.js'].lineData[280] = 0;
  _$jscoverage['/editor/dom.js'].lineData[283] = 0;
  _$jscoverage['/editor/dom.js'].lineData[289] = 0;
  _$jscoverage['/editor/dom.js'].lineData[290] = 0;
  _$jscoverage['/editor/dom.js'].lineData[291] = 0;
  _$jscoverage['/editor/dom.js'].lineData[292] = 0;
  _$jscoverage['/editor/dom.js'].lineData[294] = 0;
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
  _$jscoverage['/editor/dom.js'].lineData[348] = 0;
  _$jscoverage['/editor/dom.js'].lineData[349] = 0;
  _$jscoverage['/editor/dom.js'].lineData[350] = 0;
  _$jscoverage['/editor/dom.js'].lineData[351] = 0;
  _$jscoverage['/editor/dom.js'].lineData[355] = 0;
  _$jscoverage['/editor/dom.js'].lineData[360] = 0;
  _$jscoverage['/editor/dom.js'].lineData[361] = 0;
  _$jscoverage['/editor/dom.js'].lineData[363] = 0;
  _$jscoverage['/editor/dom.js'].lineData[365] = 0;
  _$jscoverage['/editor/dom.js'].lineData[368] = 0;
  _$jscoverage['/editor/dom.js'].lineData[371] = 0;
  _$jscoverage['/editor/dom.js'].lineData[372] = 0;
  _$jscoverage['/editor/dom.js'].lineData[373] = 0;
  _$jscoverage['/editor/dom.js'].lineData[376] = 0;
  _$jscoverage['/editor/dom.js'].lineData[377] = 0;
  _$jscoverage['/editor/dom.js'].lineData[380] = 0;
  _$jscoverage['/editor/dom.js'].lineData[381] = 0;
  _$jscoverage['/editor/dom.js'].lineData[384] = 0;
  _$jscoverage['/editor/dom.js'].lineData[385] = 0;
  _$jscoverage['/editor/dom.js'].lineData[388] = 0;
  _$jscoverage['/editor/dom.js'].lineData[395] = 0;
  _$jscoverage['/editor/dom.js'].lineData[397] = 0;
  _$jscoverage['/editor/dom.js'].lineData[398] = 0;
  _$jscoverage['/editor/dom.js'].lineData[401] = 0;
  _$jscoverage['/editor/dom.js'].lineData[402] = 0;
  _$jscoverage['/editor/dom.js'].lineData[405] = 0;
  _$jscoverage['/editor/dom.js'].lineData[407] = 0;
  _$jscoverage['/editor/dom.js'].lineData[408] = 0;
  _$jscoverage['/editor/dom.js'].lineData[409] = 0;
  _$jscoverage['/editor/dom.js'].lineData[413] = 0;
  _$jscoverage['/editor/dom.js'].lineData[419] = 0;
  _$jscoverage['/editor/dom.js'].lineData[420] = 0;
  _$jscoverage['/editor/dom.js'].lineData[421] = 0;
  _$jscoverage['/editor/dom.js'].lineData[422] = 0;
  _$jscoverage['/editor/dom.js'].lineData[428] = 0;
  _$jscoverage['/editor/dom.js'].lineData[429] = 0;
  _$jscoverage['/editor/dom.js'].lineData[431] = 0;
  _$jscoverage['/editor/dom.js'].lineData[433] = 0;
  _$jscoverage['/editor/dom.js'].lineData[434] = 0;
  _$jscoverage['/editor/dom.js'].lineData[438] = 0;
  _$jscoverage['/editor/dom.js'].lineData[441] = 0;
  _$jscoverage['/editor/dom.js'].lineData[442] = 0;
  _$jscoverage['/editor/dom.js'].lineData[446] = 0;
  _$jscoverage['/editor/dom.js'].lineData[454] = 0;
  _$jscoverage['/editor/dom.js'].lineData[456] = 0;
  _$jscoverage['/editor/dom.js'].lineData[457] = 0;
  _$jscoverage['/editor/dom.js'].lineData[462] = 0;
  _$jscoverage['/editor/dom.js'].lineData[463] = 0;
  _$jscoverage['/editor/dom.js'].lineData[467] = 0;
  _$jscoverage['/editor/dom.js'].lineData[469] = 0;
  _$jscoverage['/editor/dom.js'].lineData[470] = 0;
  _$jscoverage['/editor/dom.js'].lineData[473] = 0;
  _$jscoverage['/editor/dom.js'].lineData[474] = 0;
  _$jscoverage['/editor/dom.js'].lineData[477] = 0;
  _$jscoverage['/editor/dom.js'].lineData[478] = 0;
  _$jscoverage['/editor/dom.js'].lineData[488] = 0;
  _$jscoverage['/editor/dom.js'].lineData[493] = 0;
  _$jscoverage['/editor/dom.js'].lineData[494] = 0;
  _$jscoverage['/editor/dom.js'].lineData[495] = 0;
  _$jscoverage['/editor/dom.js'].lineData[501] = 0;
  _$jscoverage['/editor/dom.js'].lineData[509] = 0;
  _$jscoverage['/editor/dom.js'].lineData[513] = 0;
  _$jscoverage['/editor/dom.js'].lineData[514] = 0;
  _$jscoverage['/editor/dom.js'].lineData[515] = 0;
  _$jscoverage['/editor/dom.js'].lineData[518] = 0;
  _$jscoverage['/editor/dom.js'].lineData[524] = 0;
  _$jscoverage['/editor/dom.js'].lineData[525] = 0;
  _$jscoverage['/editor/dom.js'].lineData[526] = 0;
  _$jscoverage['/editor/dom.js'].lineData[528] = 0;
  _$jscoverage['/editor/dom.js'].lineData[529] = 0;
  _$jscoverage['/editor/dom.js'].lineData[532] = 0;
  _$jscoverage['/editor/dom.js'].lineData[534] = 0;
  _$jscoverage['/editor/dom.js'].lineData[540] = 0;
  _$jscoverage['/editor/dom.js'].lineData[541] = 0;
  _$jscoverage['/editor/dom.js'].lineData[547] = 0;
  _$jscoverage['/editor/dom.js'].lineData[548] = 0;
  _$jscoverage['/editor/dom.js'].lineData[549] = 0;
  _$jscoverage['/editor/dom.js'].lineData[550] = 0;
  _$jscoverage['/editor/dom.js'].lineData[553] = 0;
  _$jscoverage['/editor/dom.js'].lineData[554] = 0;
  _$jscoverage['/editor/dom.js'].lineData[555] = 0;
  _$jscoverage['/editor/dom.js'].lineData[557] = 0;
  _$jscoverage['/editor/dom.js'].lineData[558] = 0;
  _$jscoverage['/editor/dom.js'].lineData[560] = 0;
  _$jscoverage['/editor/dom.js'].lineData[563] = 0;
  _$jscoverage['/editor/dom.js'].lineData[570] = 0;
  _$jscoverage['/editor/dom.js'].lineData[571] = 0;
  _$jscoverage['/editor/dom.js'].lineData[572] = 0;
  _$jscoverage['/editor/dom.js'].lineData[573] = 0;
  _$jscoverage['/editor/dom.js'].lineData[575] = 0;
  _$jscoverage['/editor/dom.js'].lineData[576] = 0;
  _$jscoverage['/editor/dom.js'].lineData[577] = 0;
  _$jscoverage['/editor/dom.js'].lineData[578] = 0;
  _$jscoverage['/editor/dom.js'].lineData[579] = 0;
  _$jscoverage['/editor/dom.js'].lineData[582] = 0;
  _$jscoverage['/editor/dom.js'].lineData[585] = 0;
  _$jscoverage['/editor/dom.js'].lineData[588] = 0;
  _$jscoverage['/editor/dom.js'].lineData[589] = 0;
  _$jscoverage['/editor/dom.js'].lineData[590] = 0;
  _$jscoverage['/editor/dom.js'].lineData[593] = 0;
  _$jscoverage['/editor/dom.js'].lineData[601] = 0;
  _$jscoverage['/editor/dom.js'].lineData[604] = 0;
  _$jscoverage['/editor/dom.js'].lineData[607] = 0;
  _$jscoverage['/editor/dom.js'].lineData[610] = 0;
  _$jscoverage['/editor/dom.js'].lineData[613] = 0;
  _$jscoverage['/editor/dom.js'].lineData[619] = 0;
  _$jscoverage['/editor/dom.js'].lineData[625] = 0;
  _$jscoverage['/editor/dom.js'].lineData[626] = 0;
  _$jscoverage['/editor/dom.js'].lineData[630] = 0;
  _$jscoverage['/editor/dom.js'].lineData[631] = 0;
  _$jscoverage['/editor/dom.js'].lineData[632] = 0;
  _$jscoverage['/editor/dom.js'].lineData[638] = 0;
  _$jscoverage['/editor/dom.js'].lineData[639] = 0;
  _$jscoverage['/editor/dom.js'].lineData[641] = 0;
  _$jscoverage['/editor/dom.js'].lineData[642] = 0;
  _$jscoverage['/editor/dom.js'].lineData[644] = 0;
  _$jscoverage['/editor/dom.js'].lineData[645] = 0;
  _$jscoverage['/editor/dom.js'].lineData[646] = 0;
  _$jscoverage['/editor/dom.js'].lineData[647] = 0;
  _$jscoverage['/editor/dom.js'].lineData[654] = 0;
  _$jscoverage['/editor/dom.js'].lineData[655] = 0;
  _$jscoverage['/editor/dom.js'].lineData[656] = 0;
  _$jscoverage['/editor/dom.js'].lineData[658] = 0;
  _$jscoverage['/editor/dom.js'].lineData[661] = 0;
  _$jscoverage['/editor/dom.js'].lineData[666] = 0;
  _$jscoverage['/editor/dom.js'].lineData[667] = 0;
  _$jscoverage['/editor/dom.js'].lineData[670] = 0;
  _$jscoverage['/editor/dom.js'].lineData[671] = 0;
  _$jscoverage['/editor/dom.js'].lineData[674] = 0;
  _$jscoverage['/editor/dom.js'].lineData[676] = 0;
  _$jscoverage['/editor/dom.js'].lineData[677] = 0;
  _$jscoverage['/editor/dom.js'].lineData[678] = 0;
  _$jscoverage['/editor/dom.js'].lineData[680] = 0;
  _$jscoverage['/editor/dom.js'].lineData[685] = 0;
  _$jscoverage['/editor/dom.js'].lineData[686] = 0;
  _$jscoverage['/editor/dom.js'].lineData[693] = 0;
  _$jscoverage['/editor/dom.js'].lineData[697] = 0;
  _$jscoverage['/editor/dom.js'].lineData[702] = 0;
  _$jscoverage['/editor/dom.js'].lineData[704] = 0;
  _$jscoverage['/editor/dom.js'].lineData[705] = 0;
  _$jscoverage['/editor/dom.js'].lineData[707] = 0;
  _$jscoverage['/editor/dom.js'].lineData[708] = 0;
  _$jscoverage['/editor/dom.js'].lineData[709] = 0;
  _$jscoverage['/editor/dom.js'].lineData[712] = 0;
  _$jscoverage['/editor/dom.js'].lineData[714] = 0;
  _$jscoverage['/editor/dom.js'].lineData[715] = 0;
  _$jscoverage['/editor/dom.js'].lineData[717] = 0;
  _$jscoverage['/editor/dom.js'].lineData[721] = 0;
  _$jscoverage['/editor/dom.js'].lineData[724] = 0;
  _$jscoverage['/editor/dom.js'].lineData[726] = 0;
  _$jscoverage['/editor/dom.js'].lineData[727] = 0;
  _$jscoverage['/editor/dom.js'].lineData[728] = 0;
  _$jscoverage['/editor/dom.js'].lineData[733] = 0;
  _$jscoverage['/editor/dom.js'].lineData[737] = 0;
  _$jscoverage['/editor/dom.js'].lineData[738] = 0;
  _$jscoverage['/editor/dom.js'].lineData[740] = 0;
  _$jscoverage['/editor/dom.js'].lineData[744] = 0;
  _$jscoverage['/editor/dom.js'].lineData[746] = 0;
  _$jscoverage['/editor/dom.js'].lineData[747] = 0;
  _$jscoverage['/editor/dom.js'].lineData[748] = 0;
  _$jscoverage['/editor/dom.js'].lineData[749] = 0;
  _$jscoverage['/editor/dom.js'].lineData[750] = 0;
  _$jscoverage['/editor/dom.js'].lineData[754] = 0;
  _$jscoverage['/editor/dom.js'].lineData[757] = 0;
  _$jscoverage['/editor/dom.js'].lineData[760] = 0;
  _$jscoverage['/editor/dom.js'].lineData[761] = 0;
  _$jscoverage['/editor/dom.js'].lineData[764] = 0;
  _$jscoverage['/editor/dom.js'].lineData[765] = 0;
  _$jscoverage['/editor/dom.js'].lineData[768] = 0;
  _$jscoverage['/editor/dom.js'].lineData[769] = 0;
  _$jscoverage['/editor/dom.js'].lineData[775] = 0;
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
  _$jscoverage['/editor/dom.js'].branchData['86'] = [];
  _$jscoverage['/editor/dom.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['96'] = [];
  _$jscoverage['/editor/dom.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['102'] = [];
  _$jscoverage['/editor/dom.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['111'] = [];
  _$jscoverage['/editor/dom.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['115'] = [];
  _$jscoverage['/editor/dom.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['116'] = [];
  _$jscoverage['/editor/dom.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['117'] = [];
  _$jscoverage['/editor/dom.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['118'] = [];
  _$jscoverage['/editor/dom.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['124'] = [];
  _$jscoverage['/editor/dom.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['135'] = [];
  _$jscoverage['/editor/dom.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['145'] = [];
  _$jscoverage['/editor/dom.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['151'] = [];
  _$jscoverage['/editor/dom.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['161'] = [];
  _$jscoverage['/editor/dom.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['165'] = [];
  _$jscoverage['/editor/dom.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['168'] = [];
  _$jscoverage['/editor/dom.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['169'] = [];
  _$jscoverage['/editor/dom.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['177'] = [];
  _$jscoverage['/editor/dom.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['178'] = [];
  _$jscoverage['/editor/dom.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['181'] = [];
  _$jscoverage['/editor/dom.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['182'] = [];
  _$jscoverage['/editor/dom.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['193'] = [];
  _$jscoverage['/editor/dom.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['197'] = [];
  _$jscoverage['/editor/dom.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['201'] = [];
  _$jscoverage['/editor/dom.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['206'] = [];
  _$jscoverage['/editor/dom.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['206'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['206'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['207'] = [];
  _$jscoverage['/editor/dom.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['218'] = [];
  _$jscoverage['/editor/dom.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['224'] = [];
  _$jscoverage['/editor/dom.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['245'] = [];
  _$jscoverage['/editor/dom.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['256'] = [];
  _$jscoverage['/editor/dom.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['262'] = [];
  _$jscoverage['/editor/dom.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['262'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['277'] = [];
  _$jscoverage['/editor/dom.js'].branchData['277'][1] = new BranchData();
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
  _$jscoverage['/editor/dom.js'].branchData['348'] = [];
  _$jscoverage['/editor/dom.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['351'] = [];
  _$jscoverage['/editor/dom.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['355'] = [];
  _$jscoverage['/editor/dom.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['360'] = [];
  _$jscoverage['/editor/dom.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['361'] = [];
  _$jscoverage['/editor/dom.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['362'] = [];
  _$jscoverage['/editor/dom.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['368'] = [];
  _$jscoverage['/editor/dom.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['371'] = [];
  _$jscoverage['/editor/dom.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['371'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['376'] = [];
  _$jscoverage['/editor/dom.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['380'] = [];
  _$jscoverage['/editor/dom.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['384'] = [];
  _$jscoverage['/editor/dom.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['397'] = [];
  _$jscoverage['/editor/dom.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['401'] = [];
  _$jscoverage['/editor/dom.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['408'] = [];
  _$jscoverage['/editor/dom.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['417'] = [];
  _$jscoverage['/editor/dom.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['420'] = [];
  _$jscoverage['/editor/dom.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['428'] = [];
  _$jscoverage['/editor/dom.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['433'] = [];
  _$jscoverage['/editor/dom.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['441'] = [];
  _$jscoverage['/editor/dom.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['456'] = [];
  _$jscoverage['/editor/dom.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['462'] = [];
  _$jscoverage['/editor/dom.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['467'] = [];
  _$jscoverage['/editor/dom.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['467'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['468'] = [];
  _$jscoverage['/editor/dom.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['469'] = [];
  _$jscoverage['/editor/dom.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['473'] = [];
  _$jscoverage['/editor/dom.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['477'] = [];
  _$jscoverage['/editor/dom.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['478'] = [];
  _$jscoverage['/editor/dom.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['478'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['478'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['480'] = [];
  _$jscoverage['/editor/dom.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['493'] = [];
  _$jscoverage['/editor/dom.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['494'] = [];
  _$jscoverage['/editor/dom.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['495'] = [];
  _$jscoverage['/editor/dom.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['501'] = [];
  _$jscoverage['/editor/dom.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['513'] = [];
  _$jscoverage['/editor/dom.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['513'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['525'] = [];
  _$jscoverage['/editor/dom.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['526'] = [];
  _$jscoverage['/editor/dom.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['549'] = [];
  _$jscoverage['/editor/dom.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['553'] = [];
  _$jscoverage['/editor/dom.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['557'] = [];
  _$jscoverage['/editor/dom.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['572'] = [];
  _$jscoverage['/editor/dom.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['575'] = [];
  _$jscoverage['/editor/dom.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['578'] = [];
  _$jscoverage['/editor/dom.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['588'] = [];
  _$jscoverage['/editor/dom.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['590'] = [];
  _$jscoverage['/editor/dom.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['591'] = [];
  _$jscoverage['/editor/dom.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['591'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['592'] = [];
  _$jscoverage['/editor/dom.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['604'] = [];
  _$jscoverage['/editor/dom.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['605'] = [];
  _$jscoverage['/editor/dom.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['605'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['610'] = [];
  _$jscoverage['/editor/dom.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['611'] = [];
  _$jscoverage['/editor/dom.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['611'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['612'] = [];
  _$jscoverage['/editor/dom.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['626'] = [];
  _$jscoverage['/editor/dom.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['628'] = [];
  _$jscoverage['/editor/dom.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['645'] = [];
  _$jscoverage['/editor/dom.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['656'] = [];
  _$jscoverage['/editor/dom.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['658'] = [];
  _$jscoverage['/editor/dom.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['666'] = [];
  _$jscoverage['/editor/dom.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['670'] = [];
  _$jscoverage['/editor/dom.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['670'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['674'] = [];
  _$jscoverage['/editor/dom.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['675'] = [];
  _$jscoverage['/editor/dom.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['675'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['675'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['677'] = [];
  _$jscoverage['/editor/dom.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['685'] = [];
  _$jscoverage['/editor/dom.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['694'] = [];
  _$jscoverage['/editor/dom.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['695'] = [];
  _$jscoverage['/editor/dom.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['697'] = [];
  _$jscoverage['/editor/dom.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['704'] = [];
  _$jscoverage['/editor/dom.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['704'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['707'] = [];
  _$jscoverage['/editor/dom.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['714'] = [];
  _$jscoverage['/editor/dom.js'].branchData['714'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['717'] = [];
  _$jscoverage['/editor/dom.js'].branchData['717'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['717'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['718'] = [];
  _$jscoverage['/editor/dom.js'].branchData['718'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['718'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['719'] = [];
  _$jscoverage['/editor/dom.js'].branchData['719'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['720'] = [];
  _$jscoverage['/editor/dom.js'].branchData['720'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['726'] = [];
  _$jscoverage['/editor/dom.js'].branchData['726'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['740'] = [];
  _$jscoverage['/editor/dom.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['740'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['746'] = [];
  _$jscoverage['/editor/dom.js'].branchData['746'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['749'] = [];
  _$jscoverage['/editor/dom.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['754'] = [];
  _$jscoverage['/editor/dom.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['768'] = [];
  _$jscoverage['/editor/dom.js'].branchData['768'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['768'][2] = new BranchData();
}
_$jscoverage['/editor/dom.js'].branchData['768'][2].init(696, 49, 'innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit208_768_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['768'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['768'][1].init(677, 68, 'innerSibling[0] && innerSibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit207_768_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['768'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['754'][1].init(543, 43, 'element._4e_isIdentical(sibling, undefined)');
function visit206_754_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['749'][1].init(160, 8, '!sibling');
function visit205_749_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['746'][1].init(209, 77, 'sibling.attr(\'_ke_bookmark\') || sibling._4e_isEmptyInlineRemovable(undefined)');
function visit204_746_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['746'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['740'][2].init(99, 44, 'sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit203_740_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['740'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['740'][1].init(88, 55, 'sibling && sibling[0].nodeType == NodeType.ELEMENT_NODE');
function visit202_740_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['726'][1].init(441, 22, 'currentIndex == target');
function visit201_726_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['726'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['720'][1].init(57, 39, 'candidate.previousSibling.nodeType == 3');
function visit200_720_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['720'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['719'][1].init(55, 97, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit199_719_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['719'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['718'][2].init(146, 23, 'candidate.nodeType == 3');
function visit198_718_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['718'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['718'][1].init(51, 153, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit197_718_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['718'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['717'][2].init(92, 19, 'normalized === TRUE');
function visit196_717_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['717'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['717'][1].init(92, 205, 'normalized === TRUE && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit195_717_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['717'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['714'][1].init(287, 23, 'j < $.childNodes.length');
function visit194_714_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['714'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['707'][1].init(76, 11, '!normalized');
function visit193_707_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['704'][2].init(87, 18, 'i < address.length');
function visit192_704_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['704'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['704'][1].init(82, 23, '$ && i < address.length');
function visit191_704_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['697'][1].init(330, 19, 'dtd && dtd[\'#text\']');
function visit190_697_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['695'][1].init(61, 38, 'xhtml_dtd[name] || xhtml_dtd["span"]');
function visit189_695_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['694'][1].init(55, 102, '!xhtml_dtd.$nonEditable[name] && (xhtml_dtd[name] || xhtml_dtd["span"])');
function visit188_694_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['685'][1].init(1474, 23, 'el.style.cssText !== \'\'');
function visit187_685_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['677'][1].init(91, 18, 'attrValue === NULL');
function visit186_677_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['675'][3].init(80, 19, 'attrName == \'value\'');
function visit185_675_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['675'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['675'][2].init(61, 38, 'attribute.value && attrName == \'value\'');
function visit184_675_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['675'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['675'][1].init(49, 50, 'UA[\'ie\'] && attribute.value && attrName == \'value\'');
function visit183_675_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['674'][1].init(799, 102, 'attribute.specified || (UA[\'ie\'] && attribute.value && attrName == \'value\')');
function visit182_674_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['670'][2].init(533, 21, 'attrName == \'checked\'');
function visit181_670_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['670'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['670'][1].init(533, 63, 'attrName == \'checked\' && (attrValue = Dom.attr(el, attrName))');
function visit180_670_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['666'][1].init(418, 26, 'attrName in skipAttributes');
function visit179_666_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['658'][1].init(185, 21, 'n < attributes.length');
function visit178_658_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['656'][1].init(128, 20, 'skipAttributes || {}');
function visit177_656_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['645'][1].init(351, 18, 'removeFromDatabase');
function visit176_645_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['628'][1].init(170, 128, 'element.data(\'list_marker_names\') || (element.data(\'list_marker_names\', {}).data(\'list_marker_names\'))');
function visit175_628_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['626'][1].init(73, 125, 'element.data(\'list_marker_id\') || (element.data(\'list_marker_id\', S.guid()).data(\'list_marker_id\'))');
function visit174_626_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['612'][1].init(68, 32, 'Dom.nodeName(lastChild) !== \'br\'');
function visit173_612_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['611'][2].init(401, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit172_611_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['611'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['611'][1].init(34, 101, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit171_611_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['610'][1].init(364, 136, '!lastChild || lastChild.nodeType == Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit170_610_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['605'][2].init(163, 44, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE');
function visit169_605_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['605'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['605'][1].init(33, 97, 'lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit168_605_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['604'][1].init(127, 131, 'lastChild && lastChild.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit167_604_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['592'][1].init(47, 27, 'Dom.nodeName(child) == \'br\'');
function visit166_592_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['591'][2].init(105, 19, 'child.nodeType == 1');
function visit165_591_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['591'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['591'][1].init(33, 75, 'child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit164_591_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['590'][1].init(69, 109, 'child && child.nodeType == 1 && Dom.nodeName(child) == \'br\'');
function visit163_590_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['588'][1].init(871, 22, '!UA[\'ie\'] && !UA.opera');
function visit162_588_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['578'][1].init(309, 31, 'trimmed.length < originalLength');
function visit161_578_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['575'][1].init(169, 8, '!trimmed');
function visit160_575_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['572'][1].init(26, 36, 'child.type == Dom.NodeType.TEXT_NODE');
function visit159_572_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['557'][1].init(336, 31, 'trimmed.length < originalLength');
function visit158_557_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['553'][1].init(171, 8, '!trimmed');
function visit157_553_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['549'][1].init(26, 40, 'child.nodeType == Dom.NodeType.TEXT_NODE');
function visit156_549_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['526'][1].init(26, 16, 'preserveChildren');
function visit155_526_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['525'][1].init(67, 6, 'parent');
function visit154_525_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['513'][2].init(176, 24, 'node != $documentElement');
function visit153_513_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['513'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['513'][1].init(168, 32, 'node && node != $documentElement');
function visit152_513_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['501'][1].init(2157, 44, 'addressOfThis.length < addressOfOther.length');
function visit151_501_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['495'][1].init(33, 40, 'addressOfThis[i] < addressOfOther[i]');
function visit150_495_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['494'][1].init(26, 41, 'addressOfThis[i] != addressOfOther[i]');
function visit149_494_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['493'][1].init(1773, 17, 'i <= minLevel - 1');
function visit148_493_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['480'][1].init(136, 35, 'el.sourceIndex < $other.sourceIndex');
function visit147_480_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['478'][3].init(57, 22, '$other.sourceIndex < 0');
function visit146_478_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['478'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['478'][2].init(35, 18, 'el.sourceIndex < 0');
function visit145_478_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['478'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['478'][1].init(35, 44, 'el.sourceIndex < 0 || $other.sourceIndex < 0');
function visit144_478_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['477'][1].init(346, 19, '\'sourceIndex\' in el');
function visit143_477_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['473'][1].init(184, 24, 'Dom.contains($other, el)');
function visit142_473_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['469'][1].init(26, 24, 'Dom.contains(el, $other)');
function visit141_469_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['468'][1].init(60, 40, '$other.nodeType == NodeType.ELEMENT_NODE');
function visit140_468_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['467'][2].init(478, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit139_467_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['467'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['467'][1].init(478, 101, 'el.nodeType == NodeType.ELEMENT_NODE && $other.nodeType == NodeType.ELEMENT_NODE');
function visit138_467_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['462'][1].init(295, 12, 'el == $other');
function visit137_462_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['456'][1].init(78, 26, 'el.compareDocumentPosition');
function visit136_456_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['441'][1].init(59, 8, 'UA.gecko');
function visit135_441_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['433'][1].init(46, 19, 'attribute.specified');
function visit134_433_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['428'][1].init(439, 24, 'el.getAttribute(\'class\')');
function visit133_428_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['420'][1].init(91, 21, 'i < attributes.length');
function visit132_420_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['417'][1].init(12005, 18, 'Utils.ieEngine < 9');
function visit131_417_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['408'][1].init(26, 25, 'Dom.contains(start, node)');
function visit130_408_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['401'][1].init(158, 22, 'Dom.contains(node, el)');
function visit129_401_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['397'][1].init(69, 11, 'el === node');
function visit128_397_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['384'][2].init(1439, 25, 'node.nodeType != nodeType');
function visit127_384_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['384'][1].init(1427, 37, 'nodeType && node.nodeType != nodeType');
function visit126_384_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['380'][2].init(1326, 21, 'guard(node) === FALSE');
function visit125_380_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['380'][1].init(1317, 30, 'guard && guard(node) === FALSE');
function visit124_380_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['376'][1].init(1232, 5, '!node');
function visit123_376_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['371'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit122_371_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['371'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['371'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit121_371_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['368'][1].init(848, 39, '!node && (parent = parent.parentNode)');
function visit120_368_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['362'][2].init(102, 25, 'guard(el, TRUE) === FALSE');
function visit119_362_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['362'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit118_362_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['361'][2].init(26, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit117_361_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['361'][1].init(26, 99, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit116_361_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['360'][1].init(557, 5, '!node');
function visit115_360_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['355'][1].init(275, 33, '!startFromSibling && el.lastChild');
function visit114_355_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['351'][1].init(33, 18, 'node !== guardNode');
function visit113_351_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['348'][1].init(22, 20, 'guard && !guard.call');
function visit112_348_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['338'][2].init(1527, 25, 'nodeType != node.nodeType');
function visit111_338_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['338'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['338'][1].init(1515, 37, 'nodeType && nodeType != node.nodeType');
function visit110_338_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['334'][2].init(1414, 21, 'guard(node) === FALSE');
function visit109_334_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['334'][1].init(1405, 30, 'guard && guard(node) === FALSE');
function visit108_334_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['330'][1].init(1320, 5, '!node');
function visit107_330_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['324'][2].init(179, 29, 'guard(parent, TRUE) === FALSE');
function visit106_324_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['324'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['324'][1].init(170, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit105_324_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['321'][1].init(916, 38, '!node && (parent = parent.parentNode)');
function visit104_321_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['315'][2].init(102, 25, 'guard(el, TRUE) === FALSE');
function visit103_315_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['315'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit102_315_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['314'][2].init(26, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit101_314_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['314'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['314'][1].init(26, 99, 'el.nodeType == NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit100_314_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['313'][1].init(629, 5, '!node');
function visit99_313_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['308'][1].init(345, 34, '!startFromSibling && el.firstChild');
function visit98_308_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['304'][1].init(33, 18, 'node !== guardNode');
function visit97_304_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['301'][1].init(92, 20, 'guard && !guard.call');
function visit96_301_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['277'][1].init(1079, 20, '!!(doc.documentMode)');
function visit95_277_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['262'][2].init(397, 29, 'offset == el.nodeValue.length');
function visit94_262_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['262'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['262'][1].init(385, 41, 'UA[\'ie\'] && offset == el.nodeValue.length');
function visit93_262_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['256'][1].init(69, 37, 'el.nodeType != Dom.NodeType.TEXT_NODE');
function visit92_256_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['245'][1].init(111, 36, 'REMOVE_EMPTY[thisElement.nodeName()]');
function visit91_245_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['224'][1].init(197, 7, 'toStart');
function visit90_224_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['218'][1].init(71, 21, 'thisElement == target');
function visit89_218_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['207'][2].init(417, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit88_207_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['207'][1].init(103, 61, 'nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit87_207_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['206'][3].init(311, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit86_206_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['206'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['206'][2].init(311, 75, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child)');
function visit85_206_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['206'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['206'][1].init(311, 165, 'nodeType == NodeType.ELEMENT_NODE && !Dom._4e_isEmptyInlineRemovable(child) || nodeType == Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit84_206_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['201'][2].init(126, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit83_201_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['201'][1].init(126, 96, 'nodeType == NodeType.ELEMENT_NODE && child.getAttribute(\'_ke_bookmark\')');
function visit82_201_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['197'][1].init(244, 9, 'i < count');
function visit81_197_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['193'][1].init(22, 50, '!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)]');
function visit80_193_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['182'][1].init(51, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit79_182_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['181'][1].init(137, 111, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit78_181_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['178'][1].init(34, 15, 'i < otherLength');
function visit77_178_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['177'][1].init(1240, 18, 'Utils.ieEngine < 8');
function visit76_177_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['169'][1].init(47, 59, 'Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit75_169_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['168'][1].init(130, 107, 'attribute.specified && Dom.attr(thisElement, name) != Dom.attr(otherElement, name)');
function visit74_168_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['165'][1].init(677, 14, 'i < thisLength');
function visit73_165_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['161'][1].init(559, 25, 'thisLength != otherLength');
function visit72_161_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['151'][1].init(177, 55, 'Dom.nodeName(thisElement) != Dom.nodeName(otherElement)');
function visit71_151_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['145'][1].init(22, 13, '!otherElement');
function visit70_145_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['135'][1].init(69, 7, 'toStart');
function visit69_135_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['124'][1].init(421, 16, 'candidate === el');
function visit68_124_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][1].init(53, 39, 'candidate.previousSibling.nodeType == 3');
function visit67_118_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['117'][1].init(51, 93, 'candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit66_117_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['116'][2].init(150, 23, 'candidate.nodeType == 3');
function visit65_116_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['116'][1].init(38, 145, 'candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit64_116_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['115'][1].init(109, 184, 'normalized && candidate.nodeType == 3 && candidate.previousSibling && candidate.previousSibling.nodeType == 3');
function visit63_115_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['111'][1].init(166, 19, 'i < siblings.length');
function visit62_111_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['102'][1].init(121, 90, 'blockBoundaryDisplayMatch[Dom.css(el, \'display\')] || nodeNameMatches[Dom.nodeName(el)]');
function visit61_102_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['96'][2].init(116, 21, 'e1p == el2.parentNode');
function visit60_96_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['96'][1].init(109, 28, 'e1p && e1p == el2.parentNode');
function visit59_96_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['86'][2].init(28, 11, 'el[0] || el');
function visit58_86_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['86'][1].init(21, 19, 'el && (el[0] || el)');
function visit57_86_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].lineData[10]++;
KISSY.add("editor/dom", function(S, Editor, Utils) {
  _$jscoverage['/editor/dom.js'].functionData[0]++;
  _$jscoverage['/editor/dom.js'].lineData[11]++;
  var TRUE = true, undefined = undefined, FALSE = false, NULL = null, xhtml_dtd = Editor.XHTML_DTD, Dom = S.DOM, NodeType = Dom.NodeType, UA = S.UA, Node = S.Node, REMOVE_EMPTY = {
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
  _$jscoverage['/editor/dom.js'].lineData[55]++;
  Editor.PositionType = {
  POSITION_IDENTICAL: 0, 
  POSITION_DISCONNECTED: 1, 
  POSITION_FOLLOWING: 2, 
  POSITION_PRECEDING: 4, 
  POSITION_IS_CONTAINED: 8, 
  POSITION_CONTAINS: 16};
  _$jscoverage['/editor/dom.js'].lineData[63]++;
  var KEP = Editor.PositionType;
  _$jscoverage['/editor/dom.js'].lineData[71]++;
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
  _$jscoverage['/editor/dom.js'].lineData[86]++;
  return visit57_86_1(el && (visit58_86_2(el[0] || el)));
}, normalEl = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[2]++;
  _$jscoverage['/editor/dom.js'].lineData[89]++;
  return new Node(el);
}, editorDom = {
  _4e_sameLevel: function(el1, el2) {
  _$jscoverage['/editor/dom.js'].functionData[3]++;
  _$jscoverage['/editor/dom.js'].lineData[94]++;
  el2 = normalElDom(el2);
  _$jscoverage['/editor/dom.js'].lineData[95]++;
  var e1p = el1.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[96]++;
  return visit59_96_1(e1p && visit60_96_2(e1p == el2.parentNode));
}, 
  _4e_isBlockBoundary: function(el, customNodeNames) {
  _$jscoverage['/editor/dom.js'].functionData[4]++;
  _$jscoverage['/editor/dom.js'].lineData[101]++;
  var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
  _$jscoverage['/editor/dom.js'].lineData[102]++;
  return !!(visit61_102_1(blockBoundaryDisplayMatch[Dom.css(el, 'display')] || nodeNameMatches[Dom.nodeName(el)]));
}, 
  _4e_index: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[5]++;
  _$jscoverage['/editor/dom.js'].lineData[107]++;
  var siblings = el.parentNode.childNodes, candidate, currentIndex = -1;
  _$jscoverage['/editor/dom.js'].lineData[111]++;
  for (var i = 0; visit62_111_1(i < siblings.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[112]++;
    candidate = siblings[i];
    _$jscoverage['/editor/dom.js'].lineData[115]++;
    if (visit63_115_1(normalized && visit64_116_1(visit65_116_2(candidate.nodeType == 3) && visit66_117_1(candidate.previousSibling && visit67_118_1(candidate.previousSibling.nodeType == 3))))) {
      _$jscoverage['/editor/dom.js'].lineData[119]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[122]++;
    currentIndex++;
    _$jscoverage['/editor/dom.js'].lineData[124]++;
    if (visit68_124_1(candidate === el)) {
      _$jscoverage['/editor/dom.js'].lineData[125]++;
      return currentIndex;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[128]++;
  return -1;
}, 
  _4e_move: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[6]++;
  _$jscoverage['/editor/dom.js'].lineData[134]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[135]++;
  if (visit69_135_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[136]++;
    target.insertBefore(thisElement, target.firstChild);
  } else {
    _$jscoverage['/editor/dom.js'].lineData[138]++;
    target.appendChild(thisElement);
  }
}, 
  _4e_isIdentical: function(thisElement, otherElement) {
  _$jscoverage['/editor/dom.js'].functionData[7]++;
  _$jscoverage['/editor/dom.js'].lineData[145]++;
  if (visit70_145_1(!otherElement)) {
    _$jscoverage['/editor/dom.js'].lineData[146]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[149]++;
  otherElement = normalElDom(otherElement);
  _$jscoverage['/editor/dom.js'].lineData[151]++;
  if (visit71_151_1(Dom.nodeName(thisElement) != Dom.nodeName(otherElement))) {
    _$jscoverage['/editor/dom.js'].lineData[152]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[155]++;
  var thisAttributes = thisElement.attributes, otherAttributes = otherElement.attributes;
  _$jscoverage['/editor/dom.js'].lineData[158]++;
  var thisLength = thisAttributes.length, otherLength = otherAttributes.length;
  _$jscoverage['/editor/dom.js'].lineData[161]++;
  if (visit72_161_1(thisLength != otherLength)) {
    _$jscoverage['/editor/dom.js'].lineData[162]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[165]++;
  for (var i = 0; visit73_165_1(i < thisLength); i++) {
    _$jscoverage['/editor/dom.js'].lineData[166]++;
    var attribute = thisAttributes[i], name = attribute.name;
    _$jscoverage['/editor/dom.js'].lineData[168]++;
    if (visit74_168_1(attribute.specified && visit75_169_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
      _$jscoverage['/editor/dom.js'].lineData[170]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[177]++;
  if (visit76_177_1(Utils.ieEngine < 8)) {
    _$jscoverage['/editor/dom.js'].lineData[178]++;
    for (i = 0; visit77_178_1(i < otherLength); i++) {
      _$jscoverage['/editor/dom.js'].lineData[179]++;
      attribute = otherAttributes[i];
      _$jscoverage['/editor/dom.js'].lineData[180]++;
      name = attribute.name;
      _$jscoverage['/editor/dom.js'].lineData[181]++;
      if (visit78_181_1(attribute.specified && visit79_182_1(Dom.attr(thisElement, name) != Dom.attr(otherElement, name)))) {
        _$jscoverage['/editor/dom.js'].lineData[183]++;
        return FALSE;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[188]++;
  return TRUE;
}, 
  _4e_isEmptyInlineRemovable: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[8]++;
  _$jscoverage['/editor/dom.js'].lineData[193]++;
  if (visit80_193_1(!xhtml_dtd.$removeEmpty[Dom.nodeName(thisElement)])) {
    _$jscoverage['/editor/dom.js'].lineData[194]++;
    return false;
  }
  _$jscoverage['/editor/dom.js'].lineData[196]++;
  var children = thisElement.childNodes;
  _$jscoverage['/editor/dom.js'].lineData[197]++;
  for (var i = 0, count = children.length; visit81_197_1(i < count); i++) {
    _$jscoverage['/editor/dom.js'].lineData[198]++;
    var child = children[i], nodeType = child.nodeType;
    _$jscoverage['/editor/dom.js'].lineData[201]++;
    if (visit82_201_1(visit83_201_2(nodeType == NodeType.ELEMENT_NODE) && child.getAttribute('_ke_bookmark'))) {
      _$jscoverage['/editor/dom.js'].lineData[203]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[206]++;
    if (visit84_206_1(visit85_206_2(visit86_206_3(nodeType == NodeType.ELEMENT_NODE) && !Dom._4e_isEmptyInlineRemovable(child)) || visit87_207_1(visit88_207_2(nodeType == Dom.NodeType.TEXT_NODE) && S.trim(child.nodeValue)))) {
      _$jscoverage['/editor/dom.js'].lineData[208]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[211]++;
  return TRUE;
}, 
  _4e_moveChildren: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[9]++;
  _$jscoverage['/editor/dom.js'].lineData[216]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[218]++;
  if (visit89_218_1(thisElement == target)) {
    _$jscoverage['/editor/dom.js'].lineData[219]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[222]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[224]++;
  if (visit90_224_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[225]++;
    while (child = thisElement.lastChild) {
      _$jscoverage['/editor/dom.js'].lineData[226]++;
      target.insertBefore(thisElement.removeChild(child), target.firstChild);
    }
  } else {
    _$jscoverage['/editor/dom.js'].lineData[229]++;
    while (child = thisElement.firstChild) {
      _$jscoverage['/editor/dom.js'].lineData[230]++;
      target.appendChild(thisElement.removeChild(child));
    }
  }
}, 
  _4e_mergeSiblings: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[10]++;
  _$jscoverage['/editor/dom.js'].lineData[243]++;
  thisElement = normalEl(thisElement);
  _$jscoverage['/editor/dom.js'].lineData[245]++;
  if (visit91_245_1(REMOVE_EMPTY[thisElement.nodeName()])) {
    _$jscoverage['/editor/dom.js'].lineData[246]++;
    mergeElements(thisElement, TRUE);
    _$jscoverage['/editor/dom.js'].lineData[247]++;
    mergeElements(thisElement);
  }
}, 
  _4e_splitText: function(el, offset) {
  _$jscoverage['/editor/dom.js'].functionData[11]++;
  _$jscoverage['/editor/dom.js'].lineData[254]++;
  var doc = el.ownerDocument;
  _$jscoverage['/editor/dom.js'].lineData[256]++;
  if (visit92_256_1(el.nodeType != Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/dom.js'].lineData[257]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[262]++;
  if (visit93_262_1(UA['ie'] && visit94_262_2(offset == el.nodeValue.length))) {
    _$jscoverage['/editor/dom.js'].lineData[263]++;
    var next = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[264]++;
    Dom.insertAfter(next, el);
    _$jscoverage['/editor/dom.js'].lineData[265]++;
    return next;
  }
  _$jscoverage['/editor/dom.js'].lineData[268]++;
  var ret = el.splitText(offset);
  _$jscoverage['/editor/dom.js'].lineData[277]++;
  if (visit95_277_1(!!(doc.documentMode))) {
    _$jscoverage['/editor/dom.js'].lineData[278]++;
    var workaround = doc.createTextNode("");
    _$jscoverage['/editor/dom.js'].lineData[279]++;
    Dom.insertAfter(workaround, ret);
    _$jscoverage['/editor/dom.js'].lineData[280]++;
    Dom.remove(workaround);
  }
  _$jscoverage['/editor/dom.js'].lineData[283]++;
  return ret;
}, 
  _4e_parents: function(node, closerFirst) {
  _$jscoverage['/editor/dom.js'].functionData[12]++;
  _$jscoverage['/editor/dom.js'].lineData[289]++;
  var parents = [];
  _$jscoverage['/editor/dom.js'].lineData[290]++;
  parents.__IS_NODELIST = 1;
  _$jscoverage['/editor/dom.js'].lineData[291]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[292]++;
    parents[closerFirst ? 'push' : 'unshift'](node);
  } while (node = node.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[294]++;
  return parents;
}, 
  _4e_nextSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[13]++;
  _$jscoverage['/editor/dom.js'].lineData[301]++;
  if (visit96_301_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[302]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[303]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[14]++;
  _$jscoverage['/editor/dom.js'].lineData[304]++;
  return visit97_304_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[308]++;
  var node = visit98_308_1(!startFromSibling && el.firstChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[313]++;
  if (visit99_313_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[314]++;
    if (visit100_314_1(visit101_314_2(el.nodeType == NodeType.ELEMENT_NODE) && visit102_315_1(guard && visit103_315_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[316]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[318]++;
    node = el.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[321]++;
  while (visit104_321_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[324]++;
    if (visit105_324_1(guard && visit106_324_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[325]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[327]++;
    node = parent.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[330]++;
  if (visit107_330_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[331]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[334]++;
  if (visit108_334_1(guard && visit109_334_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[335]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[338]++;
  if (visit110_338_1(nodeType && visit111_338_2(nodeType != node.nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[339]++;
    return Dom._4e_nextSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[342]++;
  return node;
}, 
  _4e_previousSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[15]++;
  _$jscoverage['/editor/dom.js'].lineData[348]++;
  if (visit112_348_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[349]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[350]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[16]++;
  _$jscoverage['/editor/dom.js'].lineData[351]++;
  return visit113_351_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[355]++;
  var node = visit114_355_1(!startFromSibling && el.lastChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[360]++;
  if (visit115_360_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[361]++;
    if (visit116_361_1(visit117_361_2(el.nodeType == NodeType.ELEMENT_NODE) && visit118_362_1(guard && visit119_362_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[363]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[365]++;
    node = el.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[368]++;
  while (visit120_368_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[371]++;
    if (visit121_371_1(guard && visit122_371_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[372]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[373]++;
    node = parent.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[376]++;
  if (visit123_376_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[377]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[380]++;
  if (visit124_380_1(guard && visit125_380_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[381]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[384]++;
  if (visit126_384_1(nodeType && visit127_384_2(node.nodeType != nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[385]++;
    return Dom._4e_previousSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[388]++;
  return node;
}, 
  _4e_commonAncestor: function(el, node) {
  _$jscoverage['/editor/dom.js'].functionData[17]++;
  _$jscoverage['/editor/dom.js'].lineData[395]++;
  node = normalElDom(node);
  _$jscoverage['/editor/dom.js'].lineData[397]++;
  if (visit128_397_1(el === node)) {
    _$jscoverage['/editor/dom.js'].lineData[398]++;
    return el;
  }
  _$jscoverage['/editor/dom.js'].lineData[401]++;
  if (visit129_401_1(Dom.contains(node, el))) {
    _$jscoverage['/editor/dom.js'].lineData[402]++;
    return node;
  }
  _$jscoverage['/editor/dom.js'].lineData[405]++;
  var start = el;
  _$jscoverage['/editor/dom.js'].lineData[407]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[408]++;
    if (visit130_408_1(Dom.contains(start, node))) {
      _$jscoverage['/editor/dom.js'].lineData[409]++;
      return start;
    }
  } while (start = start.parentNode);
  _$jscoverage['/editor/dom.js'].lineData[413]++;
  return NULL;
}, 
  _4e_hasAttributes: visit131_417_1(Utils.ieEngine < 9) ? function(el) {
  _$jscoverage['/editor/dom.js'].functionData[18]++;
  _$jscoverage['/editor/dom.js'].lineData[419]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[420]++;
  for (var i = 0; visit132_420_1(i < attributes.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[421]++;
    var attribute = attributes[i];
    _$jscoverage['/editor/dom.js'].lineData[422]++;
    switch (attribute.name) {
      case 'class':
        _$jscoverage['/editor/dom.js'].lineData[428]++;
        if (visit133_428_1(el.getAttribute('class'))) {
          _$jscoverage['/editor/dom.js'].lineData[429]++;
          return TRUE;
        }
        _$jscoverage['/editor/dom.js'].lineData[431]++;
        break;
      default:
        _$jscoverage['/editor/dom.js'].lineData[433]++;
        if (visit134_433_1(attribute.specified)) {
          _$jscoverage['/editor/dom.js'].lineData[434]++;
          return TRUE;
        }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[438]++;
  return FALSE;
} : function(el) {
  _$jscoverage['/editor/dom.js'].functionData[19]++;
  _$jscoverage['/editor/dom.js'].lineData[441]++;
  if (visit135_441_1(UA.gecko)) {
    _$jscoverage['/editor/dom.js'].lineData[442]++;
    el.removeAttribute("_moz_dirty");
  }
  _$jscoverage['/editor/dom.js'].lineData[446]++;
  return el.hasAttributes();
}, 
  _4e_position: function(el, otherNode) {
  _$jscoverage['/editor/dom.js'].functionData[20]++;
  _$jscoverage['/editor/dom.js'].lineData[454]++;
  var $other = normalElDom(otherNode);
  _$jscoverage['/editor/dom.js'].lineData[456]++;
  if (visit136_456_1(el.compareDocumentPosition)) {
    _$jscoverage['/editor/dom.js'].lineData[457]++;
    return el.compareDocumentPosition($other);
  }
  _$jscoverage['/editor/dom.js'].lineData[462]++;
  if (visit137_462_1(el == $other)) {
    _$jscoverage['/editor/dom.js'].lineData[463]++;
    return KEP.POSITION_IDENTICAL;
  }
  _$jscoverage['/editor/dom.js'].lineData[467]++;
  if (visit138_467_1(visit139_467_2(el.nodeType == NodeType.ELEMENT_NODE) && visit140_468_1($other.nodeType == NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/dom.js'].lineData[469]++;
    if (visit141_469_1(Dom.contains(el, $other))) {
      _$jscoverage['/editor/dom.js'].lineData[470]++;
      return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
    }
    _$jscoverage['/editor/dom.js'].lineData[473]++;
    if (visit142_473_1(Dom.contains($other, el))) {
      _$jscoverage['/editor/dom.js'].lineData[474]++;
      return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
    }
    _$jscoverage['/editor/dom.js'].lineData[477]++;
    if (visit143_477_1('sourceIndex' in el)) {
      _$jscoverage['/editor/dom.js'].lineData[478]++;
      return (visit144_478_1(visit145_478_2(el.sourceIndex < 0) || visit146_478_3($other.sourceIndex < 0))) ? KEP.POSITION_DISCONNECTED : (visit147_480_1(el.sourceIndex < $other.sourceIndex)) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[488]++;
  var addressOfThis = Dom._4e_address(el), addressOfOther = Dom._4e_address($other), minLevel = Math.min(addressOfThis.length, addressOfOther.length);
  _$jscoverage['/editor/dom.js'].lineData[493]++;
  for (var i = 0; visit148_493_1(i <= minLevel - 1); i++) {
    _$jscoverage['/editor/dom.js'].lineData[494]++;
    if (visit149_494_1(addressOfThis[i] != addressOfOther[i])) {
      _$jscoverage['/editor/dom.js'].lineData[495]++;
      return visit150_495_1(addressOfThis[i] < addressOfOther[i]) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[501]++;
  return (visit151_501_1(addressOfThis.length < addressOfOther.length)) ? KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING : KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
}, 
  _4e_address: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[21]++;
  _$jscoverage['/editor/dom.js'].lineData[509]++;
  var address = [], $documentElement = el.ownerDocument.documentElement, node = el;
  _$jscoverage['/editor/dom.js'].lineData[513]++;
  while (visit152_513_1(node && visit153_513_2(node != $documentElement))) {
    _$jscoverage['/editor/dom.js'].lineData[514]++;
    address.unshift(Dom._4e_index(node, normalized));
    _$jscoverage['/editor/dom.js'].lineData[515]++;
    node = node.parentNode;
  }
  _$jscoverage['/editor/dom.js'].lineData[518]++;
  return address;
}, 
  _4e_remove: function(el, preserveChildren) {
  _$jscoverage['/editor/dom.js'].functionData[22]++;
  _$jscoverage['/editor/dom.js'].lineData[524]++;
  var parent = el.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[525]++;
  if (visit154_525_1(parent)) {
    _$jscoverage['/editor/dom.js'].lineData[526]++;
    if (visit155_526_1(preserveChildren)) {
      _$jscoverage['/editor/dom.js'].lineData[528]++;
      for (var child; child = el.firstChild; ) {
        _$jscoverage['/editor/dom.js'].lineData[529]++;
        parent.insertBefore(el.removeChild(child), el);
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[532]++;
    parent.removeChild(el);
  }
  _$jscoverage['/editor/dom.js'].lineData[534]++;
  return el;
}, 
  _4e_trim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[23]++;
  _$jscoverage['/editor/dom.js'].lineData[540]++;
  Dom._4e_ltrim(el);
  _$jscoverage['/editor/dom.js'].lineData[541]++;
  Dom._4e_rtrim(el);
}, 
  _4e_ltrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[24]++;
  _$jscoverage['/editor/dom.js'].lineData[547]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[548]++;
  while (child = el.firstChild) {
    _$jscoverage['/editor/dom.js'].lineData[549]++;
    if (visit156_549_1(child.nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[550]++;
      var trimmed = Utils.ltrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[553]++;
      if (visit157_553_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[554]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[555]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[557]++;
        if (visit158_557_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[558]++;
          Dom._4e_splitText(child, originalLength - trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[560]++;
          el.removeChild(el.firstChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[563]++;
    break;
  }
}, 
  _4e_rtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[25]++;
  _$jscoverage['/editor/dom.js'].lineData[570]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[571]++;
  while (child = el.lastChild) {
    _$jscoverage['/editor/dom.js'].lineData[572]++;
    if (visit159_572_1(child.type == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[573]++;
      var trimmed = Utils.rtrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[575]++;
      if (visit160_575_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[576]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[577]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[578]++;
        if (visit161_578_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[579]++;
          Dom._4e_splitText(child, trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[582]++;
          el.removeChild(el.lastChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[585]++;
    break;
  }
  _$jscoverage['/editor/dom.js'].lineData[588]++;
  if (visit162_588_1(!UA['ie'] && !UA.opera)) {
    _$jscoverage['/editor/dom.js'].lineData[589]++;
    child = el.lastChild;
    _$jscoverage['/editor/dom.js'].lineData[590]++;
    if (visit163_590_1(child && visit164_591_1(visit165_591_2(child.nodeType == 1) && visit166_592_1(Dom.nodeName(child) == 'br')))) {
      _$jscoverage['/editor/dom.js'].lineData[593]++;
      el.removeChild(child);
    }
  }
}, 
  _4e_appendBogus: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[26]++;
  _$jscoverage['/editor/dom.js'].lineData[601]++;
  var lastChild = el.lastChild, bogus;
  _$jscoverage['/editor/dom.js'].lineData[604]++;
  while (visit167_604_1(lastChild && visit168_605_1(visit169_605_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(lastChild.nodeValue)))) {
    _$jscoverage['/editor/dom.js'].lineData[607]++;
    lastChild = lastChild.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[610]++;
  if (visit170_610_1(!lastChild || visit171_611_1(visit172_611_2(lastChild.nodeType == Dom.NodeType.TEXT_NODE) || visit173_612_1(Dom.nodeName(lastChild) !== 'br')))) {
    _$jscoverage['/editor/dom.js'].lineData[613]++;
    bogus = UA.opera ? el.ownerDocument.createTextNode('') : el.ownerDocument.createElement('br');
    _$jscoverage['/editor/dom.js'].lineData[619]++;
    el.appendChild(bogus);
  }
}, 
  _4e_setMarker: function(element, database, name, value) {
  _$jscoverage['/editor/dom.js'].functionData[27]++;
  _$jscoverage['/editor/dom.js'].lineData[625]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[626]++;
  var id = visit174_626_1(element.data('list_marker_id') || (element.data('list_marker_id', S.guid()).data('list_marker_id'))), markerNames = visit175_628_1(element.data('list_marker_names') || (element.data('list_marker_names', {}).data('list_marker_names')));
  _$jscoverage['/editor/dom.js'].lineData[630]++;
  database[id] = element;
  _$jscoverage['/editor/dom.js'].lineData[631]++;
  markerNames[name] = 1;
  _$jscoverage['/editor/dom.js'].lineData[632]++;
  return element.data(name, value);
}, 
  _4e_clearMarkers: function(element, database, removeFromDatabase) {
  _$jscoverage['/editor/dom.js'].functionData[28]++;
  _$jscoverage['/editor/dom.js'].lineData[638]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[639]++;
  var names = element.data('list_marker_names'), id = element.data('list_marker_id');
  _$jscoverage['/editor/dom.js'].lineData[641]++;
  for (var i in names) {
    _$jscoverage['/editor/dom.js'].lineData[642]++;
    element.removeData(i);
  }
  _$jscoverage['/editor/dom.js'].lineData[644]++;
  element.removeData('list_marker_names');
  _$jscoverage['/editor/dom.js'].lineData[645]++;
  if (visit176_645_1(removeFromDatabase)) {
    _$jscoverage['/editor/dom.js'].lineData[646]++;
    element.removeData('list_marker_id');
    _$jscoverage['/editor/dom.js'].lineData[647]++;
    delete database[id];
  }
}, 
  _4e_copyAttributes: function(el, target, skipAttributes) {
  _$jscoverage['/editor/dom.js'].functionData[29]++;
  _$jscoverage['/editor/dom.js'].lineData[654]++;
  target = normalEl(target);
  _$jscoverage['/editor/dom.js'].lineData[655]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[656]++;
  skipAttributes = visit177_656_1(skipAttributes || {});
  _$jscoverage['/editor/dom.js'].lineData[658]++;
  for (var n = 0; visit178_658_1(n < attributes.length); n++) {
    _$jscoverage['/editor/dom.js'].lineData[661]++;
    var attribute = attributes[n], attrName = attribute.name.toLowerCase(), attrValue;
    _$jscoverage['/editor/dom.js'].lineData[666]++;
    if (visit179_666_1(attrName in skipAttributes)) {
      _$jscoverage['/editor/dom.js'].lineData[667]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[670]++;
    if (visit180_670_1(visit181_670_2(attrName == 'checked') && (attrValue = Dom.attr(el, attrName)))) {
      _$jscoverage['/editor/dom.js'].lineData[671]++;
      target.attr(attrName, attrValue);
    } else {
      _$jscoverage['/editor/dom.js'].lineData[674]++;
      if (visit182_674_1(attribute.specified || (visit183_675_1(UA['ie'] && visit184_675_2(attribute.value && visit185_675_3(attrName == 'value')))))) {
        _$jscoverage['/editor/dom.js'].lineData[676]++;
        attrValue = Dom.attr(el, attrName);
        _$jscoverage['/editor/dom.js'].lineData[677]++;
        if (visit186_677_1(attrValue === NULL)) {
          _$jscoverage['/editor/dom.js'].lineData[678]++;
          attrValue = attribute.nodeValue;
        }
        _$jscoverage['/editor/dom.js'].lineData[680]++;
        target.attr(attrName, attrValue);
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[685]++;
  if (visit187_685_1(el.style.cssText !== '')) {
    _$jscoverage['/editor/dom.js'].lineData[686]++;
    target[0].style.cssText = el.style.cssText;
  }
}, 
  _4e_isEditable: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[30]++;
  _$jscoverage['/editor/dom.js'].lineData[693]++;
  var name = Dom.nodeName(el), dtd = visit188_694_1(!xhtml_dtd.$nonEditable[name] && (visit189_695_1(xhtml_dtd[name] || xhtml_dtd["span"])));
  _$jscoverage['/editor/dom.js'].lineData[697]++;
  return visit190_697_1(dtd && dtd['#text']);
}, 
  _4e_getByAddress: function(doc, address, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[31]++;
  _$jscoverage['/editor/dom.js'].lineData[702]++;
  var $ = doc.documentElement;
  _$jscoverage['/editor/dom.js'].lineData[704]++;
  for (var i = 0; visit191_704_1($ && visit192_704_2(i < address.length)); i++) {
    _$jscoverage['/editor/dom.js'].lineData[705]++;
    var target = address[i];
    _$jscoverage['/editor/dom.js'].lineData[707]++;
    if (visit193_707_1(!normalized)) {
      _$jscoverage['/editor/dom.js'].lineData[708]++;
      $ = $.childNodes[target];
      _$jscoverage['/editor/dom.js'].lineData[709]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[712]++;
    var currentIndex = -1;
    _$jscoverage['/editor/dom.js'].lineData[714]++;
    for (var j = 0; visit194_714_1(j < $.childNodes.length); j++) {
      _$jscoverage['/editor/dom.js'].lineData[715]++;
      var candidate = $.childNodes[j];
      _$jscoverage['/editor/dom.js'].lineData[717]++;
      if (visit195_717_1(visit196_717_2(normalized === TRUE) && visit197_718_1(visit198_718_2(candidate.nodeType == 3) && visit199_719_1(candidate.previousSibling && visit200_720_1(candidate.previousSibling.nodeType == 3))))) {
        _$jscoverage['/editor/dom.js'].lineData[721]++;
        continue;
      }
      _$jscoverage['/editor/dom.js'].lineData[724]++;
      currentIndex++;
      _$jscoverage['/editor/dom.js'].lineData[726]++;
      if (visit201_726_1(currentIndex == target)) {
        _$jscoverage['/editor/dom.js'].lineData[727]++;
        $ = candidate;
        _$jscoverage['/editor/dom.js'].lineData[728]++;
        break;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[733]++;
  return $;
}};
  _$jscoverage['/editor/dom.js'].lineData[737]++;
  function mergeElements(element, isNext) {
    _$jscoverage['/editor/dom.js'].functionData[32]++;
    _$jscoverage['/editor/dom.js'].lineData[738]++;
    var sibling = element[isNext ? "next" : "prev"](undefined, 1);
    _$jscoverage['/editor/dom.js'].lineData[740]++;
    if (visit202_740_1(sibling && visit203_740_2(sibling[0].nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom.js'].lineData[744]++;
      var pendingNodes = [];
      _$jscoverage['/editor/dom.js'].lineData[746]++;
      while (visit204_746_1(sibling.attr('_ke_bookmark') || sibling._4e_isEmptyInlineRemovable(undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[747]++;
        pendingNodes.push(sibling);
        _$jscoverage['/editor/dom.js'].lineData[748]++;
        sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
        _$jscoverage['/editor/dom.js'].lineData[749]++;
        if (visit205_749_1(!sibling)) {
          _$jscoverage['/editor/dom.js'].lineData[750]++;
          return;
        }
      }
      _$jscoverage['/editor/dom.js'].lineData[754]++;
      if (visit206_754_1(element._4e_isIdentical(sibling, undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[757]++;
        var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);
        _$jscoverage['/editor/dom.js'].lineData[760]++;
        while (pendingNodes.length) {
          _$jscoverage['/editor/dom.js'].lineData[761]++;
          pendingNodes.shift()._4e_move(element, !isNext, undefined);
        }
        _$jscoverage['/editor/dom.js'].lineData[764]++;
        sibling._4e_moveChildren(element, !isNext, undefined);
        _$jscoverage['/editor/dom.js'].lineData[765]++;
        sibling.remove();
        _$jscoverage['/editor/dom.js'].lineData[768]++;
        if (visit207_768_1(innerSibling[0] && visit208_768_2(innerSibling[0].nodeType == NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/dom.js'].lineData[769]++;
          innerSibling._4e_mergeSiblings();
        }
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[775]++;
  Utils.injectDom(editorDom);
}, {
  requires: ['./base', './utils', 'node']});
