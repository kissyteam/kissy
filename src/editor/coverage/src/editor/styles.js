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
if (! _$jscoverage['/editor/styles.js']) {
  _$jscoverage['/editor/styles.js'] = {};
  _$jscoverage['/editor/styles.js'].lineData = [];
  _$jscoverage['/editor/styles.js'].lineData[10] = 0;
  _$jscoverage['/editor/styles.js'].lineData[11] = 0;
  _$jscoverage['/editor/styles.js'].lineData[12] = 0;
  _$jscoverage['/editor/styles.js'].lineData[13] = 0;
  _$jscoverage['/editor/styles.js'].lineData[14] = 0;
  _$jscoverage['/editor/styles.js'].lineData[15] = 0;
  _$jscoverage['/editor/styles.js'].lineData[17] = 0;
  _$jscoverage['/editor/styles.js'].lineData[65] = 0;
  _$jscoverage['/editor/styles.js'].lineData[80] = 0;
  _$jscoverage['/editor/styles.js'].lineData[83] = 0;
  _$jscoverage['/editor/styles.js'].lineData[86] = 0;
  _$jscoverage['/editor/styles.js'].lineData[87] = 0;
  _$jscoverage['/editor/styles.js'].lineData[88] = 0;
  _$jscoverage['/editor/styles.js'].lineData[90] = 0;
  _$jscoverage['/editor/styles.js'].lineData[91] = 0;
  _$jscoverage['/editor/styles.js'].lineData[94] = 0;
  _$jscoverage['/editor/styles.js'].lineData[105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[108] = 0;
  _$jscoverage['/editor/styles.js'].lineData[111] = 0;
  _$jscoverage['/editor/styles.js'].lineData[113] = 0;
  _$jscoverage['/editor/styles.js'].lineData[118] = 0;
  _$jscoverage['/editor/styles.js'].lineData[123] = 0;
  _$jscoverage['/editor/styles.js'].lineData[125] = 0;
  _$jscoverage['/editor/styles.js'].lineData[129] = 0;
  _$jscoverage['/editor/styles.js'].lineData[131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[133] = 0;
  _$jscoverage['/editor/styles.js'].lineData[134] = 0;
  _$jscoverage['/editor/styles.js'].lineData[136] = 0;
  _$jscoverage['/editor/styles.js'].lineData[138] = 0;
  _$jscoverage['/editor/styles.js'].lineData[141] = 0;
  _$jscoverage['/editor/styles.js'].lineData[145] = 0;
  _$jscoverage['/editor/styles.js'].lineData[149] = 0;
  _$jscoverage['/editor/styles.js'].lineData[153] = 0;
  _$jscoverage['/editor/styles.js'].lineData[154] = 0;
  _$jscoverage['/editor/styles.js'].lineData[167] = 0;
  _$jscoverage['/editor/styles.js'].lineData[168] = 0;
  _$jscoverage['/editor/styles.js'].lineData[177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[178] = 0;
  _$jscoverage['/editor/styles.js'].lineData[180] = 0;
  _$jscoverage['/editor/styles.js'].lineData[181] = 0;
  _$jscoverage['/editor/styles.js'].lineData[185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[187] = 0;
  _$jscoverage['/editor/styles.js'].lineData[188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[191] = 0;
  _$jscoverage['/editor/styles.js'].lineData[193] = 0;
  _$jscoverage['/editor/styles.js'].lineData[194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[196] = 0;
  _$jscoverage['/editor/styles.js'].lineData[197] = 0;
  _$jscoverage['/editor/styles.js'].lineData[200] = 0;
  _$jscoverage['/editor/styles.js'].lineData[201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[206] = 0;
  _$jscoverage['/editor/styles.js'].lineData[209] = 0;
  _$jscoverage['/editor/styles.js'].lineData[210] = 0;
  _$jscoverage['/editor/styles.js'].lineData[214] = 0;
  _$jscoverage['/editor/styles.js'].lineData[215] = 0;
  _$jscoverage['/editor/styles.js'].lineData[219] = 0;
  _$jscoverage['/editor/styles.js'].lineData[224] = 0;
  _$jscoverage['/editor/styles.js'].lineData[228] = 0;
  _$jscoverage['/editor/styles.js'].lineData[230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[231] = 0;
  _$jscoverage['/editor/styles.js'].lineData[233] = 0;
  _$jscoverage['/editor/styles.js'].lineData[234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[235] = 0;
  _$jscoverage['/editor/styles.js'].lineData[236] = 0;
  _$jscoverage['/editor/styles.js'].lineData[237] = 0;
  _$jscoverage['/editor/styles.js'].lineData[238] = 0;
  _$jscoverage['/editor/styles.js'].lineData[245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[248] = 0;
  _$jscoverage['/editor/styles.js'].lineData[253] = 0;
  _$jscoverage['/editor/styles.js'].lineData[254] = 0;
  _$jscoverage['/editor/styles.js'].lineData[255] = 0;
  _$jscoverage['/editor/styles.js'].lineData[256] = 0;
  _$jscoverage['/editor/styles.js'].lineData[257] = 0;
  _$jscoverage['/editor/styles.js'].lineData[258] = 0;
  _$jscoverage['/editor/styles.js'].lineData[259] = 0;
  _$jscoverage['/editor/styles.js'].lineData[261] = 0;
  _$jscoverage['/editor/styles.js'].lineData[267] = 0;
  _$jscoverage['/editor/styles.js'].lineData[275] = 0;
  _$jscoverage['/editor/styles.js'].lineData[277] = 0;
  _$jscoverage['/editor/styles.js'].lineData[282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[284] = 0;
  _$jscoverage['/editor/styles.js'].lineData[285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[289] = 0;
  _$jscoverage['/editor/styles.js'].lineData[292] = 0;
  _$jscoverage['/editor/styles.js'].lineData[293] = 0;
  _$jscoverage['/editor/styles.js'].lineData[296] = 0;
  _$jscoverage['/editor/styles.js'].lineData[297] = 0;
  _$jscoverage['/editor/styles.js'].lineData[301] = 0;
  _$jscoverage['/editor/styles.js'].lineData[306] = 0;
  _$jscoverage['/editor/styles.js'].lineData[308] = 0;
  _$jscoverage['/editor/styles.js'].lineData[309] = 0;
  _$jscoverage['/editor/styles.js'].lineData[310] = 0;
  _$jscoverage['/editor/styles.js'].lineData[313] = 0;
  _$jscoverage['/editor/styles.js'].lineData[316] = 0;
  _$jscoverage['/editor/styles.js'].lineData[319] = 0;
  _$jscoverage['/editor/styles.js'].lineData[320] = 0;
  _$jscoverage['/editor/styles.js'].lineData[323] = 0;
  _$jscoverage['/editor/styles.js'].lineData[325] = 0;
  _$jscoverage['/editor/styles.js'].lineData[329] = 0;
  _$jscoverage['/editor/styles.js'].lineData[330] = 0;
  _$jscoverage['/editor/styles.js'].lineData[333] = 0;
  _$jscoverage['/editor/styles.js'].lineData[340] = 0;
  _$jscoverage['/editor/styles.js'].lineData[341] = 0;
  _$jscoverage['/editor/styles.js'].lineData[344] = 0;
  _$jscoverage['/editor/styles.js'].lineData[347] = 0;
  _$jscoverage['/editor/styles.js'].lineData[348] = 0;
  _$jscoverage['/editor/styles.js'].lineData[351] = 0;
  _$jscoverage['/editor/styles.js'].lineData[352] = 0;
  _$jscoverage['/editor/styles.js'].lineData[357] = 0;
  _$jscoverage['/editor/styles.js'].lineData[358] = 0;
  _$jscoverage['/editor/styles.js'].lineData[362] = 0;
  _$jscoverage['/editor/styles.js'].lineData[365] = 0;
  _$jscoverage['/editor/styles.js'].lineData[366] = 0;
  _$jscoverage['/editor/styles.js'].lineData[369] = 0;
  _$jscoverage['/editor/styles.js'].lineData[372] = 0;
  _$jscoverage['/editor/styles.js'].lineData[373] = 0;
  _$jscoverage['/editor/styles.js'].lineData[378] = 0;
  _$jscoverage['/editor/styles.js'].lineData[379] = 0;
  _$jscoverage['/editor/styles.js'].lineData[380] = 0;
  _$jscoverage['/editor/styles.js'].lineData[386] = 0;
  _$jscoverage['/editor/styles.js'].lineData[387] = 0;
  _$jscoverage['/editor/styles.js'].lineData[390] = 0;
  _$jscoverage['/editor/styles.js'].lineData[393] = 0;
  _$jscoverage['/editor/styles.js'].lineData[396] = 0;
  _$jscoverage['/editor/styles.js'].lineData[398] = 0;
  _$jscoverage['/editor/styles.js'].lineData[402] = 0;
  _$jscoverage['/editor/styles.js'].lineData[404] = 0;
  _$jscoverage['/editor/styles.js'].lineData[406] = 0;
  _$jscoverage['/editor/styles.js'].lineData[407] = 0;
  _$jscoverage['/editor/styles.js'].lineData[408] = 0;
  _$jscoverage['/editor/styles.js'].lineData[410] = 0;
  _$jscoverage['/editor/styles.js'].lineData[414] = 0;
  _$jscoverage['/editor/styles.js'].lineData[415] = 0;
  _$jscoverage['/editor/styles.js'].lineData[418] = 0;
  _$jscoverage['/editor/styles.js'].lineData[420] = 0;
  _$jscoverage['/editor/styles.js'].lineData[421] = 0;
  _$jscoverage['/editor/styles.js'].lineData[423] = 0;
  _$jscoverage['/editor/styles.js'].lineData[424] = 0;
  _$jscoverage['/editor/styles.js'].lineData[426] = 0;
  _$jscoverage['/editor/styles.js'].lineData[428] = 0;
  _$jscoverage['/editor/styles.js'].lineData[434] = 0;
  _$jscoverage['/editor/styles.js'].lineData[436] = 0;
  _$jscoverage['/editor/styles.js'].lineData[439] = 0;
  _$jscoverage['/editor/styles.js'].lineData[442] = 0;
  _$jscoverage['/editor/styles.js'].lineData[446] = 0;
  _$jscoverage['/editor/styles.js'].lineData[449] = 0;
  _$jscoverage['/editor/styles.js'].lineData[452] = 0;
  _$jscoverage['/editor/styles.js'].lineData[453] = 0;
  _$jscoverage['/editor/styles.js'].lineData[454] = 0;
  _$jscoverage['/editor/styles.js'].lineData[455] = 0;
  _$jscoverage['/editor/styles.js'].lineData[456] = 0;
  _$jscoverage['/editor/styles.js'].lineData[457] = 0;
  _$jscoverage['/editor/styles.js'].lineData[460] = 0;
  _$jscoverage['/editor/styles.js'].lineData[463] = 0;
  _$jscoverage['/editor/styles.js'].lineData[468] = 0;
  _$jscoverage['/editor/styles.js'].lineData[471] = 0;
  _$jscoverage['/editor/styles.js'].lineData[476] = 0;
  _$jscoverage['/editor/styles.js'].lineData[479] = 0;
  _$jscoverage['/editor/styles.js'].lineData[480] = 0;
  _$jscoverage['/editor/styles.js'].lineData[482] = 0;
  _$jscoverage['/editor/styles.js'].lineData[484] = 0;
  _$jscoverage['/editor/styles.js'].lineData[490] = 0;
  _$jscoverage['/editor/styles.js'].lineData[491] = 0;
  _$jscoverage['/editor/styles.js'].lineData[496] = 0;
  _$jscoverage['/editor/styles.js'].lineData[497] = 0;
  _$jscoverage['/editor/styles.js'].lineData[499] = 0;
  _$jscoverage['/editor/styles.js'].lineData[501] = 0;
  _$jscoverage['/editor/styles.js'].lineData[504] = 0;
  _$jscoverage['/editor/styles.js'].lineData[507] = 0;
  _$jscoverage['/editor/styles.js'].lineData[508] = 0;
  _$jscoverage['/editor/styles.js'].lineData[510] = 0;
  _$jscoverage['/editor/styles.js'].lineData[515] = 0;
  _$jscoverage['/editor/styles.js'].lineData[516] = 0;
  _$jscoverage['/editor/styles.js'].lineData[517] = 0;
  _$jscoverage['/editor/styles.js'].lineData[519] = 0;
  _$jscoverage['/editor/styles.js'].lineData[529] = 0;
  _$jscoverage['/editor/styles.js'].lineData[533] = 0;
  _$jscoverage['/editor/styles.js'].lineData[534] = 0;
  _$jscoverage['/editor/styles.js'].lineData[537] = 0;
  _$jscoverage['/editor/styles.js'].lineData[540] = 0;
  _$jscoverage['/editor/styles.js'].lineData[545] = 0;
  _$jscoverage['/editor/styles.js'].lineData[546] = 0;
  _$jscoverage['/editor/styles.js'].lineData[547] = 0;
  _$jscoverage['/editor/styles.js'].lineData[548] = 0;
  _$jscoverage['/editor/styles.js'].lineData[552] = 0;
  _$jscoverage['/editor/styles.js'].lineData[553] = 0;
  _$jscoverage['/editor/styles.js'].lineData[554] = 0;
  _$jscoverage['/editor/styles.js'].lineData[557] = 0;
  _$jscoverage['/editor/styles.js'].lineData[558] = 0;
  _$jscoverage['/editor/styles.js'].lineData[559] = 0;
  _$jscoverage['/editor/styles.js'].lineData[561] = 0;
  _$jscoverage['/editor/styles.js'].lineData[562] = 0;
  _$jscoverage['/editor/styles.js'].lineData[565] = 0;
  _$jscoverage['/editor/styles.js'].lineData[571] = 0;
  _$jscoverage['/editor/styles.js'].lineData[572] = 0;
  _$jscoverage['/editor/styles.js'].lineData[574] = 0;
  _$jscoverage['/editor/styles.js'].lineData[577] = 0;
  _$jscoverage['/editor/styles.js'].lineData[578] = 0;
  _$jscoverage['/editor/styles.js'].lineData[579] = 0;
  _$jscoverage['/editor/styles.js'].lineData[581] = 0;
  _$jscoverage['/editor/styles.js'].lineData[584] = 0;
  _$jscoverage['/editor/styles.js'].lineData[585] = 0;
  _$jscoverage['/editor/styles.js'].lineData[588] = 0;
  _$jscoverage['/editor/styles.js'].lineData[590] = 0;
  _$jscoverage['/editor/styles.js'].lineData[592] = 0;
  _$jscoverage['/editor/styles.js'].lineData[594] = 0;
  _$jscoverage['/editor/styles.js'].lineData[595] = 0;
  _$jscoverage['/editor/styles.js'].lineData[597] = 0;
  _$jscoverage['/editor/styles.js'].lineData[602] = 0;
  _$jscoverage['/editor/styles.js'].lineData[603] = 0;
  _$jscoverage['/editor/styles.js'].lineData[604] = 0;
  _$jscoverage['/editor/styles.js'].lineData[608] = 0;
  _$jscoverage['/editor/styles.js'].lineData[611] = 0;
  _$jscoverage['/editor/styles.js'].lineData[612] = 0;
  _$jscoverage['/editor/styles.js'].lineData[616] = 0;
  _$jscoverage['/editor/styles.js'].lineData[622] = 0;
  _$jscoverage['/editor/styles.js'].lineData[623] = 0;
  _$jscoverage['/editor/styles.js'].lineData[625] = 0;
  _$jscoverage['/editor/styles.js'].lineData[626] = 0;
  _$jscoverage['/editor/styles.js'].lineData[627] = 0;
  _$jscoverage['/editor/styles.js'].lineData[630] = 0;
  _$jscoverage['/editor/styles.js'].lineData[634] = 0;
  _$jscoverage['/editor/styles.js'].lineData[635] = 0;
  _$jscoverage['/editor/styles.js'].lineData[636] = 0;
  _$jscoverage['/editor/styles.js'].lineData[640] = 0;
  _$jscoverage['/editor/styles.js'].lineData[650] = 0;
  _$jscoverage['/editor/styles.js'].lineData[661] = 0;
  _$jscoverage['/editor/styles.js'].lineData[664] = 0;
  _$jscoverage['/editor/styles.js'].lineData[665] = 0;
  _$jscoverage['/editor/styles.js'].lineData[666] = 0;
  _$jscoverage['/editor/styles.js'].lineData[667] = 0;
  _$jscoverage['/editor/styles.js'].lineData[672] = 0;
  _$jscoverage['/editor/styles.js'].lineData[679] = 0;
  _$jscoverage['/editor/styles.js'].lineData[688] = 0;
  _$jscoverage['/editor/styles.js'].lineData[689] = 0;
  _$jscoverage['/editor/styles.js'].lineData[694] = 0;
  _$jscoverage['/editor/styles.js'].lineData[696] = 0;
  _$jscoverage['/editor/styles.js'].lineData[709] = 0;
  _$jscoverage['/editor/styles.js'].lineData[719] = 0;
  _$jscoverage['/editor/styles.js'].lineData[722] = 0;
  _$jscoverage['/editor/styles.js'].lineData[727] = 0;
  _$jscoverage['/editor/styles.js'].lineData[731] = 0;
  _$jscoverage['/editor/styles.js'].lineData[735] = 0;
  _$jscoverage['/editor/styles.js'].lineData[739] = 0;
  _$jscoverage['/editor/styles.js'].lineData[741] = 0;
  _$jscoverage['/editor/styles.js'].lineData[747] = 0;
  _$jscoverage['/editor/styles.js'].lineData[756] = 0;
  _$jscoverage['/editor/styles.js'].lineData[760] = 0;
  _$jscoverage['/editor/styles.js'].lineData[761] = 0;
  _$jscoverage['/editor/styles.js'].lineData[762] = 0;
  _$jscoverage['/editor/styles.js'].lineData[764] = 0;
  _$jscoverage['/editor/styles.js'].lineData[765] = 0;
  _$jscoverage['/editor/styles.js'].lineData[768] = 0;
  _$jscoverage['/editor/styles.js'].lineData[770] = 0;
  _$jscoverage['/editor/styles.js'].lineData[772] = 0;
  _$jscoverage['/editor/styles.js'].lineData[780] = 0;
  _$jscoverage['/editor/styles.js'].lineData[782] = 0;
  _$jscoverage['/editor/styles.js'].lineData[783] = 0;
  _$jscoverage['/editor/styles.js'].lineData[786] = 0;
  _$jscoverage['/editor/styles.js'].lineData[788] = 0;
  _$jscoverage['/editor/styles.js'].lineData[790] = 0;
  _$jscoverage['/editor/styles.js'].lineData[795] = 0;
  _$jscoverage['/editor/styles.js'].lineData[796] = 0;
  _$jscoverage['/editor/styles.js'].lineData[797] = 0;
  _$jscoverage['/editor/styles.js'].lineData[801] = 0;
  _$jscoverage['/editor/styles.js'].lineData[804] = 0;
  _$jscoverage['/editor/styles.js'].lineData[806] = 0;
  _$jscoverage['/editor/styles.js'].lineData[810] = 0;
  _$jscoverage['/editor/styles.js'].lineData[814] = 0;
  _$jscoverage['/editor/styles.js'].lineData[817] = 0;
  _$jscoverage['/editor/styles.js'].lineData[825] = 0;
  _$jscoverage['/editor/styles.js'].lineData[826] = 0;
  _$jscoverage['/editor/styles.js'].lineData[840] = 0;
  _$jscoverage['/editor/styles.js'].lineData[841] = 0;
  _$jscoverage['/editor/styles.js'].lineData[842] = 0;
  _$jscoverage['/editor/styles.js'].lineData[843] = 0;
  _$jscoverage['/editor/styles.js'].lineData[844] = 0;
  _$jscoverage['/editor/styles.js'].lineData[849] = 0;
  _$jscoverage['/editor/styles.js'].lineData[853] = 0;
  _$jscoverage['/editor/styles.js'].lineData[854] = 0;
  _$jscoverage['/editor/styles.js'].lineData[855] = 0;
  _$jscoverage['/editor/styles.js'].lineData[857] = 0;
  _$jscoverage['/editor/styles.js'].lineData[861] = 0;
  _$jscoverage['/editor/styles.js'].lineData[866] = 0;
  _$jscoverage['/editor/styles.js'].lineData[868] = 0;
  _$jscoverage['/editor/styles.js'].lineData[871] = 0;
  _$jscoverage['/editor/styles.js'].lineData[873] = 0;
  _$jscoverage['/editor/styles.js'].lineData[878] = 0;
  _$jscoverage['/editor/styles.js'].lineData[886] = 0;
  _$jscoverage['/editor/styles.js'].lineData[887] = 0;
  _$jscoverage['/editor/styles.js'].lineData[889] = 0;
  _$jscoverage['/editor/styles.js'].lineData[890] = 0;
  _$jscoverage['/editor/styles.js'].lineData[893] = 0;
  _$jscoverage['/editor/styles.js'].lineData[894] = 0;
  _$jscoverage['/editor/styles.js'].lineData[895] = 0;
  _$jscoverage['/editor/styles.js'].lineData[903] = 0;
  _$jscoverage['/editor/styles.js'].lineData[907] = 0;
  _$jscoverage['/editor/styles.js'].lineData[908] = 0;
  _$jscoverage['/editor/styles.js'].lineData[909] = 0;
  _$jscoverage['/editor/styles.js'].lineData[912] = 0;
  _$jscoverage['/editor/styles.js'].lineData[922] = 0;
  _$jscoverage['/editor/styles.js'].lineData[923] = 0;
  _$jscoverage['/editor/styles.js'].lineData[924] = 0;
  _$jscoverage['/editor/styles.js'].lineData[925] = 0;
  _$jscoverage['/editor/styles.js'].lineData[926] = 0;
  _$jscoverage['/editor/styles.js'].lineData[927] = 0;
  _$jscoverage['/editor/styles.js'].lineData[930] = 0;
  _$jscoverage['/editor/styles.js'].lineData[931] = 0;
  _$jscoverage['/editor/styles.js'].lineData[934] = 0;
  _$jscoverage['/editor/styles.js'].lineData[936] = 0;
  _$jscoverage['/editor/styles.js'].lineData[937] = 0;
  _$jscoverage['/editor/styles.js'].lineData[943] = 0;
  _$jscoverage['/editor/styles.js'].lineData[946] = 0;
  _$jscoverage['/editor/styles.js'].lineData[947] = 0;
  _$jscoverage['/editor/styles.js'].lineData[950] = 0;
  _$jscoverage['/editor/styles.js'].lineData[953] = 0;
  _$jscoverage['/editor/styles.js'].lineData[954] = 0;
  _$jscoverage['/editor/styles.js'].lineData[962] = 0;
  _$jscoverage['/editor/styles.js'].lineData[969] = 0;
  _$jscoverage['/editor/styles.js'].lineData[970] = 0;
  _$jscoverage['/editor/styles.js'].lineData[975] = 0;
  _$jscoverage['/editor/styles.js'].lineData[976] = 0;
  _$jscoverage['/editor/styles.js'].lineData[978] = 0;
  _$jscoverage['/editor/styles.js'].lineData[980] = 0;
  _$jscoverage['/editor/styles.js'].lineData[983] = 0;
  _$jscoverage['/editor/styles.js'].lineData[984] = 0;
  _$jscoverage['/editor/styles.js'].lineData[987] = 0;
  _$jscoverage['/editor/styles.js'].lineData[988] = 0;
  _$jscoverage['/editor/styles.js'].lineData[990] = 0;
  _$jscoverage['/editor/styles.js'].lineData[992] = 0;
  _$jscoverage['/editor/styles.js'].lineData[995] = 0;
  _$jscoverage['/editor/styles.js'].lineData[996] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1000] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1001] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1003] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1004] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1008] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1011] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1012] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1017] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1018] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1022] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1023] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1026] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1027] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1038] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1040] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1041] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1044] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1047] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1051] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1052] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1053] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1055] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1057] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1059] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1062] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1063] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1064] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1066] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1067] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1069] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1073] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1076] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1080] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1083] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1084] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1085] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1088] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1089] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1091] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1094] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1099] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1109] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1111] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1112] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1113] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1115] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1121] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1122] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1124] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1125] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1132] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1133] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1134] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1136] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1141] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1144] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1145] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1154] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1155] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1156] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1159] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1162] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1165] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1166] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1170] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1171] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1172] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1173] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1174] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1178] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1182] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1186] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1192] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1195] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1199] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1210] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1214] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1216] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1220] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1231] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1242] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1247] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1249] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1250] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1254] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1257] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1259] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1262] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1264] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1270] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1273] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1274] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1275] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1276] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1280] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1281] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1288] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1293] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1295] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1296] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1297] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1298] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1299] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1312] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1313] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1316] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1317] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1318] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1320] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1321] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1329] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1332] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1338] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1340] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1341] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1342] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1344] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1345] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1346] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1350] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1356] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1360] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1363] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1366] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1369] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1371] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1373] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1374] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1377] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1378] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1384] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1386] = 0;
}
if (! _$jscoverage['/editor/styles.js'].functionData) {
  _$jscoverage['/editor/styles.js'].functionData = [];
  _$jscoverage['/editor/styles.js'].functionData[0] = 0;
  _$jscoverage['/editor/styles.js'].functionData[1] = 0;
  _$jscoverage['/editor/styles.js'].functionData[2] = 0;
  _$jscoverage['/editor/styles.js'].functionData[3] = 0;
  _$jscoverage['/editor/styles.js'].functionData[4] = 0;
  _$jscoverage['/editor/styles.js'].functionData[5] = 0;
  _$jscoverage['/editor/styles.js'].functionData[6] = 0;
  _$jscoverage['/editor/styles.js'].functionData[7] = 0;
  _$jscoverage['/editor/styles.js'].functionData[8] = 0;
  _$jscoverage['/editor/styles.js'].functionData[9] = 0;
  _$jscoverage['/editor/styles.js'].functionData[10] = 0;
  _$jscoverage['/editor/styles.js'].functionData[11] = 0;
  _$jscoverage['/editor/styles.js'].functionData[12] = 0;
  _$jscoverage['/editor/styles.js'].functionData[13] = 0;
  _$jscoverage['/editor/styles.js'].functionData[14] = 0;
  _$jscoverage['/editor/styles.js'].functionData[15] = 0;
  _$jscoverage['/editor/styles.js'].functionData[16] = 0;
  _$jscoverage['/editor/styles.js'].functionData[17] = 0;
  _$jscoverage['/editor/styles.js'].functionData[18] = 0;
  _$jscoverage['/editor/styles.js'].functionData[19] = 0;
  _$jscoverage['/editor/styles.js'].functionData[20] = 0;
  _$jscoverage['/editor/styles.js'].functionData[21] = 0;
  _$jscoverage['/editor/styles.js'].functionData[22] = 0;
  _$jscoverage['/editor/styles.js'].functionData[23] = 0;
  _$jscoverage['/editor/styles.js'].functionData[24] = 0;
  _$jscoverage['/editor/styles.js'].functionData[25] = 0;
  _$jscoverage['/editor/styles.js'].functionData[26] = 0;
  _$jscoverage['/editor/styles.js'].functionData[27] = 0;
  _$jscoverage['/editor/styles.js'].functionData[28] = 0;
  _$jscoverage['/editor/styles.js'].functionData[29] = 0;
  _$jscoverage['/editor/styles.js'].functionData[30] = 0;
  _$jscoverage['/editor/styles.js'].functionData[31] = 0;
  _$jscoverage['/editor/styles.js'].functionData[32] = 0;
  _$jscoverage['/editor/styles.js'].functionData[33] = 0;
  _$jscoverage['/editor/styles.js'].functionData[34] = 0;
  _$jscoverage['/editor/styles.js'].functionData[35] = 0;
  _$jscoverage['/editor/styles.js'].functionData[36] = 0;
  _$jscoverage['/editor/styles.js'].functionData[37] = 0;
  _$jscoverage['/editor/styles.js'].functionData[38] = 0;
  _$jscoverage['/editor/styles.js'].functionData[39] = 0;
  _$jscoverage['/editor/styles.js'].functionData[40] = 0;
}
if (! _$jscoverage['/editor/styles.js'].branchData) {
  _$jscoverage['/editor/styles.js'].branchData = {};
  _$jscoverage['/editor/styles.js'].branchData['88'] = [];
  _$jscoverage['/editor/styles.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['106'] = [];
  _$jscoverage['/editor/styles.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['111'] = [];
  _$jscoverage['/editor/styles.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['113'] = [];
  _$jscoverage['/editor/styles.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['134'] = [];
  _$jscoverage['/editor/styles.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['155'] = [];
  _$jscoverage['/editor/styles.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['157'] = [];
  _$jscoverage['/editor/styles.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['159'] = [];
  _$jscoverage['/editor/styles.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['169'] = [];
  _$jscoverage['/editor/styles.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['177'] = [];
  _$jscoverage['/editor/styles.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['185'] = [];
  _$jscoverage['/editor/styles.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['187'] = [];
  _$jscoverage['/editor/styles.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['193'] = [];
  _$jscoverage['/editor/styles.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['196'] = [];
  _$jscoverage['/editor/styles.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['200'] = [];
  _$jscoverage['/editor/styles.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['201'] = [];
  _$jscoverage['/editor/styles.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['204'] = [];
  _$jscoverage['/editor/styles.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['205'] = [];
  _$jscoverage['/editor/styles.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['209'] = [];
  _$jscoverage['/editor/styles.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['226'] = [];
  _$jscoverage['/editor/styles.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['228'] = [];
  _$jscoverage['/editor/styles.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['230'] = [];
  _$jscoverage['/editor/styles.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['233'] = [];
  _$jscoverage['/editor/styles.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['234'] = [];
  _$jscoverage['/editor/styles.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['237'] = [];
  _$jscoverage['/editor/styles.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'] = [];
  _$jscoverage['/editor/styles.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['246'] = [];
  _$jscoverage['/editor/styles.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['246'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['246'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['247'] = [];
  _$jscoverage['/editor/styles.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['253'] = [];
  _$jscoverage['/editor/styles.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['254'] = [];
  _$jscoverage['/editor/styles.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['257'] = [];
  _$jscoverage['/editor/styles.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['259'] = [];
  _$jscoverage['/editor/styles.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['259'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['259'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['259'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['259'][5] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['259'][6] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['260'] = [];
  _$jscoverage['/editor/styles.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['277'] = [];
  _$jscoverage['/editor/styles.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['284'] = [];
  _$jscoverage['/editor/styles.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['287'] = [];
  _$jscoverage['/editor/styles.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['287'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['292'] = [];
  _$jscoverage['/editor/styles.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['296'] = [];
  _$jscoverage['/editor/styles.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['309'] = [];
  _$jscoverage['/editor/styles.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['316'] = [];
  _$jscoverage['/editor/styles.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['319'] = [];
  _$jscoverage['/editor/styles.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['329'] = [];
  _$jscoverage['/editor/styles.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['340'] = [];
  _$jscoverage['/editor/styles.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['357'] = [];
  _$jscoverage['/editor/styles.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['365'] = [];
  _$jscoverage['/editor/styles.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['378'] = [];
  _$jscoverage['/editor/styles.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['386'] = [];
  _$jscoverage['/editor/styles.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['420'] = [];
  _$jscoverage['/editor/styles.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['423'] = [];
  _$jscoverage['/editor/styles.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['452'] = [];
  _$jscoverage['/editor/styles.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['491'] = [];
  _$jscoverage['/editor/styles.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['492'] = [];
  _$jscoverage['/editor/styles.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['493'] = [];
  _$jscoverage['/editor/styles.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['494'] = [];
  _$jscoverage['/editor/styles.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['496'] = [];
  _$jscoverage['/editor/styles.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['499'] = [];
  _$jscoverage['/editor/styles.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['508'] = [];
  _$jscoverage['/editor/styles.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['517'] = [];
  _$jscoverage['/editor/styles.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['517'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['518'] = [];
  _$jscoverage['/editor/styles.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['533'] = [];
  _$jscoverage['/editor/styles.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['547'] = [];
  _$jscoverage['/editor/styles.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['558'] = [];
  _$jscoverage['/editor/styles.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['561'] = [];
  _$jscoverage['/editor/styles.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['588'] = [];
  _$jscoverage['/editor/styles.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['602'] = [];
  _$jscoverage['/editor/styles.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['622'] = [];
  _$jscoverage['/editor/styles.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['625'] = [];
  _$jscoverage['/editor/styles.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['631'] = [];
  _$jscoverage['/editor/styles.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['634'] = [];
  _$jscoverage['/editor/styles.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['640'] = [];
  _$jscoverage['/editor/styles.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['641'] = [];
  _$jscoverage['/editor/styles.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['642'] = [];
  _$jscoverage['/editor/styles.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['642'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['648'] = [];
  _$jscoverage['/editor/styles.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['661'] = [];
  _$jscoverage['/editor/styles.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['662'] = [];
  _$jscoverage['/editor/styles.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['662'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['663'] = [];
  _$jscoverage['/editor/styles.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'] = [];
  _$jscoverage['/editor/styles.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['673'] = [];
  _$jscoverage['/editor/styles.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['674'] = [];
  _$jscoverage['/editor/styles.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['679'] = [];
  _$jscoverage['/editor/styles.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'] = [];
  _$jscoverage['/editor/styles.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['694'] = [];
  _$jscoverage['/editor/styles.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['694'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['695'] = [];
  _$jscoverage['/editor/styles.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['695'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['710'] = [];
  _$jscoverage['/editor/styles.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['711'] = [];
  _$jscoverage['/editor/styles.js'].branchData['711'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['711'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['713'] = [];
  _$jscoverage['/editor/styles.js'].branchData['713'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['713'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['718'] = [];
  _$jscoverage['/editor/styles.js'].branchData['718'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['739'] = [];
  _$jscoverage['/editor/styles.js'].branchData['739'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['739'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['760'] = [];
  _$jscoverage['/editor/styles.js'].branchData['760'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['760'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['760'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['761'] = [];
  _$jscoverage['/editor/styles.js'].branchData['761'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['764'] = [];
  _$jscoverage['/editor/styles.js'].branchData['764'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['768'] = [];
  _$jscoverage['/editor/styles.js'].branchData['768'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['782'] = [];
  _$jscoverage['/editor/styles.js'].branchData['782'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['786'] = [];
  _$jscoverage['/editor/styles.js'].branchData['786'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['795'] = [];
  _$jscoverage['/editor/styles.js'].branchData['795'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['804'] = [];
  _$jscoverage['/editor/styles.js'].branchData['804'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['825'] = [];
  _$jscoverage['/editor/styles.js'].branchData['825'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['871'] = [];
  _$jscoverage['/editor/styles.js'].branchData['871'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['878'] = [];
  _$jscoverage['/editor/styles.js'].branchData['878'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['878'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['886'] = [];
  _$jscoverage['/editor/styles.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['886'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['886'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['889'] = [];
  _$jscoverage['/editor/styles.js'].branchData['889'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['891'] = [];
  _$jscoverage['/editor/styles.js'].branchData['891'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['893'] = [];
  _$jscoverage['/editor/styles.js'].branchData['893'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['907'] = [];
  _$jscoverage['/editor/styles.js'].branchData['907'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['910'] = [];
  _$jscoverage['/editor/styles.js'].branchData['910'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['922'] = [];
  _$jscoverage['/editor/styles.js'].branchData['922'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['926'] = [];
  _$jscoverage['/editor/styles.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['930'] = [];
  _$jscoverage['/editor/styles.js'].branchData['930'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['942'] = [];
  _$jscoverage['/editor/styles.js'].branchData['942'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['947'] = [];
  _$jscoverage['/editor/styles.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['949'] = [];
  _$jscoverage['/editor/styles.js'].branchData['949'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['953'] = [];
  _$jscoverage['/editor/styles.js'].branchData['953'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['975'] = [];
  _$jscoverage['/editor/styles.js'].branchData['975'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['978'] = [];
  _$jscoverage['/editor/styles.js'].branchData['978'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['978'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['979'] = [];
  _$jscoverage['/editor/styles.js'].branchData['979'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['983'] = [];
  _$jscoverage['/editor/styles.js'].branchData['983'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['987'] = [];
  _$jscoverage['/editor/styles.js'].branchData['987'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['990'] = [];
  _$jscoverage['/editor/styles.js'].branchData['990'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['990'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['991'] = [];
  _$jscoverage['/editor/styles.js'].branchData['991'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['995'] = [];
  _$jscoverage['/editor/styles.js'].branchData['995'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1000'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1000'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1003'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1003'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1012'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1012'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1018'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1018'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1019'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1019'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1019'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1022'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1022'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1028'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1028'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1038'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1038'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1038'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1063'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1063'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1066'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1066'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1073'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1073'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1073'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1074'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1074'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1074'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1075'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1075'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1075'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1075'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1085'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1085'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1091'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1091'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1112'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1112'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1121'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1121'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1132'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1132'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1133'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1133'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1155'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1155'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1162'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1162'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1165'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1165'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1170'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1170'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1177'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1177'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1192'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1192'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1195'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1195'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1200'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1200'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1210'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1210'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1215'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1215'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1234'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1234'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1234'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1236'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1236'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1236'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1238'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1238'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1245'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1245'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1245'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1245'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1245'][4] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1249'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1249'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1257'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1257'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1258'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1258'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1262'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1262'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1287'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1287'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1295'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1295'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1297'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1297'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1314'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1314'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1316'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1316'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1317'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1317'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1329'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1329'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1329'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1330'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1330'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1330'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1331'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1331'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1331'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1331'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1338'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1338'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1340'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1340'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1341'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1341'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1346'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1346'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1346'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1348'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1348'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1348'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1349'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1349'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1349'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1349'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1363'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1363'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1371'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1371'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1373'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1373'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1377'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1377'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1377'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1377'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1377'][4] = new BranchData();
}
_$jscoverage['/editor/styles.js'].branchData['1377'][4].init(261, 48, 'lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1065_1377_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['1377'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1377'][3].init(233, 24, 'firstChild !== lastChild');
function visit1064_1377_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1377'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1377'][2].init(233, 76, 'firstChild !== lastChild && lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1063_1377_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1377'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1377'][1].init(220, 89, 'lastChild && firstChild !== lastChild && lastChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1062_1377_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1373'][1].init(75, 49, 'firstChild.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1061_1373_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1371'][1].init(309, 10, 'firstChild');
function visit1060_1371_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1363'][1].init(115, 27, '!element._4eHasAttributes()');
function visit1059_1363_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1349'][3].init(116, 31, 'actualStyleValue === styleValue');
function visit1058_1349_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1349'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1349'][2].init(82, 30, 'typeof styleValue === \'string\'');
function visit1057_1349_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1349'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1349'][1].init(82, 65, 'typeof styleValue === \'string\' && actualStyleValue === styleValue');
function visit1056_1349_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1349'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1348'][2].init(181, 51, 'styleValue.test && styleValue.test(actualAttrValue)');
function visit1055_1348_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1348'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1348'][1].init(102, 150, '(styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue === \'string\' && actualStyleValue === styleValue)');
function visit1054_1348_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1348'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1346'][2].init(76, 19, 'styleValue === NULL');
function visit1053_1346_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1346'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1346'][1].init(76, 253, 'styleValue === NULL || (styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue === \'string\' && actualStyleValue === styleValue)');
function visit1052_1346_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1341'][1].init(25, 17, 'i < styles.length');
function visit1051_1341_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1340'][1].init(1145, 6, 'styles');
function visit1050_1340_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1338'][1].init(1101, 29, 'overrides && overrides.styles');
function visit1049_1338_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1331'][3].init(110, 28, 'actualAttrValue === attValue');
function visit1048_1331_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1331'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1331'][2].init(78, 28, 'typeof attValue === \'string\'');
function visit1047_1331_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1331'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1331'][1].init(78, 60, 'typeof attValue === \'string\' && actualAttrValue === attValue');
function visit1046_1331_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1330'][2].init(522, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit1045_1330_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1330'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1330'][1].init(46, 141, '(attValue.test && attValue.test(actualAttrValue)) || (typeof attValue === \'string\' && actualAttrValue === attValue)');
function visit1044_1330_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1329'][2].init(473, 17, 'attValue === NULL');
function visit1043_1329_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1329'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1329'][1].init(473, 188, 'attValue === NULL || (attValue.test && attValue.test(actualAttrValue)) || (typeof attValue === \'string\' && actualAttrValue === attValue)');
function visit1042_1329_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1317'][1].init(25, 21, 'i < attributes.length');
function visit1041_1317_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1316'][1].init(106, 10, 'attributes');
function visit1040_1316_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1314'][1].init(48, 33, 'overrides && overrides.attributes');
function visit1039_1314_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1297'][1].init(114, 6, 'i >= 0');
function visit1038_1297_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1297'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1295'][1].init(18, 33, 'overrideElement !== style.element');
function visit1037_1295_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1287'][1].init(253, 8, '--i >= 0');
function visit1036_1287_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1262'][1].init(297, 41, 'removeEmpty || !!element.style(styleName)');
function visit1035_1262_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1258'][1].init(47, 84, 'element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1034_1258_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1257'][1].init(94, 132, 'style._.definition.fullMatch && element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1033_1257_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1249'][1].init(299, 41, 'removeEmpty || !!element.hasAttr(attName)');
function visit1032_1249_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1249'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1245'][4].init(138, 91, 'element.attr(attName) !== normalizeProperty(attName, attributes[attName])');
function visit1031_1245_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['1245'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1245'][3].init(81, 19, 'attName === \'class\'');
function visit1030_1245_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1245'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1245'][2].init(81, 51, 'attName === \'class\' || style._.definition.fullMatch');
function visit1029_1245_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1245'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1245'][1].init(81, 148, '(attName === \'class\' || style._.definition.fullMatch) && element.attr(attName) !== normalizeProperty(attName, attributes[attName])');
function visit1028_1245_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1238'][1].init(447, 70, 'S.isEmptyObject(attributes) && S.isEmptyObject(styles)');
function visit1027_1238_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1236'][2].init(70, 20, 'overrides[\'*\'] || {}');
function visit1026_1236_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1236'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1236'][1].init(36, 54, 'overrides[element.nodeName()] || overrides[\'*\'] || {}');
function visit1025_1236_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1234'][2].init(74, 20, 'overrides[\'*\'] || {}');
function visit1024_1234_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1234'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1234'][1].init(40, 54, 'overrides[element.nodeName()] || overrides[\'*\'] || {}');
function visit1023_1234_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1234'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1215'][1].init(43, 23, 'overrideEl.styles || []');
function visit1022_1215_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1210'][1].init(1710, 6, 'styles');
function visit1021_1210_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1200'][1].init(47, 27, 'overrideEl.attributes || []');
function visit1020_1200_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1195'][1].init(990, 5, 'attrs');
function visit1019_1195_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1192'][1].init(886, 81, 'overrides[elementName] || (overrides[elementName] = {})');
function visit1018_1192_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1177'][1].init(229, 28, 'typeof override === \'string\'');
function visit1017_1177_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1170'][1].init(338, 21, 'i < definition.length');
function visit1016_1170_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1165'][1].init(170, 22, '!S.isArray(definition)');
function visit1015_1165_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1162'][1].init(203, 10, 'definition');
function visit1014_1162_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1155'][1].init(13, 17, 'style._.overrides');
function visit1013_1155_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1133'][1].init(17, 14, '!attribs.style');
function visit1012_1133_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1132'][1].init(627, 9, 'styleText');
function visit1011_1132_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1121'][1].init(327, 12, 'styleAttribs');
function visit1010_1121_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1121'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1112'][1].init(115, 7, 'attribs');
function visit1009_1112_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1091'][1].init(320, 24, 'temp.style.cssText || \'\'');
function visit1008_1091_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1091'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1085'][1].init(41, 25, 'nativeNormalize !== FALSE');
function visit1007_1085_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1085'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1075'][3].init(31, 28, 'target[name] === \'inherit\'');
function visit1006_1075_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1075'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1075'][2].init(94, 28, 'source[name] === \'inherit\'');
function visit1005_1075_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1075'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1075'][1].init(56, 60, 'source[name] === \'inherit\' || target[name] === \'inherit\'');
function visit1004_1075_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1075'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1074'][2].init(35, 33, 'target[name] === source[name]');
function visit1003_1074_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1074'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1074'][1].init(35, 117, 'target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\'');
function visit1002_1074_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1074'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1073'][2].init(122, 155, 'name in target && (target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\')');
function visit1001_1073_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1073'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1073'][1].init(119, 160, '!(name in target && (target[name] === source[name] || source[name] === \'inherit\' || target[name] === \'inherit\'))');
function visit1000_1073_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1073'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1066'][1].init(110, 26, 'typeof target === \'string\'');
function visit999_1066_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1066'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1063'][1].init(13, 26, 'typeof source === \'string\'');
function visit998_1063_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1063'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1038'][2].init(896, 50, 'nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit997_1038_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1038'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1038'][1].init(896, 106, 'nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && nextNode.contains(startNode)');
function visit996_1038_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1038'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1028'][1].init(56, 53, 'overrides[currentNode.nodeName()] || overrides[\'*\']');
function visit995_1028_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1028'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1022'][1].init(97, 39, 'currentNode.nodeName() === this.element');
function visit994_1022_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1022'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1019'][2].init(305, 53, 'currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit993_1019_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1019'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1019'][1].init(37, 116, 'currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit992_1019_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1019'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1018'][1].init(265, 154, 'currentNode[0] && currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit991_1018_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1018'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1012'][1].init(1929, 29, 'currentNode[0] !== endNode[0]');
function visit990_1012_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1012'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1003'][1].init(1235, 10, 'breakStart');
function visit989_1003_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1003'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1000'][1].init(1131, 8, 'breakEnd');
function visit988_1000_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1000'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['995'][1].init(244, 33, 'me.checkElementRemovable(element)');
function visit987_995_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['995'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['991'][1].init(52, 30, 'element === endPath.blockLimit');
function visit986_991_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['991'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['990'][2].init(79, 25, 'element === endPath.block');
function visit985_990_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['990'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['990'][1].init(79, 83, 'element === endPath.block || element === endPath.blockLimit');
function visit984_990_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['990'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['987'][1].init(710, 27, 'i < endPath.elements.length');
function visit983_987_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['987'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['983'][1].init(250, 33, 'me.checkElementRemovable(element)');
function visit982_983_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['983'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['979'][1].init(54, 32, 'element === startPath.blockLimit');
function visit981_979_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['979'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['978'][2].init(81, 27, 'element === startPath.block');
function visit980_978_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['978'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['978'][1].init(81, 87, 'element === startPath.block || element === startPath.blockLimit');
function visit979_978_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['978'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['975'][1].init(272, 29, 'i < startPath.elements.length');
function visit978_975_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['975'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['953'][1].init(1330, 9, 'UA.webkit');
function visit977_953_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['953'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['949'][1].init(63, 16, 'tmp === \'\\u200b\'');
function visit976_949_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['949'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['947'][1].init(1079, 80, '!tmp || tmp === \'\\u200b\'');
function visit975_947_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['942'][1].init(14, 33, 'boundaryElement.match === \'start\'');
function visit974_942_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['942'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['930'][1].init(266, 16, 'newElement.match');
function visit973_930_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['930'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['926'][1].init(87, 34, 'newElement.equals(boundaryElement)');
function visit972_926_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['922'][1].init(2574, 15, 'boundaryElement');
function visit971_922_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['922'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['910'][1].init(56, 51, '_overrides[element.nodeName()] || _overrides[\'*\']');
function visit970_910_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['910'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['907'][1].init(644, 35, 'element.nodeName() !== this.element');
function visit969_907_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['907'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['893'][1].init(248, 30, 'startOfElement || endOfElement');
function visit968_893_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['893'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['891'][1].init(107, 93, '!endOfElement && range.checkBoundaryOfElement(element, KER.START)');
function visit967_891_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['891'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['889'][1].init(540, 35, 'this.checkElementRemovable(element)');
function visit966_889_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['889'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['886'][3].init(439, 32, 'element === startPath.blockLimit');
function visit965_886_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['886'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['886'][2].init(408, 27, 'element === startPath.block');
function visit964_886_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['886'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['886'][1].init(408, 63, 'element === startPath.block || element === startPath.blockLimit');
function visit963_886_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['878'][2].init(220, 29, 'i < startPath.elements.length');
function visit962_878_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['878'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['878'][1].init(220, 68, 'i < startPath.elements.length && (element = startPath.elements[i])');
function visit961_878_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['878'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['871'][1].init(304, 15, 'range.collapsed');
function visit960_871_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['871'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['825'][1].init(1163, 6, '!UA.ie');
function visit959_825_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['825'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['804'][1].init(2646, 9, 'styleNode');
function visit958_804_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['804'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['795'][1].init(1505, 29, '!styleNode._4eHasAttributes()');
function visit957_795_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['795'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['786'][1].init(220, 36, 'styleNode.style(styleName) === value');
function visit956_786_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['786'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['782'][1].init(34, 77, 'removeList.blockedStyles[styleName] || !(value = parent.style(styleName))');
function visit955_782_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['782'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['768'][1].init(216, 33, 'styleNode.attr(attName) === value');
function visit954_768_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['768'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['764'][1].init(34, 73, 'removeList.blockedAttrs[attName] || !(value = parent.attr(styleName))');
function visit953_764_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['764'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['761'][1].init(25, 33, 'parent.nodeName() === elementName');
function visit952_761_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['761'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['760'][3].init(804, 25, 'styleNode[0] && parent[0]');
function visit951_760_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['760'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['760'][2].init(794, 35, 'parent && styleNode[0] && parent[0]');
function visit950_760_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['760'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['760'][1].init(781, 48, 'styleNode && parent && styleNode[0] && parent[0]');
function visit949_760_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['739'][2].init(6216, 35, 'styleRange && !styleRange.collapsed');
function visit948_739_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['739'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['739'][1].init(6202, 49, 'applyStyle && styleRange && !styleRange.collapsed');
function visit947_739_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['739'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['718'][1].init(401, 43, '!def.childRule || def.childRule(parentNode)');
function visit946_718_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['718'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['713'][2].init(1128, 396, '(parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit945_713_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['713'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['713'][1].init(150, 447, '(parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit944_713_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['713'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['711'][2].init(976, 107, '(parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]');
function visit943_711_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['711'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['711'][1].init(90, 598, '((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit942_711_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['711'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['710'][1].init(40, 689, '(applyStyle = !includedNode.next(notBookmark, 1)) && ((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(parentNode))');
function visit941_710_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['695'][2].init(68, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit940_695_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['695'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['695'][1].init(68, 75, 'nodeType === Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length');
function visit939_695_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['694'][2].init(1192, 35, 'nodeType === Dom.NodeType.TEXT_NODE');
function visit938_694_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['694'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['694'][1].init(1192, 146, 'nodeType === Dom.NodeType.TEXT_NODE || (nodeType === Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length)');
function visit937_694_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][3].init(92, 408, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit936_680_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][2].init(57, 443, '!DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit935_680_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][1].init(44, 456, '!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit934_680_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['679'][1].init(337, 535, '!styleRange && (!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))');
function visit933_679_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['674'][1].init(133, 48, '!def.parentRule || def.parentRule(currentParent)');
function visit932_674_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][4].init(-1, 65, 'DTD[currentParent.nodeName()] || DTD.span');
function visit931_672_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['673'][1].init(-1, 126, '(DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement');
function visit930_673_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][3].init(1286, 184, '((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit929_672_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][2].init(1262, 208, 'currentParent[0] && ((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit928_672_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][1].init(1245, 225, 'currentParent && currentParent[0] && ((DTD[currentParent.nodeName()] || DTD.span)[elementName] || isUnknownElement) && (!def.parentRule || def.parentRule(currentParent))');
function visit927_672_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['663'][1].init(46, 40, 'currentParent.nodeName() === elementName');
function visit926_663_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['662'][2].init(650, 19, 'elementName === \'a\'');
function visit925_662_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['662'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['662'][1].init(40, 87, 'elementName === \'a\' && currentParent.nodeName() === elementName');
function visit924_662_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['661'][1].init(607, 128, 'currentParent && elementName === \'a\' && currentParent.nodeName() === elementName');
function visit923_661_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['648'][1].init(377, 44, '!def.childRule || def.childRule(currentNode)');
function visit922_648_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['642'][2].init(81, 348, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit921_642_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['642'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['642'][1].init(44, 424, '(currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode))');
function visit920_642_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['641'][1].init(-1, 469, 'dtd[nodeName] && (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode))');
function visit919_641_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['640'][1].init(475, 526, '!nodeName || (dtd[nodeName] && (currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def.childRule || def.childRule(currentNode)))');
function visit918_640_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['634'][1].init(205, 44, 'nodeName && currentNode.attr(\'_ke_bookmark\')');
function visit917_634_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['631'][1].init(70, 38, 'nodeType === Dom.NodeType.ELEMENT_NODE');
function visit916_631_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['625'][1].init(54, 33, 'Dom.equals(currentNode, lastNode)');
function visit915_625_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['622'][1].init(1384, 29, 'currentNode && currentNode[0]');
function visit914_622_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['602'][1].init(758, 4, '!dtd');
function visit913_602_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['588'][1].init(78, 15, 'range.collapsed');
function visit912_588_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['561'][1].init(149, 7, '!offset');
function visit911_561_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['558'][1].init(21, 18, 'match.length === 1');
function visit910_558_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['547'][1].init(99, 19, 'i < preHTMLs.length');
function visit909_547_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['533'][1].init(807, 5, 'UA.ie');
function visit908_533_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['518'][1].init(96, 34, 'previousBlock.nodeName() === \'pre\'');
function visit907_518_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['517'][2].init(45, 131, '(previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() === \'pre\'');
function visit906_517_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['517'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['517'][1].init(40, 138, '!((previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() === \'pre\')');
function visit905_517_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['508'][1].init(621, 13, 'newBlockIsPre');
function visit904_508_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['499'][1].init(318, 9, 'isFromPre');
function visit903_499_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['496'][1].init(232, 7, 'isToPre');
function visit902_496_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['494'][1].init(179, 28, '!newBlockIsPre && blockIsPre');
function visit901_494_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['493'][1].init(125, 28, 'newBlockIsPre && !blockIsPre');
function visit900_493_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['492'][1].init(75, 26, 'block.nodeName === (\'pre\')');
function visit899_492_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['491'][1].init(29, 29, 'newBlock.nodeName === (\'pre\')');
function visit898_491_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['452'][1].init(944, 5, 'UA.ie');
function visit897_452_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['423'][1].init(104, 2, 'm2');
function visit896_423_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['420'][1].init(21, 2, 'm1');
function visit895_420_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['386'][1].init(364, 6, 'styles');
function visit894_386_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['378'][1].init(183, 10, 'attributes');
function visit893_378_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['365'][1].init(436, 7, 'element');
function visit892_365_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['357'][1].init(180, 19, 'elementName === \'*\'');
function visit891_357_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['340'][1].init(1087, 17, 'stylesText.length');
function visit890_340_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['329'][1].init(245, 22, 'styleVal === \'inherit\'');
function visit889_329_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['319'][1].init(397, 17, 'stylesText.length');
function visit888_319_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['316'][2].init(276, 62, 'styleDefinition.attributes && styleDefinition.attributes.style');
function visit887_316_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['316'][1].init(276, 70, '(styleDefinition.attributes && styleDefinition.attributes.style) || \'\'');
function visit886_316_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['309'][1].init(117, 9, 'stylesDef');
function visit885_309_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['296'][1].init(501, 41, 'this.checkElementRemovable(element, TRUE)');
function visit884_296_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['292'][2].init(328, 31, 'this.type === KEST.STYLE_OBJECT');
function visit883_292_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['292'][1].init(328, 76, 'this.type === KEST.STYLE_OBJECT && !(element.nodeName() in objectElements)');
function visit882_292_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['287'][3].init(116, 113, 'Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit)');
function visit881_287_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['287'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['287'][2].init(79, 31, 'this.type === KEST.STYLE_INLINE');
function visit880_287_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['287'][1].init(79, 152, 'this.type === KEST.STYLE_INLINE && (Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))');
function visit879_287_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['284'][1].init(128, 19, 'i < elements.length');
function visit878_284_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['277'][1].init(77, 43, 'elementPath.block || elementPath.blockLimit');
function visit877_277_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['260'][1].init(102, 52, 'styleValue.test && styleValue.test(actualStyleValue)');
function visit876_260_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['259'][6].init(151, 31, 'actualStyleValue === styleValue');
function visit875_259_6(result) {
  _$jscoverage['/editor/styles.js'].branchData['259'][6].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['259'][5].init(117, 30, 'typeof styleValue === \'string\'');
function visit874_259_5(result) {
  _$jscoverage['/editor/styles.js'].branchData['259'][5].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['259'][4].init(117, 65, 'typeof styleValue === \'string\' && actualStyleValue === styleValue');
function visit873_259_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['259'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['259'][3].init(117, 155, '(typeof styleValue === \'string\' && actualStyleValue === styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit872_259_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['259'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['259'][2].init(92, 19, 'styleValue === NULL');
function visit871_259_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['259'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['259'][1].init(92, 180, 'styleValue === NULL || (typeof styleValue === \'string\' && actualStyleValue === styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit870_259_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['257'][1].init(154, 16, 'actualStyleValue');
function visit869_257_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['254'][1].init(33, 17, 'i < styles.length');
function visit868_254_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['253'][1].init(1368, 6, 'styles');
function visit867_253_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['247'][1].init(97, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit866_247_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['246'][4].init(621, 28, 'actualAttrValue === attValue');
function visit865_246_4(result) {
  _$jscoverage['/editor/styles.js'].branchData['246'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['246'][3].init(589, 28, 'typeof attValue === \'string\'');
function visit864_246_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['246'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['246'][2].init(589, 60, 'typeof attValue === \'string\' && actualAttrValue === attValue');
function visit863_246_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['246'][1].init(54, 145, '(typeof attValue === \'string\' && actualAttrValue === attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit862_246_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][2].init(532, 17, 'attValue === NULL');
function visit861_245_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][1].init(532, 200, 'attValue === NULL || (typeof attValue === \'string\' && actualAttrValue === attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit860_245_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['237'][1].init(147, 15, 'actualAttrValue');
function visit859_237_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['234'][1].init(33, 18, 'i < attribs.length');
function visit858_234_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['233'][1].init(237, 7, 'attribs');
function visit857_233_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['230'][1].init(96, 66, '!(attribs = override.attributes) && !(styles = override.styles)');
function visit856_230_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['228'][1].init(1773, 8, 'override');
function visit855_228_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['226'][1].init(81, 49, 'overrides[element.nodeName()] || overrides[\'*\']');
function visit854_226_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['214'][1].init(797, 9, 'fullMatch');
function visit853_214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['209'][1].init(623, 9, 'fullMatch');
function visit852_209_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['205'][1].init(33, 10, '!fullMatch');
function visit851_205_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['204'][1].init(184, 34, 'attribs[attName] === elementAttr');
function visit850_204_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['201'][2].init(219, 19, 'attName === \'style\'');
function visit849_201_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['201'][1].init(219, 219, 'attName === \'style\' ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : attribs[attName] === elementAttr');
function visit848_201_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['200'][1].init(162, 27, 'element.attr(attName) || \'\'');
function visit847_200_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['196'][1].init(30, 21, 'attName === \'_length\'');
function visit846_196_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['193'][1].init(262, 15, 'attribs._length');
function visit845_193_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['187'][1].init(85, 41, '!fullMatch && !element._4eHasAttributes()');
function visit844_187_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['185'][1].init(255, 35, 'element.nodeName() === this.element');
function visit843_185_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['177'][1].init(17, 8, '!element');
function visit842_177_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['169'][1].init(38, 31, 'self.type === KEST.STYLE_INLINE');
function visit841_169_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['159'][1].init(90, 31, 'self.type === KEST.STYLE_OBJECT');
function visit840_159_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['157'][1].init(92, 30, 'self.type === KEST.STYLE_BLOCK');
function visit839_157_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['155'][1].init(35, 31, 'this.type === KEST.STYLE_INLINE');
function visit838_155_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['134'][1].init(447, 17, 'i < ranges.length');
function visit837_134_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['113'][2].init(300, 19, 'element === \'#text\'');
function visit836_113_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['113'][1].init(300, 47, 'element === \'#text\' || blockElements[element]');
function visit835_113_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['111'][1].init(217, 30, 'styleDefinition.element || \'*\'');
function visit834_111_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['106'][1].init(13, 15, 'variablesValues');
function visit833_106_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['88'][1].init(17, 34, 'typeof (list[item]) === \'string\'');
function visit832_88_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/styles.js'].functionData[0]++;
  _$jscoverage['/editor/styles.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/styles.js'].lineData[12]++;
  var KESelection = require('./selection');
  _$jscoverage['/editor/styles.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/styles.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/styles.js'].lineData[15]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/styles.js'].lineData[17]++;
  var TRUE = true, FALSE = false, NULL = null, $ = S.all, Dom = S.DOM, KER = Editor.RangeType, KEP = Editor.PositionType, KEST, UA = S.UA, blockElements = {
  'address': 1, 
  'div': 1, 
  'h1': 1, 
  'h2': 1, 
  'h3': 1, 
  'h4': 1, 
  'h5': 1, 
  'h6': 1, 
  'p': 1, 
  'pre': 1}, DTD = Editor.XHTML_DTD, objectElements = {
  'embed': 1, 
  'hr': 1, 
  'img': 1, 
  'li': 1, 
  'object': 1, 
  'ol': 1, 
  'table': 1, 
  'td': 1, 
  'tr': 1, 
  'th': 1, 
  'ul': 1, 
  'dl': 1, 
  'dt': 1, 
  'dd': 1, 
  'form': 1}, semicolonFixRegex = /\s*(?:;\s*|$)/g, varRegex = /#\((.+?)\)/g;
  _$jscoverage['/editor/styles.js'].lineData[65]++;
  Editor.StyleType = KEST = {
  STYLE_BLOCK: 1, 
  STYLE_INLINE: 2, 
  STYLE_OBJECT: 3};
  _$jscoverage['/editor/styles.js'].lineData[80]++;
  function notBookmark(node) {
    _$jscoverage['/editor/styles.js'].functionData[1]++;
    _$jscoverage['/editor/styles.js'].lineData[83]++;
    return !Dom.attr(node, '_ke_bookmark');
  }
  _$jscoverage['/editor/styles.js'].lineData[86]++;
  function replaceVariables(list, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[2]++;
    _$jscoverage['/editor/styles.js'].lineData[87]++;
    for (var item in list) {
      _$jscoverage['/editor/styles.js'].lineData[88]++;
      if (visit832_88_1(typeof (list[item]) === 'string')) {
        _$jscoverage['/editor/styles.js'].lineData[90]++;
        list[item] = list[item].replace(varRegex, function(match, varName) {
  _$jscoverage['/editor/styles.js'].functionData[3]++;
  _$jscoverage['/editor/styles.js'].lineData[91]++;
  return variablesValues[varName];
});
      } else {
        _$jscoverage['/editor/styles.js'].lineData[94]++;
        replaceVariables(list[item], variablesValues);
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[105]++;
  function KEStyle(styleDefinition, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[4]++;
    _$jscoverage['/editor/styles.js'].lineData[106]++;
    if (visit833_106_1(variablesValues)) {
      _$jscoverage['/editor/styles.js'].lineData[107]++;
      styleDefinition = S.clone(styleDefinition);
      _$jscoverage['/editor/styles.js'].lineData[108]++;
      replaceVariables(styleDefinition, variablesValues);
    }
    _$jscoverage['/editor/styles.js'].lineData[111]++;
    var element = this.element = this.element = (visit834_111_1(styleDefinition.element || '*')).toLowerCase();
    _$jscoverage['/editor/styles.js'].lineData[113]++;
    this.type = this.type = (visit835_113_1(visit836_113_2(element === '#text') || blockElements[element])) ? KEST.STYLE_BLOCK : objectElements[element] ? KEST.STYLE_OBJECT : KEST.STYLE_INLINE;
    _$jscoverage['/editor/styles.js'].lineData[118]++;
    this._ = {
  'definition': styleDefinition};
  }
  _$jscoverage['/editor/styles.js'].lineData[123]++;
  function applyStyle(document, remove) {
    _$jscoverage['/editor/styles.js'].functionData[5]++;
    _$jscoverage['/editor/styles.js'].lineData[125]++;
    var self = this, func = remove ? self.removeFromRange : self.applyToRange;
    _$jscoverage['/editor/styles.js'].lineData[129]++;
    document.body.focus();
    _$jscoverage['/editor/styles.js'].lineData[131]++;
    var selection = new KESelection(document);
    _$jscoverage['/editor/styles.js'].lineData[133]++;
    var ranges = selection.getRanges();
    _$jscoverage['/editor/styles.js'].lineData[134]++;
    for (var i = 0; visit837_134_1(i < ranges.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[136]++;
      func.call(self, ranges[i]);
    }
    _$jscoverage['/editor/styles.js'].lineData[138]++;
    selection.selectRanges(ranges);
  }
  _$jscoverage['/editor/styles.js'].lineData[141]++;
  KEStyle.prototype = {
  constructor: KEStyle, 
  apply: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[6]++;
  _$jscoverage['/editor/styles.js'].lineData[145]++;
  applyStyle.call(this, document, FALSE);
}, 
  remove: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[7]++;
  _$jscoverage['/editor/styles.js'].lineData[149]++;
  applyStyle.call(this, document, TRUE);
}, 
  applyToRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[8]++;
  _$jscoverage['/editor/styles.js'].lineData[153]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[154]++;
  return (self.applyToRange = visit838_155_1(this.type === KEST.STYLE_INLINE) ? applyInlineStyle : visit839_157_1(self.type === KEST.STYLE_BLOCK) ? applyBlockStyle : visit840_159_1(self.type === KEST.STYLE_OBJECT) ? NULL : NULL).call(self, range);
}, 
  removeFromRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[9]++;
  _$jscoverage['/editor/styles.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[168]++;
  return (self.removeFromRange = visit841_169_1(self.type === KEST.STYLE_INLINE) ? removeInlineStyle : NULL).call(self, range);
}, 
  checkElementRemovable: function(element, fullMatch) {
  _$jscoverage['/editor/styles.js'].functionData[10]++;
  _$jscoverage['/editor/styles.js'].lineData[177]++;
  if (visit842_177_1(!element)) {
    _$jscoverage['/editor/styles.js'].lineData[178]++;
    return FALSE;
  }
  _$jscoverage['/editor/styles.js'].lineData[180]++;
  var attName;
  _$jscoverage['/editor/styles.js'].lineData[181]++;
  var def = this._.definition, attribs, styles;
  _$jscoverage['/editor/styles.js'].lineData[185]++;
  if (visit843_185_1(element.nodeName() === this.element)) {
    _$jscoverage['/editor/styles.js'].lineData[187]++;
    if (visit844_187_1(!fullMatch && !element._4eHasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[188]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[191]++;
    attribs = getAttributesForComparison(def);
    _$jscoverage['/editor/styles.js'].lineData[193]++;
    if (visit845_193_1(attribs._length)) {
      _$jscoverage['/editor/styles.js'].lineData[194]++;
      for (attName in attribs) {
        _$jscoverage['/editor/styles.js'].lineData[196]++;
        if (visit846_196_1(attName === '_length')) {
          _$jscoverage['/editor/styles.js'].lineData[197]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[200]++;
        var elementAttr = visit847_200_1(element.attr(attName) || '');
        _$jscoverage['/editor/styles.js'].lineData[201]++;
        if (visit848_201_1(visit849_201_2(attName === 'style') ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : visit850_204_1(attribs[attName] === elementAttr))) {
          _$jscoverage['/editor/styles.js'].lineData[205]++;
          if (visit851_205_1(!fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[206]++;
            return TRUE;
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[209]++;
          if (visit852_209_1(fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[210]++;
            return FALSE;
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[214]++;
      if (visit853_214_1(fullMatch)) {
        _$jscoverage['/editor/styles.js'].lineData[215]++;
        return TRUE;
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[219]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[224]++;
  var overrides = getOverrides(this), i, override = visit854_226_1(overrides[element.nodeName()] || overrides['*']);
  _$jscoverage['/editor/styles.js'].lineData[228]++;
  if (visit855_228_1(override)) {
    _$jscoverage['/editor/styles.js'].lineData[230]++;
    if (visit856_230_1(!(attribs = override.attributes) && !(styles = override.styles))) {
      _$jscoverage['/editor/styles.js'].lineData[231]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[233]++;
    if (visit857_233_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[234]++;
      for (i = 0; visit858_234_1(i < attribs.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[235]++;
        attName = attribs[i][0];
        _$jscoverage['/editor/styles.js'].lineData[236]++;
        var actualAttrValue = element.attr(attName);
        _$jscoverage['/editor/styles.js'].lineData[237]++;
        if (visit859_237_1(actualAttrValue)) {
          _$jscoverage['/editor/styles.js'].lineData[238]++;
          var attValue = attribs[i][1];
          _$jscoverage['/editor/styles.js'].lineData[245]++;
          if (visit860_245_1(visit861_245_2(attValue === NULL) || visit862_246_1((visit863_246_2(visit864_246_3(typeof attValue === 'string') && visit865_246_4(actualAttrValue === attValue))) || visit866_247_1(attValue.test && attValue.test(actualAttrValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[248]++;
            return TRUE;
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[253]++;
    if (visit867_253_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[254]++;
      for (i = 0; visit868_254_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[255]++;
        var styleName = styles[i][0];
        _$jscoverage['/editor/styles.js'].lineData[256]++;
        var actualStyleValue = element.css(styleName);
        _$jscoverage['/editor/styles.js'].lineData[257]++;
        if (visit869_257_1(actualStyleValue)) {
          _$jscoverage['/editor/styles.js'].lineData[258]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[259]++;
          if (visit870_259_1(visit871_259_2(styleValue === NULL) || visit872_259_3((visit873_259_4(visit874_259_5(typeof styleValue === 'string') && visit875_259_6(actualStyleValue === styleValue))) || visit876_260_1(styleValue.test && styleValue.test(actualStyleValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[261]++;
            return TRUE;
          }
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[267]++;
  return FALSE;
}, 
  checkActive: function(elementPath) {
  _$jscoverage['/editor/styles.js'].functionData[11]++;
  _$jscoverage['/editor/styles.js'].lineData[275]++;
  switch (this.type) {
    case KEST.STYLE_BLOCK:
      _$jscoverage['/editor/styles.js'].lineData[277]++;
      return this.checkElementRemovable(visit877_277_1(elementPath.block || elementPath.blockLimit), TRUE);
    case KEST.STYLE_OBJECT:
    case KEST.STYLE_INLINE:
      _$jscoverage['/editor/styles.js'].lineData[282]++;
      var elements = elementPath.elements;
      _$jscoverage['/editor/styles.js'].lineData[284]++;
      for (var i = 0, element; visit878_284_1(i < elements.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[285]++;
        element = elements[i];
        _$jscoverage['/editor/styles.js'].lineData[287]++;
        if (visit879_287_1(visit880_287_2(this.type === KEST.STYLE_INLINE) && (visit881_287_3(Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))))) {
          _$jscoverage['/editor/styles.js'].lineData[289]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[292]++;
        if (visit882_292_1(visit883_292_2(this.type === KEST.STYLE_OBJECT) && !(element.nodeName() in objectElements))) {
          _$jscoverage['/editor/styles.js'].lineData[293]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[296]++;
        if (visit884_296_1(this.checkElementRemovable(element, TRUE))) {
          _$jscoverage['/editor/styles.js'].lineData[297]++;
          return TRUE;
        }
      }
  }
  _$jscoverage['/editor/styles.js'].lineData[301]++;
  return FALSE;
}};
  _$jscoverage['/editor/styles.js'].lineData[306]++;
  KEStyle.getStyleText = function(styleDefinition) {
  _$jscoverage['/editor/styles.js'].functionData[12]++;
  _$jscoverage['/editor/styles.js'].lineData[308]++;
  var stylesDef = styleDefinition._ST;
  _$jscoverage['/editor/styles.js'].lineData[309]++;
  if (visit885_309_1(stylesDef)) {
    _$jscoverage['/editor/styles.js'].lineData[310]++;
    return stylesDef;
  }
  _$jscoverage['/editor/styles.js'].lineData[313]++;
  stylesDef = styleDefinition.styles;
  _$jscoverage['/editor/styles.js'].lineData[316]++;
  var stylesText = visit886_316_1((visit887_316_2(styleDefinition.attributes && styleDefinition.attributes.style)) || ''), specialStylesText = '';
  _$jscoverage['/editor/styles.js'].lineData[319]++;
  if (visit888_319_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[320]++;
    stylesText = stylesText.replace(semicolonFixRegex, ';');
  }
  _$jscoverage['/editor/styles.js'].lineData[323]++;
  for (var style in stylesDef) {
    _$jscoverage['/editor/styles.js'].lineData[325]++;
    var styleVal = stylesDef[style], text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');
    _$jscoverage['/editor/styles.js'].lineData[329]++;
    if (visit889_329_1(styleVal === 'inherit')) {
      _$jscoverage['/editor/styles.js'].lineData[330]++;
      specialStylesText += text;
    } else {
      _$jscoverage['/editor/styles.js'].lineData[333]++;
      stylesText += text;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[340]++;
  if (visit890_340_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[341]++;
    stylesText = normalizeCssText(stylesText);
  }
  _$jscoverage['/editor/styles.js'].lineData[344]++;
  stylesText += specialStylesText;
  _$jscoverage['/editor/styles.js'].lineData[347]++;
  styleDefinition._ST = stylesText;
  _$jscoverage['/editor/styles.js'].lineData[348]++;
  return stylesText;
};
  _$jscoverage['/editor/styles.js'].lineData[351]++;
  function getElement(style, targetDocument, element) {
    _$jscoverage['/editor/styles.js'].functionData[13]++;
    _$jscoverage['/editor/styles.js'].lineData[352]++;
    var el, elementName = style.element;
    _$jscoverage['/editor/styles.js'].lineData[357]++;
    if (visit891_357_1(elementName === '*')) {
      _$jscoverage['/editor/styles.js'].lineData[358]++;
      elementName = 'span';
    }
    _$jscoverage['/editor/styles.js'].lineData[362]++;
    el = new Node(targetDocument.createElement(elementName));
    _$jscoverage['/editor/styles.js'].lineData[365]++;
    if (visit892_365_1(element)) {
      _$jscoverage['/editor/styles.js'].lineData[366]++;
      element._4eCopyAttributes(el);
    }
    _$jscoverage['/editor/styles.js'].lineData[369]++;
    return setupElement(el, style);
  }
  _$jscoverage['/editor/styles.js'].lineData[372]++;
  function setupElement(el, style) {
    _$jscoverage['/editor/styles.js'].functionData[14]++;
    _$jscoverage['/editor/styles.js'].lineData[373]++;
    var def = style._.definition, attributes = def.attributes, styles = KEStyle.getStyleText(def);
    _$jscoverage['/editor/styles.js'].lineData[378]++;
    if (visit893_378_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[379]++;
      for (var att in attributes) {
        _$jscoverage['/editor/styles.js'].lineData[380]++;
        el.attr(att, attributes[att]);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[386]++;
    if (visit894_386_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[387]++;
      el[0].style.cssText = styles;
    }
    _$jscoverage['/editor/styles.js'].lineData[390]++;
    return el;
  }
  _$jscoverage['/editor/styles.js'].lineData[393]++;
  function applyBlockStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[15]++;
    _$jscoverage['/editor/styles.js'].lineData[396]++;
    var bookmark = range.createBookmark(TRUE), iterator = range.createIterator();
    _$jscoverage['/editor/styles.js'].lineData[398]++;
    iterator.enforceRealBlocks = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[402]++;
    iterator.enlargeBr = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[404]++;
    var block, doc = range.document;
    _$jscoverage['/editor/styles.js'].lineData[406]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/editor/styles.js'].lineData[407]++;
      var newBlock = getElement(this, doc, block);
      _$jscoverage['/editor/styles.js'].lineData[408]++;
      replaceBlock(block, newBlock);
    }
    _$jscoverage['/editor/styles.js'].lineData[410]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[414]++;
  function replace(str, regexp, replacement) {
    _$jscoverage['/editor/styles.js'].functionData[16]++;
    _$jscoverage['/editor/styles.js'].lineData[415]++;
    var headBookmark = '', tailBookmark = '';
    _$jscoverage['/editor/styles.js'].lineData[418]++;
    str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi, function(str, m1, m2) {
  _$jscoverage['/editor/styles.js'].functionData[17]++;
  _$jscoverage['/editor/styles.js'].lineData[420]++;
  if (visit895_420_1(m1)) {
    _$jscoverage['/editor/styles.js'].lineData[421]++;
    headBookmark = m1;
  }
  _$jscoverage['/editor/styles.js'].lineData[423]++;
  if (visit896_423_1(m2)) {
    _$jscoverage['/editor/styles.js'].lineData[424]++;
    tailBookmark = m2;
  }
  _$jscoverage['/editor/styles.js'].lineData[426]++;
  return '';
});
    _$jscoverage['/editor/styles.js'].lineData[428]++;
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }
  _$jscoverage['/editor/styles.js'].lineData[434]++;
  function toPre(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[18]++;
    _$jscoverage['/editor/styles.js'].lineData[436]++;
    var preHTML = block.html();
    _$jscoverage['/editor/styles.js'].lineData[439]++;
    preHTML = replace(preHTML, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
    _$jscoverage['/editor/styles.js'].lineData[442]++;
    preHTML = preHTML.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
    _$jscoverage['/editor/styles.js'].lineData[446]++;
    preHTML = preHTML.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
    _$jscoverage['/editor/styles.js'].lineData[449]++;
    preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');
    _$jscoverage['/editor/styles.js'].lineData[452]++;
    if (visit897_452_1(UA.ie)) {
      _$jscoverage['/editor/styles.js'].lineData[453]++;
      var temp = block[0].ownerDocument.createElement('div');
      _$jscoverage['/editor/styles.js'].lineData[454]++;
      temp.appendChild(newBlock[0]);
      _$jscoverage['/editor/styles.js'].lineData[455]++;
      newBlock.outerHtml('<pre>' + preHTML + '</pre>');
      _$jscoverage['/editor/styles.js'].lineData[456]++;
      newBlock = new Node(temp.firstChild);
      _$jscoverage['/editor/styles.js'].lineData[457]++;
      newBlock._4eRemove();
    } else {
      _$jscoverage['/editor/styles.js'].lineData[460]++;
      newBlock.html(preHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[463]++;
    return newBlock;
  }
  _$jscoverage['/editor/styles.js'].lineData[468]++;
  function splitIntoPres(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[19]++;
    _$jscoverage['/editor/styles.js'].lineData[471]++;
    var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi, splittedHTML = replace(preBlock.outerHtml(), duoBrRegex, function(match, charBefore, bookmark) {
  _$jscoverage['/editor/styles.js'].functionData[20]++;
  _$jscoverage['/editor/styles.js'].lineData[476]++;
  return charBefore + '</pre>' + bookmark + '<pre>';
});
    _$jscoverage['/editor/styles.js'].lineData[479]++;
    var pres = [];
    _$jscoverage['/editor/styles.js'].lineData[480]++;
    splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
  _$jscoverage['/editor/styles.js'].functionData[21]++;
  _$jscoverage['/editor/styles.js'].lineData[482]++;
  pres.push(preContent);
});
    _$jscoverage['/editor/styles.js'].lineData[484]++;
    return pres;
  }
  _$jscoverage['/editor/styles.js'].lineData[490]++;
  function replaceBlock(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[22]++;
    _$jscoverage['/editor/styles.js'].lineData[491]++;
    var newBlockIsPre = visit898_491_1(newBlock.nodeName === ('pre')), blockIsPre = visit899_492_1(block.nodeName === ('pre')), isToPre = visit900_493_1(newBlockIsPre && !blockIsPre), isFromPre = visit901_494_1(!newBlockIsPre && blockIsPre);
    _$jscoverage['/editor/styles.js'].lineData[496]++;
    if (visit902_496_1(isToPre)) {
      _$jscoverage['/editor/styles.js'].lineData[497]++;
      newBlock = toPre(block, newBlock);
    } else {
      _$jscoverage['/editor/styles.js'].lineData[499]++;
      if (visit903_499_1(isFromPre)) {
        _$jscoverage['/editor/styles.js'].lineData[501]++;
        newBlock = fromPres(splitIntoPres(block), newBlock);
      } else {
        _$jscoverage['/editor/styles.js'].lineData[504]++;
        block._4eMoveChildren(newBlock);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[507]++;
    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    _$jscoverage['/editor/styles.js'].lineData[508]++;
    if (visit904_508_1(newBlockIsPre)) {
      _$jscoverage['/editor/styles.js'].lineData[510]++;
      mergePre(newBlock);
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[515]++;
  function mergePre(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[23]++;
    _$jscoverage['/editor/styles.js'].lineData[516]++;
    var previousBlock;
    _$jscoverage['/editor/styles.js'].lineData[517]++;
    if (visit905_517_1(!(visit906_517_2((previousBlock = preBlock._4ePreviousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && visit907_518_1(previousBlock.nodeName() === 'pre'))))) {
      _$jscoverage['/editor/styles.js'].lineData[519]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[529]++;
    var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' + replace(preBlock.html(), /^\n/, '');
    _$jscoverage['/editor/styles.js'].lineData[533]++;
    if (visit908_533_1(UA.ie)) {
      _$jscoverage['/editor/styles.js'].lineData[534]++;
      preBlock.outerHtml('<pre>' + mergedHTML + '</pre>');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[537]++;
      preBlock.html(mergedHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[540]++;
    previousBlock._4eRemove();
  }
  _$jscoverage['/editor/styles.js'].lineData[545]++;
  function fromPres(preHTMLs, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[24]++;
    _$jscoverage['/editor/styles.js'].lineData[546]++;
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    _$jscoverage['/editor/styles.js'].lineData[547]++;
    for (var i = 0; visit909_547_1(i < preHTMLs.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[548]++;
      var blockHTML = preHTMLs[i];
      _$jscoverage['/editor/styles.js'].lineData[552]++;
      blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
      _$jscoverage['/editor/styles.js'].lineData[553]++;
      blockHTML = replace(blockHTML, /^[ \t]*\n/, '');
      _$jscoverage['/editor/styles.js'].lineData[554]++;
      blockHTML = replace(blockHTML, /\n$/, '');
      _$jscoverage['/editor/styles.js'].lineData[557]++;
      blockHTML = replace(blockHTML, /^[ \t]+|[ \t]+$/g, function(match, offset) {
  _$jscoverage['/editor/styles.js'].functionData[25]++;
  _$jscoverage['/editor/styles.js'].lineData[558]++;
  if (visit910_558_1(match.length === 1)) {
    _$jscoverage['/editor/styles.js'].lineData[559]++;
    return '&nbsp;';
  } else {
    _$jscoverage['/editor/styles.js'].lineData[561]++;
    if (visit911_561_1(!offset)) {
      _$jscoverage['/editor/styles.js'].lineData[562]++;
      return new Array(match.length).join('&nbsp;') + ' ';
    } else {
      _$jscoverage['/editor/styles.js'].lineData[565]++;
      return ' ' + new Array(match.length).join('&nbsp;');
    }
  }
});
      _$jscoverage['/editor/styles.js'].lineData[571]++;
      blockHTML = blockHTML.replace(/\n/g, '<br>');
      _$jscoverage['/editor/styles.js'].lineData[572]++;
      blockHTML = blockHTML.replace(/[ \t]{2,}/g, function(match) {
  _$jscoverage['/editor/styles.js'].functionData[26]++;
  _$jscoverage['/editor/styles.js'].lineData[574]++;
  return new Array(match.length).join('&nbsp;') + ' ';
});
      _$jscoverage['/editor/styles.js'].lineData[577]++;
      var newBlockClone = newBlock.clone();
      _$jscoverage['/editor/styles.js'].lineData[578]++;
      newBlockClone.html(blockHTML);
      _$jscoverage['/editor/styles.js'].lineData[579]++;
      docFrag.appendChild(newBlockClone[0]);
    }
    _$jscoverage['/editor/styles.js'].lineData[581]++;
    return docFrag;
  }
  _$jscoverage['/editor/styles.js'].lineData[584]++;
  function applyInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[27]++;
    _$jscoverage['/editor/styles.js'].lineData[585]++;
    var self = this, document = range.document;
    _$jscoverage['/editor/styles.js'].lineData[588]++;
    if (visit912_588_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[590]++;
      var collapsedElement = getElement(this, document, undefined);
      _$jscoverage['/editor/styles.js'].lineData[592]++;
      range.insertNode(collapsedElement);
      _$jscoverage['/editor/styles.js'].lineData[594]++;
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/styles.js'].lineData[595]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[597]++;
    var elementName = this.element, def = this._.definition, isUnknownElement, dtd = DTD[elementName];
    _$jscoverage['/editor/styles.js'].lineData[602]++;
    if (visit913_602_1(!dtd)) {
      _$jscoverage['/editor/styles.js'].lineData[603]++;
      isUnknownElement = TRUE;
      _$jscoverage['/editor/styles.js'].lineData[604]++;
      dtd = DTD.span;
    }
    _$jscoverage['/editor/styles.js'].lineData[608]++;
    var bookmark = range.createBookmark();
    _$jscoverage['/editor/styles.js'].lineData[611]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[612]++;
    range.trim();
    _$jscoverage['/editor/styles.js'].lineData[616]++;
    var boundaryNodes = range.createBookmark(), firstNode = boundaryNodes.startNode, lastNode = boundaryNodes.endNode, currentNode = firstNode, styleRange;
    _$jscoverage['/editor/styles.js'].lineData[622]++;
    while (visit914_622_1(currentNode && currentNode[0])) {
      _$jscoverage['/editor/styles.js'].lineData[623]++;
      var applyStyle = FALSE;
      _$jscoverage['/editor/styles.js'].lineData[625]++;
      if (visit915_625_1(Dom.equals(currentNode, lastNode))) {
        _$jscoverage['/editor/styles.js'].lineData[626]++;
        currentNode = NULL;
        _$jscoverage['/editor/styles.js'].lineData[627]++;
        applyStyle = TRUE;
      } else {
        _$jscoverage['/editor/styles.js'].lineData[630]++;
        var nodeType = currentNode[0].nodeType, nodeName = visit916_631_1(nodeType === Dom.NodeType.ELEMENT_NODE) ? currentNode.nodeName() : NULL;
        _$jscoverage['/editor/styles.js'].lineData[634]++;
        if (visit917_634_1(nodeName && currentNode.attr('_ke_bookmark'))) {
          _$jscoverage['/editor/styles.js'].lineData[635]++;
          currentNode = currentNode._4eNextSourceNode(TRUE);
          _$jscoverage['/editor/styles.js'].lineData[636]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[640]++;
        if (visit918_640_1(!nodeName || (visit919_641_1(dtd[nodeName] && visit920_642_1(visit921_642_2((currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit922_648_1(!def.childRule || def.childRule(currentNode)))))))) {
          _$jscoverage['/editor/styles.js'].lineData[650]++;
          var currentParent = currentNode.parent();
          _$jscoverage['/editor/styles.js'].lineData[661]++;
          if (visit923_661_1(currentParent && visit924_662_1(visit925_662_2(elementName === 'a') && visit926_663_1(currentParent.nodeName() === elementName)))) {
            _$jscoverage['/editor/styles.js'].lineData[664]++;
            var tmpANode = getElement(self, document, undefined);
            _$jscoverage['/editor/styles.js'].lineData[665]++;
            currentParent._4eMoveChildren(tmpANode);
            _$jscoverage['/editor/styles.js'].lineData[666]++;
            currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
            _$jscoverage['/editor/styles.js'].lineData[667]++;
            tmpANode._4eMergeSiblings();
          } else {
            _$jscoverage['/editor/styles.js'].lineData[672]++;
            if (visit927_672_1(currentParent && visit928_672_2(currentParent[0] && visit929_672_3((visit930_673_1((visit931_672_4(DTD[currentParent.nodeName()] || DTD.span))[elementName] || isUnknownElement)) && (visit932_674_1(!def.parentRule || def.parentRule(currentParent))))))) {
              _$jscoverage['/editor/styles.js'].lineData[679]++;
              if (visit933_679_1(!styleRange && (visit934_680_1(!nodeName || visit935_680_2(!DTD.$removeEmpty[nodeName] || visit936_680_3((currentNode._4ePosition(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) === (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))))))) {
                _$jscoverage['/editor/styles.js'].lineData[688]++;
                styleRange = new KERange(document);
                _$jscoverage['/editor/styles.js'].lineData[689]++;
                styleRange.setStartBefore(currentNode);
              }
              _$jscoverage['/editor/styles.js'].lineData[694]++;
              if (visit937_694_1(visit938_694_2(nodeType === Dom.NodeType.TEXT_NODE) || (visit939_695_1(visit940_695_2(nodeType === Dom.NodeType.ELEMENT_NODE) && !currentNode[0].childNodes.length)))) {
                _$jscoverage['/editor/styles.js'].lineData[696]++;
                var includedNode = currentNode, parentNode = null;
                _$jscoverage['/editor/styles.js'].lineData[709]++;
                while (visit941_710_1((applyStyle = !includedNode.next(notBookmark, 1)) && visit942_711_1((visit943_711_2((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()])) && visit944_713_1(visit945_713_2((parentNode._4ePosition(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) === (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit946_718_1(!def.childRule || def.childRule(parentNode))))))) {
                  _$jscoverage['/editor/styles.js'].lineData[719]++;
                  includedNode = parentNode;
                }
                _$jscoverage['/editor/styles.js'].lineData[722]++;
                styleRange.setEndAfter(includedNode);
              }
            } else {
              _$jscoverage['/editor/styles.js'].lineData[727]++;
              applyStyle = TRUE;
            }
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[731]++;
          applyStyle = TRUE;
        }
        _$jscoverage['/editor/styles.js'].lineData[735]++;
        currentNode = currentNode._4eNextSourceNode();
      }
      _$jscoverage['/editor/styles.js'].lineData[739]++;
      if (visit947_739_1(applyStyle && visit948_739_2(styleRange && !styleRange.collapsed))) {
        _$jscoverage['/editor/styles.js'].lineData[741]++;
        var styleNode = getElement(self, document, undefined), parent = styleRange.getCommonAncestor();
        _$jscoverage['/editor/styles.js'].lineData[747]++;
        var removeList = {
  styles: {}, 
  attrs: {}, 
  blockedStyles: {}, 
  blockedAttrs: {}};
        _$jscoverage['/editor/styles.js'].lineData[756]++;
        var attName, styleName = null, value;
        _$jscoverage['/editor/styles.js'].lineData[760]++;
        while (visit949_760_1(styleNode && visit950_760_2(parent && visit951_760_3(styleNode[0] && parent[0])))) {
          _$jscoverage['/editor/styles.js'].lineData[761]++;
          if (visit952_761_1(parent.nodeName() === elementName)) {
            _$jscoverage['/editor/styles.js'].lineData[762]++;
            for (attName in def.attributes) {
              _$jscoverage['/editor/styles.js'].lineData[764]++;
              if (visit953_764_1(removeList.blockedAttrs[attName] || !(value = parent.attr(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[765]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[768]++;
              if (visit954_768_1(styleNode.attr(attName) === value)) {
                _$jscoverage['/editor/styles.js'].lineData[770]++;
                styleNode.removeAttr(attName);
              } else {
                _$jscoverage['/editor/styles.js'].lineData[772]++;
                removeList.blockedAttrs[attName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[780]++;
            for (styleName in def.styles) {
              _$jscoverage['/editor/styles.js'].lineData[782]++;
              if (visit955_782_1(removeList.blockedStyles[styleName] || !(value = parent.style(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[783]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[786]++;
              if (visit956_786_1(styleNode.style(styleName) === value)) {
                _$jscoverage['/editor/styles.js'].lineData[788]++;
                styleNode.style(styleName, '');
              } else {
                _$jscoverage['/editor/styles.js'].lineData[790]++;
                removeList.blockedStyles[styleName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[795]++;
            if (visit957_795_1(!styleNode._4eHasAttributes())) {
              _$jscoverage['/editor/styles.js'].lineData[796]++;
              styleNode = NULL;
              _$jscoverage['/editor/styles.js'].lineData[797]++;
              break;
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[801]++;
          parent = parent.parent();
        }
        _$jscoverage['/editor/styles.js'].lineData[804]++;
        if (visit958_804_1(styleNode)) {
          _$jscoverage['/editor/styles.js'].lineData[806]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[810]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[814]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[817]++;
          styleNode._4eMergeSiblings();
          _$jscoverage['/editor/styles.js'].lineData[825]++;
          if (visit959_825_1(!UA.ie)) {
            _$jscoverage['/editor/styles.js'].lineData[826]++;
            styleNode[0].normalize();
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[840]++;
          styleNode = new Node(document.createElement('span'));
          _$jscoverage['/editor/styles.js'].lineData[841]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[842]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[843]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[844]++;
          styleNode._4eRemove(true);
        }
        _$jscoverage['/editor/styles.js'].lineData[849]++;
        styleRange = NULL;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[853]++;
    firstNode._4eRemove();
    _$jscoverage['/editor/styles.js'].lineData[854]++;
    lastNode._4eRemove();
    _$jscoverage['/editor/styles.js'].lineData[855]++;
    range.moveToBookmark(bookmark);
    _$jscoverage['/editor/styles.js'].lineData[857]++;
    range.shrink(KER.SHRINK_TEXT);
  }
  _$jscoverage['/editor/styles.js'].lineData[861]++;
  function removeInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[28]++;
    _$jscoverage['/editor/styles.js'].lineData[866]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[868]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode;
    _$jscoverage['/editor/styles.js'].lineData[871]++;
    if (visit960_871_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[873]++;
      var startPath = new ElementPath(startNode.parent()), boundaryElement;
      _$jscoverage['/editor/styles.js'].lineData[878]++;
      for (var i = 0, element; visit961_878_1(visit962_878_2(i < startPath.elements.length) && (element = startPath.elements[i])); i++) {
        _$jscoverage['/editor/styles.js'].lineData[886]++;
        if (visit963_886_1(visit964_886_2(element === startPath.block) || visit965_886_3(element === startPath.blockLimit))) {
          _$jscoverage['/editor/styles.js'].lineData[887]++;
          break;
        }
        _$jscoverage['/editor/styles.js'].lineData[889]++;
        if (visit966_889_1(this.checkElementRemovable(element))) {
          _$jscoverage['/editor/styles.js'].lineData[890]++;
          var endOfElement = range.checkBoundaryOfElement(element, KER.END), startOfElement = visit967_891_1(!endOfElement && range.checkBoundaryOfElement(element, KER.START));
          _$jscoverage['/editor/styles.js'].lineData[893]++;
          if (visit968_893_1(startOfElement || endOfElement)) {
            _$jscoverage['/editor/styles.js'].lineData[894]++;
            boundaryElement = element;
            _$jscoverage['/editor/styles.js'].lineData[895]++;
            boundaryElement.match = startOfElement ? 'start' : 'end';
          } else {
            _$jscoverage['/editor/styles.js'].lineData[903]++;
            element._4eMergeSiblings();
            _$jscoverage['/editor/styles.js'].lineData[907]++;
            if (visit969_907_1(element.nodeName() !== this.element)) {
              _$jscoverage['/editor/styles.js'].lineData[908]++;
              var _overrides = getOverrides(this);
              _$jscoverage['/editor/styles.js'].lineData[909]++;
              removeOverrides(element, visit970_910_1(_overrides[element.nodeName()] || _overrides['*']));
            } else {
              _$jscoverage['/editor/styles.js'].lineData[912]++;
              removeFromElement(this, element);
            }
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[922]++;
      if (visit971_922_1(boundaryElement)) {
        _$jscoverage['/editor/styles.js'].lineData[923]++;
        var clonedElement = startNode;
        _$jscoverage['/editor/styles.js'].lineData[924]++;
        for (i = 0; ; i++) {
          _$jscoverage['/editor/styles.js'].lineData[925]++;
          var newElement = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[926]++;
          if (visit972_926_1(newElement.equals(boundaryElement))) {
            _$jscoverage['/editor/styles.js'].lineData[927]++;
            break;
          } else {
            _$jscoverage['/editor/styles.js'].lineData[930]++;
            if (visit973_930_1(newElement.match)) {
              _$jscoverage['/editor/styles.js'].lineData[931]++;
              continue;
            } else {
              _$jscoverage['/editor/styles.js'].lineData[934]++;
              newElement = newElement.clone();
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[936]++;
          newElement[0].appendChild(clonedElement[0]);
          _$jscoverage['/editor/styles.js'].lineData[937]++;
          clonedElement = newElement;
        }
        _$jscoverage['/editor/styles.js'].lineData[943]++;
        clonedElement[visit974_942_1(boundaryElement.match === 'start') ? 'insertBefore' : 'insertAfter'](boundaryElement);
        _$jscoverage['/editor/styles.js'].lineData[946]++;
        var tmp = boundaryElement.html();
        _$jscoverage['/editor/styles.js'].lineData[947]++;
        if (visit975_947_1(!tmp || visit976_949_1(tmp === '\u200b'))) {
          _$jscoverage['/editor/styles.js'].lineData[950]++;
          boundaryElement.remove();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[953]++;
          if (visit977_953_1(UA.webkit)) {
            _$jscoverage['/editor/styles.js'].lineData[954]++;
            $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
          }
        }
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[962]++;
      var endNode = bookmark.endNode, me = this;
      _$jscoverage['/editor/styles.js'].lineData[969]++;
      var breakNodes = function() {
  _$jscoverage['/editor/styles.js'].functionData[29]++;
  _$jscoverage['/editor/styles.js'].lineData[970]++;
  var startPath = new ElementPath(startNode.parent()), endPath = new ElementPath(endNode.parent()), breakStart = NULL, element, breakEnd = NULL;
  _$jscoverage['/editor/styles.js'].lineData[975]++;
  for (var i = 0; visit978_975_1(i < startPath.elements.length); i++) {
    _$jscoverage['/editor/styles.js'].lineData[976]++;
    element = startPath.elements[i];
    _$jscoverage['/editor/styles.js'].lineData[978]++;
    if (visit979_978_1(visit980_978_2(element === startPath.block) || visit981_979_1(element === startPath.blockLimit))) {
      _$jscoverage['/editor/styles.js'].lineData[980]++;
      break;
    }
    _$jscoverage['/editor/styles.js'].lineData[983]++;
    if (visit982_983_1(me.checkElementRemovable(element))) {
      _$jscoverage['/editor/styles.js'].lineData[984]++;
      breakStart = element;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[987]++;
  for (i = 0; visit983_987_1(i < endPath.elements.length); i++) {
    _$jscoverage['/editor/styles.js'].lineData[988]++;
    element = endPath.elements[i];
    _$jscoverage['/editor/styles.js'].lineData[990]++;
    if (visit984_990_1(visit985_990_2(element === endPath.block) || visit986_991_1(element === endPath.blockLimit))) {
      _$jscoverage['/editor/styles.js'].lineData[992]++;
      break;
    }
    _$jscoverage['/editor/styles.js'].lineData[995]++;
    if (visit987_995_1(me.checkElementRemovable(element))) {
      _$jscoverage['/editor/styles.js'].lineData[996]++;
      breakEnd = element;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1000]++;
  if (visit988_1000_1(breakEnd)) {
    _$jscoverage['/editor/styles.js'].lineData[1001]++;
    endNode._4eBreakParent(breakEnd);
  }
  _$jscoverage['/editor/styles.js'].lineData[1003]++;
  if (visit989_1003_1(breakStart)) {
    _$jscoverage['/editor/styles.js'].lineData[1004]++;
    startNode._4eBreakParent(breakStart);
  }
};
      _$jscoverage['/editor/styles.js'].lineData[1008]++;
      breakNodes();
      _$jscoverage['/editor/styles.js'].lineData[1011]++;
      var currentNode = new Node(startNode[0].nextSibling);
      _$jscoverage['/editor/styles.js'].lineData[1012]++;
      while (visit990_1012_1(currentNode[0] !== endNode[0])) {
        _$jscoverage['/editor/styles.js'].lineData[1017]++;
        var nextNode = currentNode._4eNextSourceNode();
        _$jscoverage['/editor/styles.js'].lineData[1018]++;
        if (visit991_1018_1(currentNode[0] && visit992_1019_1(visit993_1019_2(currentNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && this.checkElementRemovable(currentNode)))) {
          _$jscoverage['/editor/styles.js'].lineData[1022]++;
          if (visit994_1022_1(currentNode.nodeName() === this.element)) {
            _$jscoverage['/editor/styles.js'].lineData[1023]++;
            removeFromElement(this, currentNode);
          } else {
            _$jscoverage['/editor/styles.js'].lineData[1026]++;
            var overrides = getOverrides(this);
            _$jscoverage['/editor/styles.js'].lineData[1027]++;
            removeOverrides(currentNode, visit995_1028_1(overrides[currentNode.nodeName()] || overrides['*']));
          }
          _$jscoverage['/editor/styles.js'].lineData[1038]++;
          if (visit996_1038_1(visit997_1038_2(nextNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && nextNode.contains(startNode))) {
            _$jscoverage['/editor/styles.js'].lineData[1040]++;
            breakNodes();
            _$jscoverage['/editor/styles.js'].lineData[1041]++;
            nextNode = new Node(startNode[0].nextSibling);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1044]++;
        currentNode = nextNode;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1047]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[1051]++;
  function parseStyleText(styleText) {
    _$jscoverage['/editor/styles.js'].functionData[30]++;
    _$jscoverage['/editor/styles.js'].lineData[1052]++;
    styleText = String(styleText);
    _$jscoverage['/editor/styles.js'].lineData[1053]++;
    var retval = {};
    _$jscoverage['/editor/styles.js'].lineData[1055]++;
    styleText.replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/editor/styles.js'].functionData[31]++;
  _$jscoverage['/editor/styles.js'].lineData[1057]++;
  retval[name] = value;
});
    _$jscoverage['/editor/styles.js'].lineData[1059]++;
    return retval;
  }
  _$jscoverage['/editor/styles.js'].lineData[1062]++;
  function compareCssText(source, target) {
    _$jscoverage['/editor/styles.js'].functionData[32]++;
    _$jscoverage['/editor/styles.js'].lineData[1063]++;
    if (visit998_1063_1(typeof source === 'string')) {
      _$jscoverage['/editor/styles.js'].lineData[1064]++;
      source = parseStyleText(source);
    }
    _$jscoverage['/editor/styles.js'].lineData[1066]++;
    if (visit999_1066_1(typeof target === 'string')) {
      _$jscoverage['/editor/styles.js'].lineData[1067]++;
      target = parseStyleText(target);
    }
    _$jscoverage['/editor/styles.js'].lineData[1069]++;
    for (var name in source) {
      _$jscoverage['/editor/styles.js'].lineData[1073]++;
      if (visit1000_1073_1(!(visit1001_1073_2(name in target && (visit1002_1074_1(visit1003_1074_2(target[name] === source[name]) || visit1004_1075_1(visit1005_1075_2(source[name] === 'inherit') || visit1006_1075_3(target[name] === 'inherit')))))))) {
        _$jscoverage['/editor/styles.js'].lineData[1076]++;
        return FALSE;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1080]++;
    return TRUE;
  }
  _$jscoverage['/editor/styles.js'].lineData[1083]++;
  function normalizeCssText(unParsedCssText, nativeNormalize) {
    _$jscoverage['/editor/styles.js'].functionData[33]++;
    _$jscoverage['/editor/styles.js'].lineData[1084]++;
    var styleText = '';
    _$jscoverage['/editor/styles.js'].lineData[1085]++;
    if (visit1007_1085_1(nativeNormalize !== FALSE)) {
      _$jscoverage['/editor/styles.js'].lineData[1088]++;
      var temp = document.createElement('span');
      _$jscoverage['/editor/styles.js'].lineData[1089]++;
      temp.style.cssText = unParsedCssText;
      _$jscoverage['/editor/styles.js'].lineData[1091]++;
      styleText = visit1008_1091_1(temp.style.cssText || '');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[1094]++;
      styleText = unParsedCssText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1099]++;
    return styleText.replace(/\s*([;:])\s*/, '$1').replace(/([^\s;])$/, '$1;').replace(/,\s+/g, ',').toLowerCase();
  }
  _$jscoverage['/editor/styles.js'].lineData[1109]++;
  function getAttributesForComparison(styleDefinition) {
    _$jscoverage['/editor/styles.js'].functionData[34]++;
    _$jscoverage['/editor/styles.js'].lineData[1111]++;
    var attribs = styleDefinition._AC;
    _$jscoverage['/editor/styles.js'].lineData[1112]++;
    if (visit1009_1112_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1113]++;
      return attribs;
    }
    _$jscoverage['/editor/styles.js'].lineData[1115]++;
    attribs = {};
    _$jscoverage['/editor/styles.js'].lineData[1117]++;
    var length = 0, styleAttribs = styleDefinition.attributes;
    _$jscoverage['/editor/styles.js'].lineData[1121]++;
    if (visit1010_1121_1(styleAttribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1122]++;
      for (var styleAtt in styleAttribs) {
        _$jscoverage['/editor/styles.js'].lineData[1124]++;
        length++;
        _$jscoverage['/editor/styles.js'].lineData[1125]++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1131]++;
    var styleText = KEStyle.getStyleText(styleDefinition);
    _$jscoverage['/editor/styles.js'].lineData[1132]++;
    if (visit1011_1132_1(styleText)) {
      _$jscoverage['/editor/styles.js'].lineData[1133]++;
      if (visit1012_1133_1(!attribs.style)) {
        _$jscoverage['/editor/styles.js'].lineData[1134]++;
        length++;
      }
      _$jscoverage['/editor/styles.js'].lineData[1136]++;
      attribs.style = styleText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1141]++;
    attribs._length = length;
    _$jscoverage['/editor/styles.js'].lineData[1144]++;
    styleDefinition._AC = attribs;
    _$jscoverage['/editor/styles.js'].lineData[1145]++;
    return attribs;
  }
  _$jscoverage['/editor/styles.js'].lineData[1154]++;
  function getOverrides(style) {
    _$jscoverage['/editor/styles.js'].functionData[35]++;
    _$jscoverage['/editor/styles.js'].lineData[1155]++;
    if (visit1013_1155_1(style._.overrides)) {
      _$jscoverage['/editor/styles.js'].lineData[1156]++;
      return style._.overrides;
    }
    _$jscoverage['/editor/styles.js'].lineData[1159]++;
    var overrides = (style._.overrides = {}), definition = style._.definition.overrides;
    _$jscoverage['/editor/styles.js'].lineData[1162]++;
    if (visit1014_1162_1(definition)) {
      _$jscoverage['/editor/styles.js'].lineData[1165]++;
      if (visit1015_1165_1(!S.isArray(definition))) {
        _$jscoverage['/editor/styles.js'].lineData[1166]++;
        definition = [definition];
      }
      _$jscoverage['/editor/styles.js'].lineData[1170]++;
      for (var i = 0; visit1016_1170_1(i < definition.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1171]++;
        var override = definition[i];
        _$jscoverage['/editor/styles.js'].lineData[1172]++;
        var elementName;
        _$jscoverage['/editor/styles.js'].lineData[1173]++;
        var overrideEl;
        _$jscoverage['/editor/styles.js'].lineData[1174]++;
        var attrs, styles;
        _$jscoverage['/editor/styles.js'].lineData[1177]++;
        if (visit1017_1177_1(typeof override === 'string')) {
          _$jscoverage['/editor/styles.js'].lineData[1178]++;
          elementName = override.toLowerCase();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[1182]++;
          elementName = override.element ? override.element.toLowerCase() : style.element;
          _$jscoverage['/editor/styles.js'].lineData[1185]++;
          attrs = override.attributes;
          _$jscoverage['/editor/styles.js'].lineData[1186]++;
          styles = override.styles;
        }
        _$jscoverage['/editor/styles.js'].lineData[1192]++;
        overrideEl = visit1018_1192_1(overrides[elementName] || (overrides[elementName] = {}));
        _$jscoverage['/editor/styles.js'].lineData[1195]++;
        if (visit1019_1195_1(attrs)) {
          _$jscoverage['/editor/styles.js'].lineData[1199]++;
          var overrideAttrs = (overrideEl.attributes = visit1020_1200_1(overrideEl.attributes || []));
          _$jscoverage['/editor/styles.js'].lineData[1201]++;
          for (var attName in attrs) {
            _$jscoverage['/editor/styles.js'].lineData[1205]++;
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1210]++;
        if (visit1021_1210_1(styles)) {
          _$jscoverage['/editor/styles.js'].lineData[1214]++;
          var overrideStyles = (overrideEl.styles = visit1022_1215_1(overrideEl.styles || []));
          _$jscoverage['/editor/styles.js'].lineData[1216]++;
          for (var styleName in styles) {
            _$jscoverage['/editor/styles.js'].lineData[1220]++;
            overrideStyles.push([styleName.toLowerCase(), styles[styleName]]);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1226]++;
    return overrides;
  }
  _$jscoverage['/editor/styles.js'].lineData[1230]++;
  function removeFromElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[36]++;
    _$jscoverage['/editor/styles.js'].lineData[1231]++;
    var def = style._.definition, overrides = getOverrides(style), attributes = S.merge(def.attributes, (visit1023_1234_1(overrides[element.nodeName()] || visit1024_1234_2(overrides['*'] || {}))).attributes), styles = S.merge(def.styles, (visit1025_1236_1(overrides[element.nodeName()] || visit1026_1236_2(overrides['*'] || {}))).styles), removeEmpty = visit1027_1238_1(S.isEmptyObject(attributes) && S.isEmptyObject(styles));
    _$jscoverage['/editor/styles.js'].lineData[1242]++;
    for (var attName in attributes) {
      _$jscoverage['/editor/styles.js'].lineData[1245]++;
      if (visit1028_1245_1((visit1029_1245_2(visit1030_1245_3(attName === 'class') || style._.definition.fullMatch)) && visit1031_1245_4(element.attr(attName) !== normalizeProperty(attName, attributes[attName])))) {
        _$jscoverage['/editor/styles.js'].lineData[1247]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1249]++;
      removeEmpty = visit1032_1249_1(removeEmpty || !!element.hasAttr(attName));
      _$jscoverage['/editor/styles.js'].lineData[1250]++;
      element.removeAttr(attName);
    }
    _$jscoverage['/editor/styles.js'].lineData[1254]++;
    for (var styleName in styles) {
      _$jscoverage['/editor/styles.js'].lineData[1257]++;
      if (visit1033_1257_1(style._.definition.fullMatch && visit1034_1258_1(element.style(styleName) !== normalizeProperty(styleName, styles[styleName], TRUE)))) {
        _$jscoverage['/editor/styles.js'].lineData[1259]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1262]++;
      removeEmpty = visit1035_1262_1(removeEmpty || !!element.style(styleName));
      _$jscoverage['/editor/styles.js'].lineData[1264]++;
      element.style(styleName, '');
    }
    _$jscoverage['/editor/styles.js'].lineData[1270]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1273]++;
  function normalizeProperty(name, value, isStyle) {
    _$jscoverage['/editor/styles.js'].functionData[37]++;
    _$jscoverage['/editor/styles.js'].lineData[1274]++;
    var temp = new Node('<span>');
    _$jscoverage['/editor/styles.js'].lineData[1275]++;
    temp[isStyle ? 'style' : 'attr'](name, value);
    _$jscoverage['/editor/styles.js'].lineData[1276]++;
    return temp[isStyle ? 'style' : 'attr'](name);
  }
  _$jscoverage['/editor/styles.js'].lineData[1280]++;
  function removeFromInsideElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[38]++;
    _$jscoverage['/editor/styles.js'].lineData[1281]++;
    var overrides = getOverrides(style), innerElements = element.all(style.element);
    _$jscoverage['/editor/styles.js'].lineData[1287]++;
    for (var i = innerElements.length; visit1036_1287_1(--i >= 0); ) {
      _$jscoverage['/editor/styles.js'].lineData[1288]++;
      removeFromElement(style, new Node(innerElements[i]));
    }
    _$jscoverage['/editor/styles.js'].lineData[1293]++;
    for (var overrideElement in overrides) {
      _$jscoverage['/editor/styles.js'].lineData[1295]++;
      if (visit1037_1295_1(overrideElement !== style.element)) {
        _$jscoverage['/editor/styles.js'].lineData[1296]++;
        innerElements = element.all(overrideElement);
        _$jscoverage['/editor/styles.js'].lineData[1297]++;
        for (i = innerElements.length - 1; visit1038_1297_1(i >= 0); i--) {
          _$jscoverage['/editor/styles.js'].lineData[1298]++;
          var innerElement = new Node(innerElements[i]);
          _$jscoverage['/editor/styles.js'].lineData[1299]++;
          removeOverrides(innerElement, overrides[overrideElement]);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1312]++;
  function removeOverrides(element, overrides) {
    _$jscoverage['/editor/styles.js'].functionData[39]++;
    _$jscoverage['/editor/styles.js'].lineData[1313]++;
    var i, actualAttrValue, attributes = visit1039_1314_1(overrides && overrides.attributes);
    _$jscoverage['/editor/styles.js'].lineData[1316]++;
    if (visit1040_1316_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[1317]++;
      for (i = 0; visit1041_1317_1(i < attributes.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1318]++;
        var attName = attributes[i][0];
        _$jscoverage['/editor/styles.js'].lineData[1320]++;
        if ((actualAttrValue = element.attr(attName))) {
          _$jscoverage['/editor/styles.js'].lineData[1321]++;
          var attValue = attributes[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1329]++;
          if (visit1042_1329_1(visit1043_1329_2(attValue === NULL) || visit1044_1330_1((visit1045_1330_2(attValue.test && attValue.test(actualAttrValue))) || (visit1046_1331_1(visit1047_1331_2(typeof attValue === 'string') && visit1048_1331_3(actualAttrValue === attValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1332]++;
            element[0].removeAttribute(attName);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1338]++;
    var styles = visit1049_1338_1(overrides && overrides.styles);
    _$jscoverage['/editor/styles.js'].lineData[1340]++;
    if (visit1050_1340_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[1341]++;
      for (i = 0; visit1051_1341_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1342]++;
        var styleName = styles[i][0], actualStyleValue;
        _$jscoverage['/editor/styles.js'].lineData[1344]++;
        if ((actualStyleValue = element.css(styleName))) {
          _$jscoverage['/editor/styles.js'].lineData[1345]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1346]++;
          if (visit1052_1346_1(visit1053_1346_2(styleValue === NULL) || visit1054_1348_1((visit1055_1348_2(styleValue.test && styleValue.test(actualAttrValue))) || (visit1056_1349_1(visit1057_1349_2(typeof styleValue === 'string') && visit1058_1349_3(actualStyleValue === styleValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1350]++;
            element.css(styleName, '');
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1356]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1360]++;
  function removeNoAttribsElement(element) {
    _$jscoverage['/editor/styles.js'].functionData[40]++;
    _$jscoverage['/editor/styles.js'].lineData[1363]++;
    if (visit1059_1363_1(!element._4eHasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[1366]++;
      var firstChild = element[0].firstChild, lastChild = element[0].lastChild;
      _$jscoverage['/editor/styles.js'].lineData[1369]++;
      element._4eRemove(TRUE);
      _$jscoverage['/editor/styles.js'].lineData[1371]++;
      if (visit1060_1371_1(firstChild)) {
        _$jscoverage['/editor/styles.js'].lineData[1373]++;
        if (visit1061_1373_1(firstChild.nodeType === Dom.NodeType.ELEMENT_NODE)) {
          _$jscoverage['/editor/styles.js'].lineData[1374]++;
          Dom._4eMergeSiblings(firstChild);
        }
        _$jscoverage['/editor/styles.js'].lineData[1377]++;
        if (visit1062_1377_1(lastChild && visit1063_1377_2(visit1064_1377_3(firstChild !== lastChild) && visit1065_1377_4(lastChild.nodeType === Dom.NodeType.ELEMENT_NODE)))) {
          _$jscoverage['/editor/styles.js'].lineData[1378]++;
          Dom._4eMergeSiblings(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1384]++;
  Editor.Style = KEStyle;
  _$jscoverage['/editor/styles.js'].lineData[1386]++;
  return KEStyle;
});
