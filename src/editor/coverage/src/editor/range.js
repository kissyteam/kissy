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
if (! _$jscoverage['/editor/range.js']) {
  _$jscoverage['/editor/range.js'] = {};
  _$jscoverage['/editor/range.js'].lineData = [];
  _$jscoverage['/editor/range.js'].lineData[10] = 0;
  _$jscoverage['/editor/range.js'].lineData[11] = 0;
  _$jscoverage['/editor/range.js'].lineData[12] = 0;
  _$jscoverage['/editor/range.js'].lineData[13] = 0;
  _$jscoverage['/editor/range.js'].lineData[14] = 0;
  _$jscoverage['/editor/range.js'].lineData[15] = 0;
  _$jscoverage['/editor/range.js'].lineData[16] = 0;
  _$jscoverage['/editor/range.js'].lineData[21] = 0;
  _$jscoverage['/editor/range.js'].lineData[35] = 0;
  _$jscoverage['/editor/range.js'].lineData[54] = 0;
  _$jscoverage['/editor/range.js'].lineData[59] = 0;
  _$jscoverage['/editor/range.js'].lineData[70] = 0;
  _$jscoverage['/editor/range.js'].lineData[74] = 0;
  _$jscoverage['/editor/range.js'].lineData[80] = 0;
  _$jscoverage['/editor/range.js'].lineData[83] = 0;
  _$jscoverage['/editor/range.js'].lineData[85] = 0;
  _$jscoverage['/editor/range.js'].lineData[88] = 0;
  _$jscoverage['/editor/range.js'].lineData[89] = 0;
  _$jscoverage['/editor/range.js'].lineData[90] = 0;
  _$jscoverage['/editor/range.js'].lineData[92] = 0;
  _$jscoverage['/editor/range.js'].lineData[93] = 0;
  _$jscoverage['/editor/range.js'].lineData[95] = 0;
  _$jscoverage['/editor/range.js'].lineData[97] = 0;
  _$jscoverage['/editor/range.js'].lineData[98] = 0;
  _$jscoverage['/editor/range.js'].lineData[100] = 0;
  _$jscoverage['/editor/range.js'].lineData[101] = 0;
  _$jscoverage['/editor/range.js'].lineData[104] = 0;
  _$jscoverage['/editor/range.js'].lineData[107] = 0;
  _$jscoverage['/editor/range.js'].lineData[108] = 0;
  _$jscoverage['/editor/range.js'].lineData[110] = 0;
  _$jscoverage['/editor/range.js'].lineData[114] = 0;
  _$jscoverage['/editor/range.js'].lineData[125] = 0;
  _$jscoverage['/editor/range.js'].lineData[126] = 0;
  _$jscoverage['/editor/range.js'].lineData[138] = 0;
  _$jscoverage['/editor/range.js'].lineData[139] = 0;
  _$jscoverage['/editor/range.js'].lineData[142] = 0;
  _$jscoverage['/editor/range.js'].lineData[143] = 0;
  _$jscoverage['/editor/range.js'].lineData[147] = 0;
  _$jscoverage['/editor/range.js'].lineData[155] = 0;
  _$jscoverage['/editor/range.js'].lineData[156] = 0;
  _$jscoverage['/editor/range.js'].lineData[157] = 0;
  _$jscoverage['/editor/range.js'].lineData[161] = 0;
  _$jscoverage['/editor/range.js'].lineData[163] = 0;
  _$jscoverage['/editor/range.js'].lineData[165] = 0;
  _$jscoverage['/editor/range.js'].lineData[168] = 0;
  _$jscoverage['/editor/range.js'].lineData[170] = 0;
  _$jscoverage['/editor/range.js'].lineData[179] = 0;
  _$jscoverage['/editor/range.js'].lineData[180] = 0;
  _$jscoverage['/editor/range.js'].lineData[181] = 0;
  _$jscoverage['/editor/range.js'].lineData[188] = 0;
  _$jscoverage['/editor/range.js'].lineData[190] = 0;
  _$jscoverage['/editor/range.js'].lineData[191] = 0;
  _$jscoverage['/editor/range.js'].lineData[192] = 0;
  _$jscoverage['/editor/range.js'].lineData[193] = 0;
  _$jscoverage['/editor/range.js'].lineData[195] = 0;
  _$jscoverage['/editor/range.js'].lineData[197] = 0;
  _$jscoverage['/editor/range.js'].lineData[199] = 0;
  _$jscoverage['/editor/range.js'].lineData[201] = 0;
  _$jscoverage['/editor/range.js'].lineData[208] = 0;
  _$jscoverage['/editor/range.js'].lineData[211] = 0;
  _$jscoverage['/editor/range.js'].lineData[212] = 0;
  _$jscoverage['/editor/range.js'].lineData[215] = 0;
  _$jscoverage['/editor/range.js'].lineData[216] = 0;
  _$jscoverage['/editor/range.js'].lineData[221] = 0;
  _$jscoverage['/editor/range.js'].lineData[223] = 0;
  _$jscoverage['/editor/range.js'].lineData[224] = 0;
  _$jscoverage['/editor/range.js'].lineData[225] = 0;
  _$jscoverage['/editor/range.js'].lineData[231] = 0;
  _$jscoverage['/editor/range.js'].lineData[232] = 0;
  _$jscoverage['/editor/range.js'].lineData[236] = 0;
  _$jscoverage['/editor/range.js'].lineData[244] = 0;
  _$jscoverage['/editor/range.js'].lineData[245] = 0;
  _$jscoverage['/editor/range.js'].lineData[248] = 0;
  _$jscoverage['/editor/range.js'].lineData[250] = 0;
  _$jscoverage['/editor/range.js'].lineData[252] = 0;
  _$jscoverage['/editor/range.js'].lineData[256] = 0;
  _$jscoverage['/editor/range.js'].lineData[258] = 0;
  _$jscoverage['/editor/range.js'].lineData[262] = 0;
  _$jscoverage['/editor/range.js'].lineData[265] = 0;
  _$jscoverage['/editor/range.js'].lineData[266] = 0;
  _$jscoverage['/editor/range.js'].lineData[270] = 0;
  _$jscoverage['/editor/range.js'].lineData[273] = 0;
  _$jscoverage['/editor/range.js'].lineData[275] = 0;
  _$jscoverage['/editor/range.js'].lineData[280] = 0;
  _$jscoverage['/editor/range.js'].lineData[281] = 0;
  _$jscoverage['/editor/range.js'].lineData[282] = 0;
  _$jscoverage['/editor/range.js'].lineData[283] = 0;
  _$jscoverage['/editor/range.js'].lineData[286] = 0;
  _$jscoverage['/editor/range.js'].lineData[290] = 0;
  _$jscoverage['/editor/range.js'].lineData[292] = 0;
  _$jscoverage['/editor/range.js'].lineData[296] = 0;
  _$jscoverage['/editor/range.js'].lineData[299] = 0;
  _$jscoverage['/editor/range.js'].lineData[300] = 0;
  _$jscoverage['/editor/range.js'].lineData[304] = 0;
  _$jscoverage['/editor/range.js'].lineData[308] = 0;
  _$jscoverage['/editor/range.js'].lineData[309] = 0;
  _$jscoverage['/editor/range.js'].lineData[312] = 0;
  _$jscoverage['/editor/range.js'].lineData[315] = 0;
  _$jscoverage['/editor/range.js'].lineData[317] = 0;
  _$jscoverage['/editor/range.js'].lineData[321] = 0;
  _$jscoverage['/editor/range.js'].lineData[326] = 0;
  _$jscoverage['/editor/range.js'].lineData[327] = 0;
  _$jscoverage['/editor/range.js'].lineData[329] = 0;
  _$jscoverage['/editor/range.js'].lineData[332] = 0;
  _$jscoverage['/editor/range.js'].lineData[333] = 0;
  _$jscoverage['/editor/range.js'].lineData[337] = 0;
  _$jscoverage['/editor/range.js'].lineData[340] = 0;
  _$jscoverage['/editor/range.js'].lineData[342] = 0;
  _$jscoverage['/editor/range.js'].lineData[346] = 0;
  _$jscoverage['/editor/range.js'].lineData[350] = 0;
  _$jscoverage['/editor/range.js'].lineData[351] = 0;
  _$jscoverage['/editor/range.js'].lineData[355] = 0;
  _$jscoverage['/editor/range.js'].lineData[359] = 0;
  _$jscoverage['/editor/range.js'].lineData[360] = 0;
  _$jscoverage['/editor/range.js'].lineData[361] = 0;
  _$jscoverage['/editor/range.js'].lineData[365] = 0;
  _$jscoverage['/editor/range.js'].lineData[366] = 0;
  _$jscoverage['/editor/range.js'].lineData[370] = 0;
  _$jscoverage['/editor/range.js'].lineData[371] = 0;
  _$jscoverage['/editor/range.js'].lineData[372] = 0;
  _$jscoverage['/editor/range.js'].lineData[375] = 0;
  _$jscoverage['/editor/range.js'].lineData[376] = 0;
  _$jscoverage['/editor/range.js'].lineData[386] = 0;
  _$jscoverage['/editor/range.js'].lineData[393] = 0;
  _$jscoverage['/editor/range.js'].lineData[397] = 0;
  _$jscoverage['/editor/range.js'].lineData[400] = 0;
  _$jscoverage['/editor/range.js'].lineData[403] = 0;
  _$jscoverage['/editor/range.js'].lineData[407] = 0;
  _$jscoverage['/editor/range.js'].lineData[412] = 0;
  _$jscoverage['/editor/range.js'].lineData[413] = 0;
  _$jscoverage['/editor/range.js'].lineData[416] = 0;
  _$jscoverage['/editor/range.js'].lineData[417] = 0;
  _$jscoverage['/editor/range.js'].lineData[420] = 0;
  _$jscoverage['/editor/range.js'].lineData[423] = 0;
  _$jscoverage['/editor/range.js'].lineData[424] = 0;
  _$jscoverage['/editor/range.js'].lineData[437] = 0;
  _$jscoverage['/editor/range.js'].lineData[438] = 0;
  _$jscoverage['/editor/range.js'].lineData[439] = 0;
  _$jscoverage['/editor/range.js'].lineData[440] = 0;
  _$jscoverage['/editor/range.js'].lineData[441] = 0;
  _$jscoverage['/editor/range.js'].lineData[442] = 0;
  _$jscoverage['/editor/range.js'].lineData[443] = 0;
  _$jscoverage['/editor/range.js'].lineData[444] = 0;
  _$jscoverage['/editor/range.js'].lineData[447] = 0;
  _$jscoverage['/editor/range.js'].lineData[453] = 0;
  _$jscoverage['/editor/range.js'].lineData[457] = 0;
  _$jscoverage['/editor/range.js'].lineData[458] = 0;
  _$jscoverage['/editor/range.js'].lineData[459] = 0;
  _$jscoverage['/editor/range.js'].lineData[469] = 0;
  _$jscoverage['/editor/range.js'].lineData[473] = 0;
  _$jscoverage['/editor/range.js'].lineData[474] = 0;
  _$jscoverage['/editor/range.js'].lineData[475] = 0;
  _$jscoverage['/editor/range.js'].lineData[476] = 0;
  _$jscoverage['/editor/range.js'].lineData[477] = 0;
  _$jscoverage['/editor/range.js'].lineData[481] = 0;
  _$jscoverage['/editor/range.js'].lineData[482] = 0;
  _$jscoverage['/editor/range.js'].lineData[484] = 0;
  _$jscoverage['/editor/range.js'].lineData[485] = 0;
  _$jscoverage['/editor/range.js'].lineData[486] = 0;
  _$jscoverage['/editor/range.js'].lineData[487] = 0;
  _$jscoverage['/editor/range.js'].lineData[488] = 0;
  _$jscoverage['/editor/range.js'].lineData[498] = 0;
  _$jscoverage['/editor/range.js'].lineData[505] = 0;
  _$jscoverage['/editor/range.js'].lineData[512] = 0;
  _$jscoverage['/editor/range.js'].lineData[519] = 0;
  _$jscoverage['/editor/range.js'].lineData[526] = 0;
  _$jscoverage['/editor/range.js'].lineData[530] = 0;
  _$jscoverage['/editor/range.js'].lineData[533] = 0;
  _$jscoverage['/editor/range.js'].lineData[535] = 0;
  _$jscoverage['/editor/range.js'].lineData[538] = 0;
  _$jscoverage['/editor/range.js'].lineData[556] = 0;
  _$jscoverage['/editor/range.js'].lineData[557] = 0;
  _$jscoverage['/editor/range.js'].lineData[558] = 0;
  _$jscoverage['/editor/range.js'].lineData[559] = 0;
  _$jscoverage['/editor/range.js'].lineData[562] = 0;
  _$jscoverage['/editor/range.js'].lineData[563] = 0;
  _$jscoverage['/editor/range.js'].lineData[565] = 0;
  _$jscoverage['/editor/range.js'].lineData[566] = 0;
  _$jscoverage['/editor/range.js'].lineData[567] = 0;
  _$jscoverage['/editor/range.js'].lineData[570] = 0;
  _$jscoverage['/editor/range.js'].lineData[587] = 0;
  _$jscoverage['/editor/range.js'].lineData[588] = 0;
  _$jscoverage['/editor/range.js'].lineData[589] = 0;
  _$jscoverage['/editor/range.js'].lineData[590] = 0;
  _$jscoverage['/editor/range.js'].lineData[593] = 0;
  _$jscoverage['/editor/range.js'].lineData[594] = 0;
  _$jscoverage['/editor/range.js'].lineData[596] = 0;
  _$jscoverage['/editor/range.js'].lineData[597] = 0;
  _$jscoverage['/editor/range.js'].lineData[598] = 0;
  _$jscoverage['/editor/range.js'].lineData[601] = 0;
  _$jscoverage['/editor/range.js'].lineData[610] = 0;
  _$jscoverage['/editor/range.js'].lineData[611] = 0;
  _$jscoverage['/editor/range.js'].lineData[613] = 0;
  _$jscoverage['/editor/range.js'].lineData[614] = 0;
  _$jscoverage['/editor/range.js'].lineData[617] = 0;
  _$jscoverage['/editor/range.js'].lineData[618] = 0;
  _$jscoverage['/editor/range.js'].lineData[620] = 0;
  _$jscoverage['/editor/range.js'].lineData[622] = 0;
  _$jscoverage['/editor/range.js'].lineData[625] = 0;
  _$jscoverage['/editor/range.js'].lineData[626] = 0;
  _$jscoverage['/editor/range.js'].lineData[629] = 0;
  _$jscoverage['/editor/range.js'].lineData[632] = 0;
  _$jscoverage['/editor/range.js'].lineData[641] = 0;
  _$jscoverage['/editor/range.js'].lineData[642] = 0;
  _$jscoverage['/editor/range.js'].lineData[644] = 0;
  _$jscoverage['/editor/range.js'].lineData[645] = 0;
  _$jscoverage['/editor/range.js'].lineData[648] = 0;
  _$jscoverage['/editor/range.js'].lineData[649] = 0;
  _$jscoverage['/editor/range.js'].lineData[651] = 0;
  _$jscoverage['/editor/range.js'].lineData[653] = 0;
  _$jscoverage['/editor/range.js'].lineData[656] = 0;
  _$jscoverage['/editor/range.js'].lineData[657] = 0;
  _$jscoverage['/editor/range.js'].lineData[660] = 0;
  _$jscoverage['/editor/range.js'].lineData[663] = 0;
  _$jscoverage['/editor/range.js'].lineData[670] = 0;
  _$jscoverage['/editor/range.js'].lineData[677] = 0;
  _$jscoverage['/editor/range.js'].lineData[684] = 0;
  _$jscoverage['/editor/range.js'].lineData[692] = 0;
  _$jscoverage['/editor/range.js'].lineData[693] = 0;
  _$jscoverage['/editor/range.js'].lineData[694] = 0;
  _$jscoverage['/editor/range.js'].lineData[695] = 0;
  _$jscoverage['/editor/range.js'].lineData[697] = 0;
  _$jscoverage['/editor/range.js'].lineData[698] = 0;
  _$jscoverage['/editor/range.js'].lineData[700] = 0;
  _$jscoverage['/editor/range.js'].lineData[708] = 0;
  _$jscoverage['/editor/range.js'].lineData[711] = 0;
  _$jscoverage['/editor/range.js'].lineData[712] = 0;
  _$jscoverage['/editor/range.js'].lineData[713] = 0;
  _$jscoverage['/editor/range.js'].lineData[714] = 0;
  _$jscoverage['/editor/range.js'].lineData[715] = 0;
  _$jscoverage['/editor/range.js'].lineData[717] = 0;
  _$jscoverage['/editor/range.js'].lineData[729] = 0;
  _$jscoverage['/editor/range.js'].lineData[732] = 0;
  _$jscoverage['/editor/range.js'].lineData[734] = 0;
  _$jscoverage['/editor/range.js'].lineData[736] = 0;
  _$jscoverage['/editor/range.js'].lineData[739] = 0;
  _$jscoverage['/editor/range.js'].lineData[742] = 0;
  _$jscoverage['/editor/range.js'].lineData[743] = 0;
  _$jscoverage['/editor/range.js'].lineData[750] = 0;
  _$jscoverage['/editor/range.js'].lineData[751] = 0;
  _$jscoverage['/editor/range.js'].lineData[752] = 0;
  _$jscoverage['/editor/range.js'].lineData[754] = 0;
  _$jscoverage['/editor/range.js'].lineData[764] = 0;
  _$jscoverage['/editor/range.js'].lineData[765] = 0;
  _$jscoverage['/editor/range.js'].lineData[766] = 0;
  _$jscoverage['/editor/range.js'].lineData[768] = 0;
  _$jscoverage['/editor/range.js'].lineData[779] = 0;
  _$jscoverage['/editor/range.js'].lineData[781] = 0;
  _$jscoverage['/editor/range.js'].lineData[782] = 0;
  _$jscoverage['/editor/range.js'].lineData[783] = 0;
  _$jscoverage['/editor/range.js'].lineData[784] = 0;
  _$jscoverage['/editor/range.js'].lineData[788] = 0;
  _$jscoverage['/editor/range.js'].lineData[789] = 0;
  _$jscoverage['/editor/range.js'].lineData[793] = 0;
  _$jscoverage['/editor/range.js'].lineData[795] = 0;
  _$jscoverage['/editor/range.js'].lineData[796] = 0;
  _$jscoverage['/editor/range.js'].lineData[797] = 0;
  _$jscoverage['/editor/range.js'].lineData[798] = 0;
  _$jscoverage['/editor/range.js'].lineData[800] = 0;
  _$jscoverage['/editor/range.js'].lineData[801] = 0;
  _$jscoverage['/editor/range.js'].lineData[805] = 0;
  _$jscoverage['/editor/range.js'].lineData[807] = 0;
  _$jscoverage['/editor/range.js'].lineData[809] = 0;
  _$jscoverage['/editor/range.js'].lineData[810] = 0;
  _$jscoverage['/editor/range.js'].lineData[814] = 0;
  _$jscoverage['/editor/range.js'].lineData[816] = 0;
  _$jscoverage['/editor/range.js'].lineData[818] = 0;
  _$jscoverage['/editor/range.js'].lineData[821] = 0;
  _$jscoverage['/editor/range.js'].lineData[822] = 0;
  _$jscoverage['/editor/range.js'].lineData[824] = 0;
  _$jscoverage['/editor/range.js'].lineData[825] = 0;
  _$jscoverage['/editor/range.js'].lineData[827] = 0;
  _$jscoverage['/editor/range.js'].lineData[832] = 0;
  _$jscoverage['/editor/range.js'].lineData[833] = 0;
  _$jscoverage['/editor/range.js'].lineData[834] = 0;
  _$jscoverage['/editor/range.js'].lineData[835] = 0;
  _$jscoverage['/editor/range.js'].lineData[839] = 0;
  _$jscoverage['/editor/range.js'].lineData[840] = 0;
  _$jscoverage['/editor/range.js'].lineData[841] = 0;
  _$jscoverage['/editor/range.js'].lineData[842] = 0;
  _$jscoverage['/editor/range.js'].lineData[843] = 0;
  _$jscoverage['/editor/range.js'].lineData[847] = 0;
  _$jscoverage['/editor/range.js'].lineData[857] = 0;
  _$jscoverage['/editor/range.js'].lineData[867] = 0;
  _$jscoverage['/editor/range.js'].lineData[868] = 0;
  _$jscoverage['/editor/range.js'].lineData[874] = 0;
  _$jscoverage['/editor/range.js'].lineData[877] = 0;
  _$jscoverage['/editor/range.js'].lineData[878] = 0;
  _$jscoverage['/editor/range.js'].lineData[882] = 0;
  _$jscoverage['/editor/range.js'].lineData[884] = 0;
  _$jscoverage['/editor/range.js'].lineData[885] = 0;
  _$jscoverage['/editor/range.js'].lineData[891] = 0;
  _$jscoverage['/editor/range.js'].lineData[894] = 0;
  _$jscoverage['/editor/range.js'].lineData[895] = 0;
  _$jscoverage['/editor/range.js'].lineData[899] = 0;
  _$jscoverage['/editor/range.js'].lineData[902] = 0;
  _$jscoverage['/editor/range.js'].lineData[903] = 0;
  _$jscoverage['/editor/range.js'].lineData[907] = 0;
  _$jscoverage['/editor/range.js'].lineData[910] = 0;
  _$jscoverage['/editor/range.js'].lineData[911] = 0;
  _$jscoverage['/editor/range.js'].lineData[916] = 0;
  _$jscoverage['/editor/range.js'].lineData[919] = 0;
  _$jscoverage['/editor/range.js'].lineData[920] = 0;
  _$jscoverage['/editor/range.js'].lineData[925] = 0;
  _$jscoverage['/editor/range.js'].lineData[939] = 0;
  _$jscoverage['/editor/range.js'].lineData[945] = 0;
  _$jscoverage['/editor/range.js'].lineData[946] = 0;
  _$jscoverage['/editor/range.js'].lineData[947] = 0;
  _$jscoverage['/editor/range.js'].lineData[951] = 0;
  _$jscoverage['/editor/range.js'].lineData[953] = 0;
  _$jscoverage['/editor/range.js'].lineData[954] = 0;
  _$jscoverage['/editor/range.js'].lineData[955] = 0;
  _$jscoverage['/editor/range.js'].lineData[959] = 0;
  _$jscoverage['/editor/range.js'].lineData[960] = 0;
  _$jscoverage['/editor/range.js'].lineData[961] = 0;
  _$jscoverage['/editor/range.js'].lineData[963] = 0;
  _$jscoverage['/editor/range.js'].lineData[964] = 0;
  _$jscoverage['/editor/range.js'].lineData[967] = 0;
  _$jscoverage['/editor/range.js'].lineData[968] = 0;
  _$jscoverage['/editor/range.js'].lineData[969] = 0;
  _$jscoverage['/editor/range.js'].lineData[972] = 0;
  _$jscoverage['/editor/range.js'].lineData[973] = 0;
  _$jscoverage['/editor/range.js'].lineData[974] = 0;
  _$jscoverage['/editor/range.js'].lineData[977] = 0;
  _$jscoverage['/editor/range.js'].lineData[978] = 0;
  _$jscoverage['/editor/range.js'].lineData[979] = 0;
  _$jscoverage['/editor/range.js'].lineData[981] = 0;
  _$jscoverage['/editor/range.js'].lineData[984] = 0;
  _$jscoverage['/editor/range.js'].lineData[998] = 0;
  _$jscoverage['/editor/range.js'].lineData[999] = 0;
  _$jscoverage['/editor/range.js'].lineData[1000] = 0;
  _$jscoverage['/editor/range.js'].lineData[1009] = 0;
  _$jscoverage['/editor/range.js'].lineData[1014] = 0;
  _$jscoverage['/editor/range.js'].lineData[1019] = 0;
  _$jscoverage['/editor/range.js'].lineData[1020] = 0;
  _$jscoverage['/editor/range.js'].lineData[1021] = 0;
  _$jscoverage['/editor/range.js'].lineData[1025] = 0;
  _$jscoverage['/editor/range.js'].lineData[1026] = 0;
  _$jscoverage['/editor/range.js'].lineData[1027] = 0;
  _$jscoverage['/editor/range.js'].lineData[1032] = 0;
  _$jscoverage['/editor/range.js'].lineData[1034] = 0;
  _$jscoverage['/editor/range.js'].lineData[1035] = 0;
  _$jscoverage['/editor/range.js'].lineData[1038] = 0;
  _$jscoverage['/editor/range.js'].lineData[1039] = 0;
  _$jscoverage['/editor/range.js'].lineData[1040] = 0;
  _$jscoverage['/editor/range.js'].lineData[1041] = 0;
  _$jscoverage['/editor/range.js'].lineData[1045] = 0;
  _$jscoverage['/editor/range.js'].lineData[1047] = 0;
  _$jscoverage['/editor/range.js'].lineData[1048] = 0;
  _$jscoverage['/editor/range.js'].lineData[1049] = 0;
  _$jscoverage['/editor/range.js'].lineData[1053] = 0;
  _$jscoverage['/editor/range.js'].lineData[1056] = 0;
  _$jscoverage['/editor/range.js'].lineData[1060] = 0;
  _$jscoverage['/editor/range.js'].lineData[1061] = 0;
  _$jscoverage['/editor/range.js'].lineData[1062] = 0;
  _$jscoverage['/editor/range.js'].lineData[1066] = 0;
  _$jscoverage['/editor/range.js'].lineData[1067] = 0;
  _$jscoverage['/editor/range.js'].lineData[1068] = 0;
  _$jscoverage['/editor/range.js'].lineData[1073] = 0;
  _$jscoverage['/editor/range.js'].lineData[1075] = 0;
  _$jscoverage['/editor/range.js'].lineData[1076] = 0;
  _$jscoverage['/editor/range.js'].lineData[1079] = 0;
  _$jscoverage['/editor/range.js'].lineData[1087] = 0;
  _$jscoverage['/editor/range.js'].lineData[1088] = 0;
  _$jscoverage['/editor/range.js'].lineData[1089] = 0;
  _$jscoverage['/editor/range.js'].lineData[1090] = 0;
  _$jscoverage['/editor/range.js'].lineData[1094] = 0;
  _$jscoverage['/editor/range.js'].lineData[1096] = 0;
  _$jscoverage['/editor/range.js'].lineData[1097] = 0;
  _$jscoverage['/editor/range.js'].lineData[1100] = 0;
  _$jscoverage['/editor/range.js'].lineData[1108] = 0;
  _$jscoverage['/editor/range.js'].lineData[1110] = 0;
  _$jscoverage['/editor/range.js'].lineData[1112] = 0;
  _$jscoverage['/editor/range.js'].lineData[1118] = 0;
  _$jscoverage['/editor/range.js'].lineData[1121] = 0;
  _$jscoverage['/editor/range.js'].lineData[1122] = 0;
  _$jscoverage['/editor/range.js'].lineData[1124] = 0;
  _$jscoverage['/editor/range.js'].lineData[1128] = 0;
  _$jscoverage['/editor/range.js'].lineData[1135] = 0;
  _$jscoverage['/editor/range.js'].lineData[1138] = 0;
  _$jscoverage['/editor/range.js'].lineData[1142] = 0;
  _$jscoverage['/editor/range.js'].lineData[1143] = 0;
  _$jscoverage['/editor/range.js'].lineData[1144] = 0;
  _$jscoverage['/editor/range.js'].lineData[1146] = 0;
  _$jscoverage['/editor/range.js'].lineData[1157] = 0;
  _$jscoverage['/editor/range.js'].lineData[1162] = 0;
  _$jscoverage['/editor/range.js'].lineData[1163] = 0;
  _$jscoverage['/editor/range.js'].lineData[1166] = 0;
  _$jscoverage['/editor/range.js'].lineData[1168] = 0;
  _$jscoverage['/editor/range.js'].lineData[1171] = 0;
  _$jscoverage['/editor/range.js'].lineData[1174] = 0;
  _$jscoverage['/editor/range.js'].lineData[1188] = 0;
  _$jscoverage['/editor/range.js'].lineData[1189] = 0;
  _$jscoverage['/editor/range.js'].lineData[1197] = 0;
  _$jscoverage['/editor/range.js'].lineData[1198] = 0;
  _$jscoverage['/editor/range.js'].lineData[1200] = 0;
  _$jscoverage['/editor/range.js'].lineData[1201] = 0;
  _$jscoverage['/editor/range.js'].lineData[1204] = 0;
  _$jscoverage['/editor/range.js'].lineData[1205] = 0;
  _$jscoverage['/editor/range.js'].lineData[1210] = 0;
  _$jscoverage['/editor/range.js'].lineData[1212] = 0;
  _$jscoverage['/editor/range.js'].lineData[1215] = 0;
  _$jscoverage['/editor/range.js'].lineData[1217] = 0;
  _$jscoverage['/editor/range.js'].lineData[1220] = 0;
  _$jscoverage['/editor/range.js'].lineData[1222] = 0;
  _$jscoverage['/editor/range.js'].lineData[1223] = 0;
  _$jscoverage['/editor/range.js'].lineData[1224] = 0;
  _$jscoverage['/editor/range.js'].lineData[1226] = 0;
  _$jscoverage['/editor/range.js'].lineData[1231] = 0;
  _$jscoverage['/editor/range.js'].lineData[1233] = 0;
  _$jscoverage['/editor/range.js'].lineData[1235] = 0;
  _$jscoverage['/editor/range.js'].lineData[1237] = 0;
  _$jscoverage['/editor/range.js'].lineData[1244] = 0;
  _$jscoverage['/editor/range.js'].lineData[1246] = 0;
  _$jscoverage['/editor/range.js'].lineData[1247] = 0;
  _$jscoverage['/editor/range.js'].lineData[1250] = 0;
  _$jscoverage['/editor/range.js'].lineData[1251] = 0;
  _$jscoverage['/editor/range.js'].lineData[1252] = 0;
  _$jscoverage['/editor/range.js'].lineData[1255] = 0;
  _$jscoverage['/editor/range.js'].lineData[1258] = 0;
  _$jscoverage['/editor/range.js'].lineData[1259] = 0;
  _$jscoverage['/editor/range.js'].lineData[1264] = 0;
  _$jscoverage['/editor/range.js'].lineData[1265] = 0;
  _$jscoverage['/editor/range.js'].lineData[1266] = 0;
  _$jscoverage['/editor/range.js'].lineData[1269] = 0;
  _$jscoverage['/editor/range.js'].lineData[1270] = 0;
  _$jscoverage['/editor/range.js'].lineData[1273] = 0;
  _$jscoverage['/editor/range.js'].lineData[1276] = 0;
  _$jscoverage['/editor/range.js'].lineData[1277] = 0;
  _$jscoverage['/editor/range.js'].lineData[1279] = 0;
  _$jscoverage['/editor/range.js'].lineData[1280] = 0;
  _$jscoverage['/editor/range.js'].lineData[1281] = 0;
  _$jscoverage['/editor/range.js'].lineData[1282] = 0;
  _$jscoverage['/editor/range.js'].lineData[1285] = 0;
  _$jscoverage['/editor/range.js'].lineData[1291] = 0;
  _$jscoverage['/editor/range.js'].lineData[1292] = 0;
  _$jscoverage['/editor/range.js'].lineData[1294] = 0;
  _$jscoverage['/editor/range.js'].lineData[1295] = 0;
  _$jscoverage['/editor/range.js'].lineData[1297] = 0;
  _$jscoverage['/editor/range.js'].lineData[1305] = 0;
  _$jscoverage['/editor/range.js'].lineData[1306] = 0;
  _$jscoverage['/editor/range.js'].lineData[1307] = 0;
  _$jscoverage['/editor/range.js'].lineData[1309] = 0;
  _$jscoverage['/editor/range.js'].lineData[1313] = 0;
  _$jscoverage['/editor/range.js'].lineData[1314] = 0;
  _$jscoverage['/editor/range.js'].lineData[1315] = 0;
  _$jscoverage['/editor/range.js'].lineData[1317] = 0;
  _$jscoverage['/editor/range.js'].lineData[1320] = 0;
  _$jscoverage['/editor/range.js'].lineData[1322] = 0;
  _$jscoverage['/editor/range.js'].lineData[1325] = 0;
  _$jscoverage['/editor/range.js'].lineData[1329] = 0;
  _$jscoverage['/editor/range.js'].lineData[1345] = 0;
  _$jscoverage['/editor/range.js'].lineData[1346] = 0;
  _$jscoverage['/editor/range.js'].lineData[1347] = 0;
  _$jscoverage['/editor/range.js'].lineData[1348] = 0;
  _$jscoverage['/editor/range.js'].lineData[1351] = 0;
  _$jscoverage['/editor/range.js'].lineData[1353] = 0;
  _$jscoverage['/editor/range.js'].lineData[1356] = 0;
  _$jscoverage['/editor/range.js'].lineData[1359] = 0;
  _$jscoverage['/editor/range.js'].lineData[1363] = 0;
  _$jscoverage['/editor/range.js'].lineData[1371] = 0;
  _$jscoverage['/editor/range.js'].lineData[1372] = 0;
  _$jscoverage['/editor/range.js'].lineData[1383] = 0;
  _$jscoverage['/editor/range.js'].lineData[1389] = 0;
  _$jscoverage['/editor/range.js'].lineData[1390] = 0;
  _$jscoverage['/editor/range.js'].lineData[1391] = 0;
  _$jscoverage['/editor/range.js'].lineData[1392] = 0;
  _$jscoverage['/editor/range.js'].lineData[1399] = 0;
  _$jscoverage['/editor/range.js'].lineData[1403] = 0;
  _$jscoverage['/editor/range.js'].lineData[1406] = 0;
  _$jscoverage['/editor/range.js'].lineData[1407] = 0;
  _$jscoverage['/editor/range.js'].lineData[1408] = 0;
  _$jscoverage['/editor/range.js'].lineData[1410] = 0;
  _$jscoverage['/editor/range.js'].lineData[1411] = 0;
  _$jscoverage['/editor/range.js'].lineData[1413] = 0;
  _$jscoverage['/editor/range.js'].lineData[1421] = 0;
  _$jscoverage['/editor/range.js'].lineData[1426] = 0;
  _$jscoverage['/editor/range.js'].lineData[1427] = 0;
  _$jscoverage['/editor/range.js'].lineData[1428] = 0;
  _$jscoverage['/editor/range.js'].lineData[1429] = 0;
  _$jscoverage['/editor/range.js'].lineData[1436] = 0;
  _$jscoverage['/editor/range.js'].lineData[1440] = 0;
  _$jscoverage['/editor/range.js'].lineData[1443] = 0;
  _$jscoverage['/editor/range.js'].lineData[1444] = 0;
  _$jscoverage['/editor/range.js'].lineData[1445] = 0;
  _$jscoverage['/editor/range.js'].lineData[1447] = 0;
  _$jscoverage['/editor/range.js'].lineData[1448] = 0;
  _$jscoverage['/editor/range.js'].lineData[1450] = 0;
  _$jscoverage['/editor/range.js'].lineData[1459] = 0;
  _$jscoverage['/editor/range.js'].lineData[1463] = 0;
  _$jscoverage['/editor/range.js'].lineData[1467] = 0;
  _$jscoverage['/editor/range.js'].lineData[1469] = 0;
  _$jscoverage['/editor/range.js'].lineData[1470] = 0;
  _$jscoverage['/editor/range.js'].lineData[1479] = 0;
  _$jscoverage['/editor/range.js'].lineData[1486] = 0;
  _$jscoverage['/editor/range.js'].lineData[1487] = 0;
  _$jscoverage['/editor/range.js'].lineData[1488] = 0;
  _$jscoverage['/editor/range.js'].lineData[1489] = 0;
  _$jscoverage['/editor/range.js'].lineData[1490] = 0;
  _$jscoverage['/editor/range.js'].lineData[1492] = 0;
  _$jscoverage['/editor/range.js'].lineData[1496] = 0;
  _$jscoverage['/editor/range.js'].lineData[1497] = 0;
  _$jscoverage['/editor/range.js'].lineData[1498] = 0;
  _$jscoverage['/editor/range.js'].lineData[1501] = 0;
  _$jscoverage['/editor/range.js'].lineData[1506] = 0;
  _$jscoverage['/editor/range.js'].lineData[1510] = 0;
  _$jscoverage['/editor/range.js'].lineData[1511] = 0;
  _$jscoverage['/editor/range.js'].lineData[1512] = 0;
  _$jscoverage['/editor/range.js'].lineData[1513] = 0;
  _$jscoverage['/editor/range.js'].lineData[1516] = 0;
  _$jscoverage['/editor/range.js'].lineData[1517] = 0;
  _$jscoverage['/editor/range.js'].lineData[1521] = 0;
  _$jscoverage['/editor/range.js'].lineData[1522] = 0;
  _$jscoverage['/editor/range.js'].lineData[1523] = 0;
  _$jscoverage['/editor/range.js'].lineData[1524] = 0;
  _$jscoverage['/editor/range.js'].lineData[1530] = 0;
  _$jscoverage['/editor/range.js'].lineData[1531] = 0;
  _$jscoverage['/editor/range.js'].lineData[1534] = 0;
  _$jscoverage['/editor/range.js'].lineData[1545] = 0;
  _$jscoverage['/editor/range.js'].lineData[1548] = 0;
  _$jscoverage['/editor/range.js'].lineData[1549] = 0;
  _$jscoverage['/editor/range.js'].lineData[1550] = 0;
  _$jscoverage['/editor/range.js'].lineData[1551] = 0;
  _$jscoverage['/editor/range.js'].lineData[1552] = 0;
  _$jscoverage['/editor/range.js'].lineData[1553] = 0;
  _$jscoverage['/editor/range.js'].lineData[1555] = 0;
  _$jscoverage['/editor/range.js'].lineData[1556] = 0;
  _$jscoverage['/editor/range.js'].lineData[1557] = 0;
  _$jscoverage['/editor/range.js'].lineData[1566] = 0;
  _$jscoverage['/editor/range.js'].lineData[1576] = 0;
  _$jscoverage['/editor/range.js'].lineData[1577] = 0;
  _$jscoverage['/editor/range.js'].lineData[1581] = 0;
  _$jscoverage['/editor/range.js'].lineData[1582] = 0;
  _$jscoverage['/editor/range.js'].lineData[1583] = 0;
  _$jscoverage['/editor/range.js'].lineData[1584] = 0;
  _$jscoverage['/editor/range.js'].lineData[1587] = 0;
  _$jscoverage['/editor/range.js'].lineData[1588] = 0;
  _$jscoverage['/editor/range.js'].lineData[1593] = 0;
  _$jscoverage['/editor/range.js'].lineData[1597] = 0;
  _$jscoverage['/editor/range.js'].lineData[1599] = 0;
  _$jscoverage['/editor/range.js'].lineData[1600] = 0;
  _$jscoverage['/editor/range.js'].lineData[1601] = 0;
  _$jscoverage['/editor/range.js'].lineData[1602] = 0;
  _$jscoverage['/editor/range.js'].lineData[1603] = 0;
  _$jscoverage['/editor/range.js'].lineData[1605] = 0;
  _$jscoverage['/editor/range.js'].lineData[1606] = 0;
  _$jscoverage['/editor/range.js'].lineData[1607] = 0;
  _$jscoverage['/editor/range.js'].lineData[1608] = 0;
  _$jscoverage['/editor/range.js'].lineData[1611] = 0;
  _$jscoverage['/editor/range.js'].lineData[1615] = 0;
  _$jscoverage['/editor/range.js'].lineData[1616] = 0;
  _$jscoverage['/editor/range.js'].lineData[1621] = 0;
  _$jscoverage['/editor/range.js'].lineData[1636] = 0;
  _$jscoverage['/editor/range.js'].lineData[1637] = 0;
  _$jscoverage['/editor/range.js'].lineData[1638] = 0;
  _$jscoverage['/editor/range.js'].lineData[1642] = 0;
  _$jscoverage['/editor/range.js'].lineData[1643] = 0;
  _$jscoverage['/editor/range.js'].lineData[1648] = 0;
  _$jscoverage['/editor/range.js'].lineData[1650] = 0;
  _$jscoverage['/editor/range.js'].lineData[1651] = 0;
  _$jscoverage['/editor/range.js'].lineData[1652] = 0;
  _$jscoverage['/editor/range.js'].lineData[1664] = 0;
  _$jscoverage['/editor/range.js'].lineData[1665] = 0;
  _$jscoverage['/editor/range.js'].lineData[1667] = 0;
  _$jscoverage['/editor/range.js'].lineData[1669] = 0;
  _$jscoverage['/editor/range.js'].lineData[1672] = 0;
  _$jscoverage['/editor/range.js'].lineData[1673] = 0;
  _$jscoverage['/editor/range.js'].lineData[1676] = 0;
  _$jscoverage['/editor/range.js'].lineData[1679] = 0;
  _$jscoverage['/editor/range.js'].lineData[1681] = 0;
  _$jscoverage['/editor/range.js'].lineData[1683] = 0;
  _$jscoverage['/editor/range.js'].lineData[1684] = 0;
  _$jscoverage['/editor/range.js'].lineData[1687] = 0;
  _$jscoverage['/editor/range.js'].lineData[1688] = 0;
  _$jscoverage['/editor/range.js'].lineData[1692] = 0;
  _$jscoverage['/editor/range.js'].lineData[1693] = 0;
  _$jscoverage['/editor/range.js'].lineData[1696] = 0;
  _$jscoverage['/editor/range.js'].lineData[1699] = 0;
  _$jscoverage['/editor/range.js'].lineData[1702] = 0;
  _$jscoverage['/editor/range.js'].lineData[1710] = 0;
  _$jscoverage['/editor/range.js'].lineData[1711] = 0;
  _$jscoverage['/editor/range.js'].lineData[1712] = 0;
  _$jscoverage['/editor/range.js'].lineData[1722] = 0;
  _$jscoverage['/editor/range.js'].lineData[1728] = 0;
  _$jscoverage['/editor/range.js'].lineData[1729] = 0;
  _$jscoverage['/editor/range.js'].lineData[1730] = 0;
  _$jscoverage['/editor/range.js'].lineData[1731] = 0;
  _$jscoverage['/editor/range.js'].lineData[1732] = 0;
  _$jscoverage['/editor/range.js'].lineData[1735] = 0;
  _$jscoverage['/editor/range.js'].lineData[1736] = 0;
  _$jscoverage['/editor/range.js'].lineData[1737] = 0;
  _$jscoverage['/editor/range.js'].lineData[1738] = 0;
  _$jscoverage['/editor/range.js'].lineData[1740] = 0;
  _$jscoverage['/editor/range.js'].lineData[1742] = 0;
  _$jscoverage['/editor/range.js'].lineData[1745] = 0;
  _$jscoverage['/editor/range.js'].lineData[1746] = 0;
  _$jscoverage['/editor/range.js'].lineData[1750] = 0;
  _$jscoverage['/editor/range.js'].lineData[1754] = 0;
  _$jscoverage['/editor/range.js'].lineData[1756] = 0;
  _$jscoverage['/editor/range.js'].lineData[1757] = 0;
  _$jscoverage['/editor/range.js'].lineData[1759] = 0;
  _$jscoverage['/editor/range.js'].lineData[1765] = 0;
  _$jscoverage['/editor/range.js'].lineData[1766] = 0;
  _$jscoverage['/editor/range.js'].lineData[1769] = 0;
  _$jscoverage['/editor/range.js'].lineData[1772] = 0;
  _$jscoverage['/editor/range.js'].lineData[1775] = 0;
  _$jscoverage['/editor/range.js'].lineData[1779] = 0;
  _$jscoverage['/editor/range.js'].lineData[1781] = 0;
}
if (! _$jscoverage['/editor/range.js'].functionData) {
  _$jscoverage['/editor/range.js'].functionData = [];
  _$jscoverage['/editor/range.js'].functionData[0] = 0;
  _$jscoverage['/editor/range.js'].functionData[1] = 0;
  _$jscoverage['/editor/range.js'].functionData[2] = 0;
  _$jscoverage['/editor/range.js'].functionData[3] = 0;
  _$jscoverage['/editor/range.js'].functionData[4] = 0;
  _$jscoverage['/editor/range.js'].functionData[5] = 0;
  _$jscoverage['/editor/range.js'].functionData[6] = 0;
  _$jscoverage['/editor/range.js'].functionData[7] = 0;
  _$jscoverage['/editor/range.js'].functionData[8] = 0;
  _$jscoverage['/editor/range.js'].functionData[9] = 0;
  _$jscoverage['/editor/range.js'].functionData[10] = 0;
  _$jscoverage['/editor/range.js'].functionData[11] = 0;
  _$jscoverage['/editor/range.js'].functionData[12] = 0;
  _$jscoverage['/editor/range.js'].functionData[13] = 0;
  _$jscoverage['/editor/range.js'].functionData[14] = 0;
  _$jscoverage['/editor/range.js'].functionData[15] = 0;
  _$jscoverage['/editor/range.js'].functionData[16] = 0;
  _$jscoverage['/editor/range.js'].functionData[17] = 0;
  _$jscoverage['/editor/range.js'].functionData[18] = 0;
  _$jscoverage['/editor/range.js'].functionData[19] = 0;
  _$jscoverage['/editor/range.js'].functionData[20] = 0;
  _$jscoverage['/editor/range.js'].functionData[21] = 0;
  _$jscoverage['/editor/range.js'].functionData[22] = 0;
  _$jscoverage['/editor/range.js'].functionData[23] = 0;
  _$jscoverage['/editor/range.js'].functionData[24] = 0;
  _$jscoverage['/editor/range.js'].functionData[25] = 0;
  _$jscoverage['/editor/range.js'].functionData[26] = 0;
  _$jscoverage['/editor/range.js'].functionData[27] = 0;
  _$jscoverage['/editor/range.js'].functionData[28] = 0;
  _$jscoverage['/editor/range.js'].functionData[29] = 0;
  _$jscoverage['/editor/range.js'].functionData[30] = 0;
  _$jscoverage['/editor/range.js'].functionData[31] = 0;
  _$jscoverage['/editor/range.js'].functionData[32] = 0;
  _$jscoverage['/editor/range.js'].functionData[33] = 0;
  _$jscoverage['/editor/range.js'].functionData[34] = 0;
  _$jscoverage['/editor/range.js'].functionData[35] = 0;
  _$jscoverage['/editor/range.js'].functionData[36] = 0;
  _$jscoverage['/editor/range.js'].functionData[37] = 0;
  _$jscoverage['/editor/range.js'].functionData[38] = 0;
  _$jscoverage['/editor/range.js'].functionData[39] = 0;
  _$jscoverage['/editor/range.js'].functionData[40] = 0;
  _$jscoverage['/editor/range.js'].functionData[41] = 0;
  _$jscoverage['/editor/range.js'].functionData[42] = 0;
  _$jscoverage['/editor/range.js'].functionData[43] = 0;
  _$jscoverage['/editor/range.js'].functionData[44] = 0;
  _$jscoverage['/editor/range.js'].functionData[45] = 0;
  _$jscoverage['/editor/range.js'].functionData[46] = 0;
  _$jscoverage['/editor/range.js'].functionData[47] = 0;
  _$jscoverage['/editor/range.js'].functionData[48] = 0;
  _$jscoverage['/editor/range.js'].functionData[49] = 0;
  _$jscoverage['/editor/range.js'].functionData[50] = 0;
  _$jscoverage['/editor/range.js'].functionData[51] = 0;
  _$jscoverage['/editor/range.js'].functionData[52] = 0;
  _$jscoverage['/editor/range.js'].functionData[53] = 0;
  _$jscoverage['/editor/range.js'].functionData[54] = 0;
}
if (! _$jscoverage['/editor/range.js'].branchData) {
  _$jscoverage['/editor/range.js'].branchData = {};
  _$jscoverage['/editor/range.js'].branchData['74'] = [];
  _$jscoverage['/editor/range.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['77'] = [];
  _$jscoverage['/editor/range.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['80'] = [];
  _$jscoverage['/editor/range.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['85'] = [];
  _$jscoverage['/editor/range.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['92'] = [];
  _$jscoverage['/editor/range.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['95'] = [];
  _$jscoverage['/editor/range.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['97'] = [];
  _$jscoverage['/editor/range.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['100'] = [];
  _$jscoverage['/editor/range.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['104'] = [];
  _$jscoverage['/editor/range.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['107'] = [];
  _$jscoverage['/editor/range.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['107'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['107'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['138'] = [];
  _$jscoverage['/editor/range.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['142'] = [];
  _$jscoverage['/editor/range.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['155'] = [];
  _$jscoverage['/editor/range.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['161'] = [];
  _$jscoverage['/editor/range.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['163'] = [];
  _$jscoverage['/editor/range.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['179'] = [];
  _$jscoverage['/editor/range.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['188'] = [];
  _$jscoverage['/editor/range.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['195'] = [];
  _$jscoverage['/editor/range.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['223'] = [];
  _$jscoverage['/editor/range.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['231'] = [];
  _$jscoverage['/editor/range.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['244'] = [];
  _$jscoverage['/editor/range.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['248'] = [];
  _$jscoverage['/editor/range.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['248'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['260'] = [];
  _$jscoverage['/editor/range.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['265'] = [];
  _$jscoverage['/editor/range.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['265'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['265'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['273'] = [];
  _$jscoverage['/editor/range.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['280'] = [];
  _$jscoverage['/editor/range.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['290'] = [];
  _$jscoverage['/editor/range.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['299'] = [];
  _$jscoverage['/editor/range.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['308'] = [];
  _$jscoverage['/editor/range.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['312'] = [];
  _$jscoverage['/editor/range.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['312'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['322'] = [];
  _$jscoverage['/editor/range.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['332'] = [];
  _$jscoverage['/editor/range.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['340'] = [];
  _$jscoverage['/editor/range.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['350'] = [];
  _$jscoverage['/editor/range.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['355'] = [];
  _$jscoverage['/editor/range.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['359'] = [];
  _$jscoverage['/editor/range.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['361'] = [];
  _$jscoverage['/editor/range.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['362'] = [];
  _$jscoverage['/editor/range.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['364'] = [];
  _$jscoverage['/editor/range.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['370'] = [];
  _$jscoverage['/editor/range.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['372'] = [];
  _$jscoverage['/editor/range.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['372'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['373'] = [];
  _$jscoverage['/editor/range.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['374'] = [];
  _$jscoverage['/editor/range.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['387'] = [];
  _$jscoverage['/editor/range.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['387'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['389'] = [];
  _$jscoverage['/editor/range.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['397'] = [];
  _$jscoverage['/editor/range.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['412'] = [];
  _$jscoverage['/editor/range.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['416'] = [];
  _$jscoverage['/editor/range.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['425'] = [];
  _$jscoverage['/editor/range.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['426'] = [];
  _$jscoverage['/editor/range.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['427'] = [];
  _$jscoverage['/editor/range.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['427'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['428'] = [];
  _$jscoverage['/editor/range.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['457'] = [];
  _$jscoverage['/editor/range.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['458'] = [];
  _$jscoverage['/editor/range.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['473'] = [];
  _$jscoverage['/editor/range.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['474'] = [];
  _$jscoverage['/editor/range.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['476'] = [];
  _$jscoverage['/editor/range.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['484'] = [];
  _$jscoverage['/editor/range.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['485'] = [];
  _$jscoverage['/editor/range.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['487'] = [];
  _$jscoverage['/editor/range.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['530'] = [];
  _$jscoverage['/editor/range.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['531'] = [];
  _$jscoverage['/editor/range.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['531'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['535'] = [];
  _$jscoverage['/editor/range.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['536'] = [];
  _$jscoverage['/editor/range.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['536'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['557'] = [];
  _$jscoverage['/editor/range.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['557'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['565'] = [];
  _$jscoverage['/editor/range.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['588'] = [];
  _$jscoverage['/editor/range.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['588'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['596'] = [];
  _$jscoverage['/editor/range.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['617'] = [];
  _$jscoverage['/editor/range.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['648'] = [];
  _$jscoverage['/editor/range.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['693'] = [];
  _$jscoverage['/editor/range.js'].branchData['693'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['734'] = [];
  _$jscoverage['/editor/range.js'].branchData['734'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['734'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['735'] = [];
  _$jscoverage['/editor/range.js'].branchData['735'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['743'] = [];
  _$jscoverage['/editor/range.js'].branchData['743'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['754'] = [];
  _$jscoverage['/editor/range.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['765'] = [];
  _$jscoverage['/editor/range.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['766'] = [];
  _$jscoverage['/editor/range.js'].branchData['766'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['779'] = [];
  _$jscoverage['/editor/range.js'].branchData['779'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['780'] = [];
  _$jscoverage['/editor/range.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['781'] = [];
  _$jscoverage['/editor/range.js'].branchData['781'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['783'] = [];
  _$jscoverage['/editor/range.js'].branchData['783'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['793'] = [];
  _$jscoverage['/editor/range.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['794'] = [];
  _$jscoverage['/editor/range.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['795'] = [];
  _$jscoverage['/editor/range.js'].branchData['795'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['797'] = [];
  _$jscoverage['/editor/range.js'].branchData['797'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['805'] = [];
  _$jscoverage['/editor/range.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['810'] = [];
  _$jscoverage['/editor/range.js'].branchData['810'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['810'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['816'] = [];
  _$jscoverage['/editor/range.js'].branchData['816'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['816'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['817'] = [];
  _$jscoverage['/editor/range.js'].branchData['817'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['821'] = [];
  _$jscoverage['/editor/range.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['821'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['824'] = [];
  _$jscoverage['/editor/range.js'].branchData['824'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['824'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['832'] = [];
  _$jscoverage['/editor/range.js'].branchData['832'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['833'] = [];
  _$jscoverage['/editor/range.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['834'] = [];
  _$jscoverage['/editor/range.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['839'] = [];
  _$jscoverage['/editor/range.js'].branchData['839'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['841'] = [];
  _$jscoverage['/editor/range.js'].branchData['841'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['842'] = [];
  _$jscoverage['/editor/range.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['847'] = [];
  _$jscoverage['/editor/range.js'].branchData['847'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['867'] = [];
  _$jscoverage['/editor/range.js'].branchData['867'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['874'] = [];
  _$jscoverage['/editor/range.js'].branchData['874'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['877'] = [];
  _$jscoverage['/editor/range.js'].branchData['877'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['882'] = [];
  _$jscoverage['/editor/range.js'].branchData['882'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['882'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['882'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['882'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['883'] = [];
  _$jscoverage['/editor/range.js'].branchData['883'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['883'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['883'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['891'] = [];
  _$jscoverage['/editor/range.js'].branchData['891'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['891'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['892'] = [];
  _$jscoverage['/editor/range.js'].branchData['892'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['893'] = [];
  _$jscoverage['/editor/range.js'].branchData['893'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['899'] = [];
  _$jscoverage['/editor/range.js'].branchData['899'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['902'] = [];
  _$jscoverage['/editor/range.js'].branchData['902'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['907'] = [];
  _$jscoverage['/editor/range.js'].branchData['907'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['907'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'] = [];
  _$jscoverage['/editor/range.js'].branchData['908'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'][3] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['908'][4] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['909'] = [];
  _$jscoverage['/editor/range.js'].branchData['909'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['916'] = [];
  _$jscoverage['/editor/range.js'].branchData['916'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['916'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['917'] = [];
  _$jscoverage['/editor/range.js'].branchData['917'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['918'] = [];
  _$jscoverage['/editor/range.js'].branchData['918'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['953'] = [];
  _$jscoverage['/editor/range.js'].branchData['953'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['959'] = [];
  _$jscoverage['/editor/range.js'].branchData['959'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['963'] = [];
  _$jscoverage['/editor/range.js'].branchData['963'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['977'] = [];
  _$jscoverage['/editor/range.js'].branchData['977'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1014'] = [];
  _$jscoverage['/editor/range.js'].branchData['1014'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1014'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1015'] = [];
  _$jscoverage['/editor/range.js'].branchData['1015'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1016'] = [];
  _$jscoverage['/editor/range.js'].branchData['1016'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1019'] = [];
  _$jscoverage['/editor/range.js'].branchData['1019'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1025'] = [];
  _$jscoverage['/editor/range.js'].branchData['1025'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1038'] = [];
  _$jscoverage['/editor/range.js'].branchData['1038'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1040'] = [];
  _$jscoverage['/editor/range.js'].branchData['1040'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1047'] = [];
  _$jscoverage['/editor/range.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1056'] = [];
  _$jscoverage['/editor/range.js'].branchData['1056'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1056'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1057'] = [];
  _$jscoverage['/editor/range.js'].branchData['1057'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1057'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1060'] = [];
  _$jscoverage['/editor/range.js'].branchData['1060'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1066'] = [];
  _$jscoverage['/editor/range.js'].branchData['1066'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1092'] = [];
  _$jscoverage['/editor/range.js'].branchData['1092'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1096'] = [];
  _$jscoverage['/editor/range.js'].branchData['1096'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1110'] = [];
  _$jscoverage['/editor/range.js'].branchData['1110'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1114'] = [];
  _$jscoverage['/editor/range.js'].branchData['1114'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1121'] = [];
  _$jscoverage['/editor/range.js'].branchData['1121'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1142'] = [];
  _$jscoverage['/editor/range.js'].branchData['1142'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1162'] = [];
  _$jscoverage['/editor/range.js'].branchData['1162'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1163'] = [];
  _$jscoverage['/editor/range.js'].branchData['1163'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1164'] = [];
  _$jscoverage['/editor/range.js'].branchData['1164'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1164'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1165'] = [];
  _$jscoverage['/editor/range.js'].branchData['1165'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1174'] = [];
  _$jscoverage['/editor/range.js'].branchData['1174'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1174'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1197'] = [];
  _$jscoverage['/editor/range.js'].branchData['1197'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1198'] = [];
  _$jscoverage['/editor/range.js'].branchData['1198'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1200'] = [];
  _$jscoverage['/editor/range.js'].branchData['1200'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1204'] = [];
  _$jscoverage['/editor/range.js'].branchData['1204'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1215'] = [];
  _$jscoverage['/editor/range.js'].branchData['1215'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1223'] = [];
  _$jscoverage['/editor/range.js'].branchData['1223'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1231'] = [];
  _$jscoverage['/editor/range.js'].branchData['1231'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1233'] = [];
  _$jscoverage['/editor/range.js'].branchData['1233'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1246'] = [];
  _$jscoverage['/editor/range.js'].branchData['1246'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1250'] = [];
  _$jscoverage['/editor/range.js'].branchData['1250'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1269'] = [];
  _$jscoverage['/editor/range.js'].branchData['1269'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1279'] = [];
  _$jscoverage['/editor/range.js'].branchData['1279'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1301'] = [];
  _$jscoverage['/editor/range.js'].branchData['1301'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1306'] = [];
  _$jscoverage['/editor/range.js'].branchData['1306'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1314'] = [];
  _$jscoverage['/editor/range.js'].branchData['1314'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1314'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1325'] = [];
  _$jscoverage['/editor/range.js'].branchData['1325'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1331'] = [];
  _$jscoverage['/editor/range.js'].branchData['1331'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1331'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1339'] = [];
  _$jscoverage['/editor/range.js'].branchData['1339'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1339'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1340'] = [];
  _$jscoverage['/editor/range.js'].branchData['1340'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1351'] = [];
  _$jscoverage['/editor/range.js'].branchData['1351'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1359'] = [];
  _$jscoverage['/editor/range.js'].branchData['1359'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1365'] = [];
  _$jscoverage['/editor/range.js'].branchData['1365'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1365'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1366'] = [];
  _$jscoverage['/editor/range.js'].branchData['1366'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1371'] = [];
  _$jscoverage['/editor/range.js'].branchData['1371'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1389'] = [];
  _$jscoverage['/editor/range.js'].branchData['1389'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1389'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1391'] = [];
  _$jscoverage['/editor/range.js'].branchData['1391'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1408'] = [];
  _$jscoverage['/editor/range.js'].branchData['1408'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1426'] = [];
  _$jscoverage['/editor/range.js'].branchData['1426'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1428'] = [];
  _$jscoverage['/editor/range.js'].branchData['1428'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1445'] = [];
  _$jscoverage['/editor/range.js'].branchData['1445'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1461'] = [];
  _$jscoverage['/editor/range.js'].branchData['1461'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1463'] = [];
  _$jscoverage['/editor/range.js'].branchData['1463'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1470'] = [];
  _$jscoverage['/editor/range.js'].branchData['1470'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1486'] = [];
  _$jscoverage['/editor/range.js'].branchData['1486'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1488'] = [];
  _$jscoverage['/editor/range.js'].branchData['1488'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1490'] = [];
  _$jscoverage['/editor/range.js'].branchData['1490'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1506'] = [];
  _$jscoverage['/editor/range.js'].branchData['1506'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1510'] = [];
  _$jscoverage['/editor/range.js'].branchData['1510'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1512'] = [];
  _$jscoverage['/editor/range.js'].branchData['1512'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1516'] = [];
  _$jscoverage['/editor/range.js'].branchData['1516'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1530'] = [];
  _$jscoverage['/editor/range.js'].branchData['1530'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1552'] = [];
  _$jscoverage['/editor/range.js'].branchData['1552'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1576'] = [];
  _$jscoverage['/editor/range.js'].branchData['1576'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1581'] = [];
  _$jscoverage['/editor/range.js'].branchData['1581'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1582'] = [];
  _$jscoverage['/editor/range.js'].branchData['1582'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1587'] = [];
  _$jscoverage['/editor/range.js'].branchData['1587'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1593'] = [];
  _$jscoverage['/editor/range.js'].branchData['1593'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1594'] = [];
  _$jscoverage['/editor/range.js'].branchData['1594'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1599'] = [];
  _$jscoverage['/editor/range.js'].branchData['1599'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1599'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1600'] = [];
  _$jscoverage['/editor/range.js'].branchData['1600'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1605'] = [];
  _$jscoverage['/editor/range.js'].branchData['1605'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1615'] = [];
  _$jscoverage['/editor/range.js'].branchData['1615'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1637'] = [];
  _$jscoverage['/editor/range.js'].branchData['1637'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1667'] = [];
  _$jscoverage['/editor/range.js'].branchData['1667'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1667'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1672'] = [];
  _$jscoverage['/editor/range.js'].branchData['1672'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1683'] = [];
  _$jscoverage['/editor/range.js'].branchData['1683'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1692'] = [];
  _$jscoverage['/editor/range.js'].branchData['1692'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1692'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1712'] = [];
  _$jscoverage['/editor/range.js'].branchData['1712'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1729'] = [];
  _$jscoverage['/editor/range.js'].branchData['1729'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1731'] = [];
  _$jscoverage['/editor/range.js'].branchData['1731'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1731'][2] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1735'] = [];
  _$jscoverage['/editor/range.js'].branchData['1735'][1] = new BranchData();
  _$jscoverage['/editor/range.js'].branchData['1745'] = [];
  _$jscoverage['/editor/range.js'].branchData['1745'][1] = new BranchData();
}
_$jscoverage['/editor/range.js'].branchData['1745'][1].init(764, 4, 'last');
function visit622_1745_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1745'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1735'][1].init(232, 50, 'self.checkStartOfBlock() && self.checkEndOfBlock()');
function visit621_1735_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1735'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1731'][2].init(132, 32, 'tmpDtd && tmpDtd[elementName]');
function visit620_1731_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1731'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1731'][1].init(89, 77, '(tmpDtd = dtd[current.nodeName()]) && !(tmpDtd && tmpDtd[elementName])');
function visit619_1731_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1731'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1729'][1].init(261, 7, 'isBlock');
function visit618_1729_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1712'][1].init(115, 42, 'domNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit617_1712_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1712'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1692'][2].init(481, 43, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit616_1692_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1692'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1692'][1].init(481, 66, 'el[0].nodeType == Dom.NodeType.ELEMENT_NODE && el._4e_isEditable()');
function visit615_1692_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1692'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1683'][1].init(85, 40, 'el[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit614_1683_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1683'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1672'][1].init(278, 19, '!childOnly && !next');
function visit613_1672_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1667'][2].init(48, 45, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit612_1667_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1667'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1667'][1].init(48, 90, 'node[0].nodeType == Dom.NodeType.ELEMENT_NODE && node._4e_isEditable()');
function visit611_1667_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1667'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1637'][1].init(46, 15, '!self.collapsed');
function visit610_1637_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1637'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1615'][1].init(296, 60, '!UA[\'ie\'] && !S.inArray(startBlock.nodeName(), [\'ul\', \'ol\'])');
function visit609_1615_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1615'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1605'][1].init(265, 14, 'isStartOfBlock');
function visit608_1605_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1605'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1600'][1].init(21, 12, 'isEndOfBlock');
function visit607_1600_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1599'][2].init(1256, 28, 'startBlock[0] == endBlock[0]');
function visit606_1599_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1599'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1599'][1].init(1242, 42, 'startBlock && startBlock[0] == endBlock[0]');
function visit605_1599_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1599'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1594'][1].init(91, 34, 'endBlock && self.checkEndOfBlock()');
function visit604_1594_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1593'][1].init(1038, 38, 'startBlock && self.checkStartOfBlock()');
function visit603_1593_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1593'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1587'][1].init(212, 9, '!endBlock');
function visit602_1587_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1587'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1582'][1].init(21, 11, '!startBlock');
function visit601_1582_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1581'][1].init(626, 16, 'blockTag != \'br\'');
function visit600_1581_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1581'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1576'][1].init(482, 38, '!startBlockLimit.equals(endBlockLimit)');
function visit599_1576_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1576'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1552'][1].init(355, 9, '!UA[\'ie\']');
function visit598_1552_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1552'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1530'][1].init(2330, 56, 'startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING');
function visit597_1530_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1530'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1516'][1].init(305, 15, 'childCount == 0');
function visit596_1516_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1516'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1512'][1].init(80, 22, 'childCount > endOffset');
function visit595_1512_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1510'][1].init(1364, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit594_1510_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1510'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1506'][1].init(599, 43, 'startNode._4e_nextSourceNode() || startNode');
function visit593_1506_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1506'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1490'][1].init(211, 15, 'childCount == 0');
function visit592_1490_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1490'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1488'][1].init(82, 24, 'childCount > startOffset');
function visit591_1488_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1488'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1486'][1].init(261, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit590_1486_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1470'][1].init(7, 22, 'checkType == KER.START');
function visit589_1470_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1470'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1463'][1].init(218, 22, 'checkType == KER.START');
function visit588_1463_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1463'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1461'][1].init(12, 22, 'checkType == KER.START');
function visit587_1461_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1461'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1445'][1].init(1112, 29, 'path.block || path.blockLimit');
function visit586_1445_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1445'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1428'][1].init(109, 16, 'textAfter.length');
function visit585_1428_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1428'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1426'][1].init(265, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit584_1426_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1426'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1408'][1].init(1170, 29, 'path.block || path.blockLimit');
function visit583_1408_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1391'][1].init(117, 17, 'textBefore.length');
function visit582_1391_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1389'][2].init(309, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit581_1389_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1389'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1389'][1].init(294, 67, 'startOffset && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit580_1389_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1371'][1].init(4449, 6, 'tailBr');
function visit579_1371_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1366'][1].init(73, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit578_1366_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1365'][2].init(-1, 38, '!enlargeable && self.checkEndOfBlock()');
function visit577_1365_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1365'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1365'][1].init(-1, 124, '!enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit576_1365_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1359'][1].init(3727, 21, 'blockBoundary || body');
function visit575_1359_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1351'][1].init(3302, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit574_1351_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1340'][1].init(79, 50, 'enlargeable && blockBoundary.contains(enlargeable)');
function visit573_1340_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1339'][2].init(454, 40, '!enlargeable && self.checkStartOfBlock()');
function visit572_1339_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1339'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1339'][1].init(454, 130, '!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable)');
function visit571_1339_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1331'][2].init(88, 32, 'blockBoundary.nodeName() != \'br\'');
function visit570_1331_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1331'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1331'][1].init(-1, 587, 'blockBoundary.nodeName() != \'br\' && (!enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable))');
function visit569_1331_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1325'][1].init(1902, 21, 'blockBoundary || body');
function visit568_1325_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1325'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1314'][2].init(114, 26, 'Dom.nodeName(node) == \'br\'');
function visit567_1314_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1314'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1314'][1].init(103, 37, '!retVal && Dom.nodeName(node) == \'br\'');
function visit566_1314_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1306'][1].init(102, 7, '!retVal');
function visit565_1306_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1301'][1].init(55, 38, 'unit == KER.ENLARGE_LIST_ITEM_CONTENTS');
function visit564_1301_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1279'][1].init(418, 18, 'stop[0] && stop[1]');
function visit563_1279_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1269'][1].init(55, 14, 'self.collapsed');
function visit562_1269_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1250'][1].init(960, 47, 'commonReached || enlarge.equals(commonAncestor)');
function visit561_1250_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1250'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1246'][1].init(849, 28, 'enlarge.nodeName() == "body"');
function visit560_1246_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1233'][1].init(67, 14, '!commonReached');
function visit559_1233_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1233'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1231'][1].init(385, 7, 'sibling');
function visit558_1231_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1231'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1223'][1].init(29, 44, 'isWhitespace(sibling) || isBookmark(sibling)');
function visit557_1223_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1215'][1].init(64, 57, 'container[0].childNodes[offset + (left ? -1 : 1)] || null');
function visit556_1215_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1204'][1].init(29, 38, 'offset < container[0].nodeValue.length');
function visit555_1204_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1200'][1].init(68, 6, 'offset');
function visit554_1200_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1198'][1].init(25, 4, 'left');
function visit553_1198_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1197'][1].init(386, 47, 'container[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit552_1197_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1174'][2].init(25, 46, 'ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit551_1174_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1174'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1174'][1].init(-1, 64, 'ignoreTextNode && ancestor[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit550_1174_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1174'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1165'][1].init(69, 38, 'self.startOffset == self.endOffset - 1');
function visit549_1165_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1164'][2].init(58, 46, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit548_1164_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1164'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1164'][1].init(34, 108, 'start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit547_1164_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1163'][1].init(21, 143, 'includeSelf && start[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startOffset == self.endOffset - 1');
function visit546_1163_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1162'][1].init(159, 18, 'start[0] == end[0]');
function visit545_1162_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1142'][1].init(768, 21, 'endNode && endNode[0]');
function visit544_1142_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1121'][1].init(556, 12, 'endContainer');
function visit543_1121_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1121'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1114'][1].init(170, 71, 'bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)');
function visit542_1114_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1110'][1].init(86, 12, 'bookmark.is2');
function visit541_1110_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1096'][1].init(423, 41, 'startContainer[0] == self.endContainer[0]');
function visit540_1096_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1096'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1092'][1].init(116, 49, 'startContainer[0].childNodes[startOffset] || null');
function visit539_1092_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1092'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1066'][1].init(406, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit538_1066_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1066'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1060'][1].init(128, 10, '!endOffset');
function visit537_1060_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1060'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1057'][2].init(2073, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit536_1057_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1057'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1057'][1].init(46, 69, 'endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit535_1057_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1057'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1056'][2].init(2008, 22, 'ignoreEnd || collapsed');
function visit534_1056_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1056'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1056'][1].init(2005, 116, '!(ignoreEnd || collapsed) && endContainer[0] && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit533_1056_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1056'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1047'][1].init(1445, 9, 'collapsed');
function visit532_1047_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1040'][1].init(474, 45, 'Dom.equals(startContainer, self.endContainer)');
function visit531_1040_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1040'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1038'][1].init(306, 50, 'Dom.equals(self.startContainer, self.endContainer)');
function visit530_1038_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1038'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1025'][1].init(416, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit529_1025_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1025'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1019'][1].init(128, 12, '!startOffset');
function visit528_1019_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1019'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1016'][1].init(36, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit527_1016_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1016'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1015'][1].init(46, 89, 'startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit526_1015_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1015'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1014'][2].init(195, 25, '!ignoreStart || collapsed');
function visit525_1014_2(result) {
  _$jscoverage['/editor/range.js'].branchData['1014'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['1014'][1].init(195, 136, '(!ignoreStart || collapsed) && startContainer[0] && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit524_1014_1(result) {
  _$jscoverage['/editor/range.js'].branchData['1014'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['977'][1].init(1218, 7, 'endNode');
function visit523_977_1(result) {
  _$jscoverage['/editor/range.js'].branchData['977'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['963'][1].init(107, 12, 'serializable');
function visit522_963_1(result) {
  _$jscoverage['/editor/range.js'].branchData['963'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['959'][1].init(711, 10, '!collapsed');
function visit521_959_1(result) {
  _$jscoverage['/editor/range.js'].branchData['959'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['953'][1].init(507, 12, 'serializable');
function visit520_953_1(result) {
  _$jscoverage['/editor/range.js'].branchData['953'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['918'][1].init(71, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit519_918_1(result) {
  _$jscoverage['/editor/range.js'].branchData['918'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['917'][1].init(79, 118, '(previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit518_917_1(result) {
  _$jscoverage['/editor/range.js'].branchData['917'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['916'][2].init(841, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit517_916_2(result) {
  _$jscoverage['/editor/range.js'].branchData['916'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['916'][1].init(841, 198, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = endContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit516_916_1(result) {
  _$jscoverage['/editor/range.js'].branchData['916'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['909'][1].init(44, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit515_909_1(result) {
  _$jscoverage['/editor/range.js'].branchData['909'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][4].init(325, 13, 'endOffset > 0');
function visit514_908_4(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][3].init(46, 104, 'endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit513_908_3(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][2].init(277, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit512_908_2(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['908'][1].init(39, 151, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit511_908_1(result) {
  _$jscoverage['/editor/range.js'].branchData['908'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['907'][2].init(234, 191, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit510_907_2(result) {
  _$jscoverage['/editor/range.js'].branchData['907'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['907'][1].init(225, 200, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && endOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit509_907_1(result) {
  _$jscoverage['/editor/range.js'].branchData['907'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['902'][1].init(145, 53, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit508_902_1(result) {
  _$jscoverage['/editor/range.js'].branchData['902'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['899'][1].init(1180, 15, '!self.collapsed');
function visit507_899_1(result) {
  _$jscoverage['/editor/range.js'].branchData['899'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['893'][1].init(69, 46, 'previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit506_893_1(result) {
  _$jscoverage['/editor/range.js'].branchData['893'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['892'][1].init(77, 116, '(previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit505_892_1(result) {
  _$jscoverage['/editor/range.js'].branchData['892'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['891'][2].init(772, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit504_891_2(result) {
  _$jscoverage['/editor/range.js'].branchData['891'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['891'][1].init(772, 194, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE && (previous = startContainer.prev(undefined, 1)) && previous[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit503_891_1(result) {
  _$jscoverage['/editor/range.js'].branchData['891'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['883'][3].init(18, 59, 'child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit502_883_3(result) {
  _$jscoverage['/editor/range.js'].branchData['883'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['883'][2].init(309, 15, 'startOffset > 0');
function visit501_883_2(result) {
  _$jscoverage['/editor/range.js'].branchData['883'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['883'][1].init(70, 78, 'startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit500_883_1(result) {
  _$jscoverage['/editor/range.js'].branchData['883'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['882'][4].init(234, 43, 'child[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit499_882_4(result) {
  _$jscoverage['/editor/range.js'].branchData['882'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['882'][3].init(234, 149, 'child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit498_882_3(result) {
  _$jscoverage['/editor/range.js'].branchData['882'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['882'][2].init(222, 161, 'child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit497_882_2(result) {
  _$jscoverage['/editor/range.js'].branchData['882'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['882'][1].init(213, 170, 'child && child[0] && child[0].nodeType == Dom.NodeType.TEXT_NODE && startOffset > 0 && child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit496_882_1(result) {
  _$jscoverage['/editor/range.js'].branchData['882'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['877'][1].init(133, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit495_877_1(result) {
  _$jscoverage['/editor/range.js'].branchData['877'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['874'][1].init(621, 10, 'normalized');
function visit494_874_1(result) {
  _$jscoverage['/editor/range.js'].branchData['874'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['867'][1].init(453, 32, '!startContainer || !endContainer');
function visit493_867_1(result) {
  _$jscoverage['/editor/range.js'].branchData['867'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['847'][1].init(3628, 20, 'moveStart || moveEnd');
function visit492_847_1(result) {
  _$jscoverage['/editor/range.js'].branchData['847'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['842'][1].init(163, 7, 'textEnd');
function visit491_842_1(result) {
  _$jscoverage['/editor/range.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['841'][1].init(78, 26, 'mode == KER.SHRINK_ELEMENT');
function visit490_841_1(result) {
  _$jscoverage['/editor/range.js'].branchData['841'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['839'][1].init(3265, 7, 'moveEnd');
function visit489_839_1(result) {
  _$jscoverage['/editor/range.js'].branchData['839'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['834'][1].init(124, 9, 'textStart');
function visit488_834_1(result) {
  _$jscoverage['/editor/range.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['833'][1].init(44, 26, 'mode == KER.SHRINK_ELEMENT');
function visit487_833_1(result) {
  _$jscoverage['/editor/range.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['832'][1].init(2932, 9, 'moveStart');
function visit486_832_1(result) {
  _$jscoverage['/editor/range.js'].branchData['832'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['824'][2].init(553, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit485_824_2(result) {
  _$jscoverage['/editor/range.js'].branchData['824'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['824'][1].init(539, 56, '!movingOut && node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit484_824_1(result) {
  _$jscoverage['/editor/range.js'].branchData['824'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['821'][2].init(417, 22, 'node == currentElement');
function visit483_821_2(result) {
  _$jscoverage['/editor/range.js'].branchData['821'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['821'][1].init(404, 35, 'movingOut && node == currentElement');
function visit482_821_1(result) {
  _$jscoverage['/editor/range.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['817'][1].init(57, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit481_817_1(result) {
  _$jscoverage['/editor/range.js'].branchData['817'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['816'][2].init(127, 26, 'mode == KER.SHRINK_ELEMENT');
function visit480_816_2(result) {
  _$jscoverage['/editor/range.js'].branchData['816'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['816'][1].init(127, 97, 'mode == KER.SHRINK_ELEMENT && node.nodeType == Dom.NodeType.TEXT_NODE');
function visit479_816_1(result) {
  _$jscoverage['/editor/range.js'].branchData['816'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['810'][2].init(51, 26, 'mode == KER.SHRINK_ELEMENT');
function visit478_810_2(result) {
  _$jscoverage['/editor/range.js'].branchData['810'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['810'][1].init(32, 128, 'node.nodeType == (mode == KER.SHRINK_ELEMENT ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE)');
function visit477_810_1(result) {
  _$jscoverage['/editor/range.js'].branchData['810'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['805'][1].init(1771, 20, 'moveStart || moveEnd');
function visit476_805_1(result) {
  _$jscoverage['/editor/range.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['797'][1].init(135, 45, 'endOffset >= endContainer[0].nodeValue.length');
function visit475_797_1(result) {
  _$jscoverage['/editor/range.js'].branchData['797'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['795'][1].init(25, 10, '!endOffset');
function visit474_795_1(result) {
  _$jscoverage['/editor/range.js'].branchData['795'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['794'][1].init(35, 50, 'endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit473_794_1(result) {
  _$jscoverage['/editor/range.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['793'][1].init(1242, 86, 'endContainer && endContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit472_793_1(result) {
  _$jscoverage['/editor/range.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['783'][1].init(141, 49, 'startOffset >= startContainer[0].nodeValue.length');
function visit471_783_1(result) {
  _$jscoverage['/editor/range.js'].branchData['783'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['781'][1].init(25, 12, '!startOffset');
function visit470_781_1(result) {
  _$jscoverage['/editor/range.js'].branchData['781'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['780'][1].init(37, 52, 'startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit469_780_1(result) {
  _$jscoverage['/editor/range.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['779'][1].init(531, 90, 'startContainer && startContainer[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit468_779_1(result) {
  _$jscoverage['/editor/range.js'].branchData['779'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['766'][1].init(24, 23, 'mode || KER.SHRINK_TEXT');
function visit467_766_1(result) {
  _$jscoverage['/editor/range.js'].branchData['766'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['765'][1].init(97, 15, '!self.collapsed');
function visit466_765_1(result) {
  _$jscoverage['/editor/range.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['754'][1].init(856, 24, 'node && node.equals(pre)');
function visit465_754_1(result) {
  _$jscoverage['/editor/range.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['743'][1].init(24, 46, 'isNotWhitespaces(node) && isNotBookmarks(node)');
function visit464_743_1(result) {
  _$jscoverage['/editor/range.js'].branchData['743'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['735'][1].init(86, 65, 'walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit463_735_1(result) {
  _$jscoverage['/editor/range.js'].branchData['735'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['734'][2].init(188, 67, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit462_734_2(result) {
  _$jscoverage['/editor/range.js'].branchData['734'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['734'][1].init(188, 152, 'walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE || walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit461_734_1(result) {
  _$jscoverage['/editor/range.js'].branchData['734'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['693'][1].init(46, 7, 'toStart');
function visit460_693_1(result) {
  _$jscoverage['/editor/range.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['648'][1].init(54, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit459_648_1(result) {
  _$jscoverage['/editor/range.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['617'][1].init(54, 42, 'node[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit458_617_1(result) {
  _$jscoverage['/editor/range.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['596'][1].init(684, 20, '!self.startContainer');
function visit457_596_1(result) {
  _$jscoverage['/editor/range.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['588'][2].init(391, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit456_588_2(result) {
  _$jscoverage['/editor/range.js'].branchData['588'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['588'][1].init(391, 79, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[endNode.nodeName()]');
function visit455_588_1(result) {
  _$jscoverage['/editor/range.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['565'][1].init(701, 18, '!self.endContainer');
function visit454_565_1(result) {
  _$jscoverage['/editor/range.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['557'][2].init(392, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit453_557_2(result) {
  _$jscoverage['/editor/range.js'].branchData['557'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['557'][1].init(392, 83, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && EMPTY[startNode.nodeName()]');
function visit452_557_1(result) {
  _$jscoverage['/editor/range.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['536'][2].init(361, 28, 'endNode.nodeName() == \'span\'');
function visit451_536_2(result) {
  _$jscoverage['/editor/range.js'].branchData['536'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['536'][1].init(26, 76, 'endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit450_536_1(result) {
  _$jscoverage['/editor/range.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['535'][1].init(332, 103, 'endNode && endNode.nodeName() == \'span\' && endNode.attr(\'_ke_bookmark\')');
function visit449_535_1(result) {
  _$jscoverage['/editor/range.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['531'][2].init(172, 30, 'startNode.nodeName() == \'span\'');
function visit448_531_2(result) {
  _$jscoverage['/editor/range.js'].branchData['531'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['531'][1].init(28, 80, 'startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit447_531_1(result) {
  _$jscoverage['/editor/range.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['530'][1].init(141, 109, 'startNode && startNode.nodeName() == \'span\' && startNode.attr(\'_ke_bookmark\')');
function visit446_530_1(result) {
  _$jscoverage['/editor/range.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['487'][1].init(110, 39, 'offset >= container[0].nodeValue.length');
function visit445_487_1(result) {
  _$jscoverage['/editor/range.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['485'][1].init(21, 7, '!offset');
function visit444_485_1(result) {
  _$jscoverage['/editor/range.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['484'][1].init(527, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit443_484_1(result) {
  _$jscoverage['/editor/range.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['476'][1].init(112, 39, 'offset >= container[0].nodeValue.length');
function visit442_476_1(result) {
  _$jscoverage['/editor/range.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['474'][1].init(21, 7, '!offset');
function visit441_474_1(result) {
  _$jscoverage['/editor/range.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['473'][1].init(139, 50, 'container[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit440_473_1(result) {
  _$jscoverage['/editor/range.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['458'][1].init(277, 40, 'endContainer.id || endContainer.nodeName');
function visit439_458_1(result) {
  _$jscoverage['/editor/range.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['457'][1].init(184, 44, 'startContainer.id || startContainer.nodeName');
function visit438_457_1(result) {
  _$jscoverage['/editor/range.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['428'][1].init(65, 34, 'self.startOffset == self.endOffset');
function visit437_428_1(result) {
  _$jscoverage['/editor/range.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['427'][2].init(109, 46, 'self.startContainer[0] == self.endContainer[0]');
function visit436_427_2(result) {
  _$jscoverage['/editor/range.js'].branchData['427'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['427'][1].init(36, 100, 'self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit435_427_1(result) {
  _$jscoverage['/editor/range.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['426'][1].init(38, 137, 'self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit434_426_1(result) {
  _$jscoverage['/editor/range.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['425'][1].init(-1, 176, 'self.startContainer && self.endContainer && self.startContainer[0] == self.endContainer[0] && self.startOffset == self.endOffset');
function visit433_425_1(result) {
  _$jscoverage['/editor/range.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['416'][1].init(10786, 13, 'removeEndNode');
function visit432_416_1(result) {
  _$jscoverage['/editor/range.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['412'][1].init(10712, 15, 'removeStartNode');
function visit431_412_1(result) {
  _$jscoverage['/editor/range.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['397'][1].init(201, 121, 'removeStartNode && (topStart._4e_sameLevel(startNode))');
function visit430_397_1(result) {
  _$jscoverage['/editor/range.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['389'][1].init(-1, 96, '!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)');
function visit429_389_1(result) {
  _$jscoverage['/editor/range.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['387'][2].init(272, 178, 'topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit428_387_2(result) {
  _$jscoverage['/editor/range.js'].branchData['387'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['387'][1].init(20, 190, 'topStart && topEnd && (!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd))');
function visit427_387_1(result) {
  _$jscoverage['/editor/range.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['374'][1].init(50, 62, 'endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit426_374_1(result) {
  _$jscoverage['/editor/range.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['373'][1].init(69, 113, 'endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit425_373_1(result) {
  _$jscoverage['/editor/range.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['372'][2].init(67, 46, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit424_372_2(result) {
  _$jscoverage['/editor/range.js'].branchData['372'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['372'][1].init(67, 183, 'endTextNode.nodeType == Dom.NodeType.TEXT_NODE && endTextNode.previousSibling && endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit423_372_1(result) {
  _$jscoverage['/editor/range.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['370'][1].init(649, 11, 'hasSplitEnd');
function visit422_370_1(result) {
  _$jscoverage['/editor/range.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['364'][1].init(113, 60, 'startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit421_364_1(result) {
  _$jscoverage['/editor/range.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['362'][1].init(71, 174, 'startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit420_362_1(result) {
  _$jscoverage['/editor/range.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['361'][2].init(71, 48, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE');
function visit419_361_2(result) {
  _$jscoverage['/editor/range.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['361'][1].init(71, 246, 'startTextNode.nodeType == Dom.NodeType.TEXT_NODE && startTextNode.nextSibling && startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE');
function visit418_361_1(result) {
  _$jscoverage['/editor/range.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['359'][1].init(104, 13, 'hasSplitStart');
function visit417_359_1(result) {
  _$jscoverage['/editor/range.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['355'][1].init(8526, 11, 'action == 2');
function visit416_355_1(result) {
  _$jscoverage['/editor/range.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['350'][1].init(1653, 10, 'levelClone');
function visit415_350_1(result) {
  _$jscoverage['/editor/range.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['340'][1].init(238, 11, 'action == 1');
function visit414_340_1(result) {
  _$jscoverage['/editor/range.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['332'][1].init(189, 11, 'action == 2');
function visit413_332_1(result) {
  _$jscoverage['/editor/range.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['322'][1].init(20, 138, '!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k])');
function visit412_322_1(result) {
  _$jscoverage['/editor/range.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['312'][2].init(128, 10, 'action > 0');
function visit411_312_2(result) {
  _$jscoverage['/editor/range.js'].branchData['312'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['312'][1].init(128, 45, 'action > 0 && !levelStartNode.equals(endNode)');
function visit410_312_1(result) {
  _$jscoverage['/editor/range.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['308'][1].init(6736, 21, 'k < endParents.length');
function visit409_308_1(result) {
  _$jscoverage['/editor/range.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['299'][1].init(2179, 10, 'levelClone');
function visit408_299_1(result) {
  _$jscoverage['/editor/range.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['290'][1].init(643, 11, 'action == 1');
function visit407_290_1(result) {
  _$jscoverage['/editor/range.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['280'][1].init(155, 48, 'UN_REMOVABLE[currentNode.nodeName.toLowerCase()]');
function visit406_280_1(result) {
  _$jscoverage['/editor/range.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['273'][1].init(435, 11, 'action == 2');
function visit405_273_1(result) {
  _$jscoverage['/editor/range.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['265'][3].init(192, 25, 'domEndNode == currentNode');
function visit404_265_3(result) {
  _$jscoverage['/editor/range.js'].branchData['265'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['265'][2].init(160, 28, 'domEndParentJ == currentNode');
function visit403_265_2(result) {
  _$jscoverage['/editor/range.js'].branchData['265'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['265'][1].init(160, 57, 'domEndParentJ == currentNode || domEndNode == currentNode');
function visit402_265_1(result) {
  _$jscoverage['/editor/range.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['260'][1].init(106, 27, 'endParentJ && endParentJ[0]');
function visit401_260_1(result) {
  _$jscoverage['/editor/range.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['248'][2].init(128, 10, 'action > 0');
function visit400_248_2(result) {
  _$jscoverage['/editor/range.js'].branchData['248'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['248'][1].init(128, 47, 'action > 0 && !levelStartNode.equals(startNode)');
function visit399_248_1(result) {
  _$jscoverage['/editor/range.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['244'][1].init(4306, 23, 'j < startParents.length');
function visit398_244_1(result) {
  _$jscoverage['/editor/range.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['231'][1].init(340, 24, '!topStart.equals(topEnd)');
function visit397_231_1(result) {
  _$jscoverage['/editor/range.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['223'][1].init(3601, 23, 'i < startParents.length');
function visit396_223_1(result) {
  _$jscoverage['/editor/range.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['195'][1].init(608, 45, 'startOffset >= startNode[0].childNodes.length');
function visit395_195_1(result) {
  _$jscoverage['/editor/range.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['188'][1].init(319, 12, '!startOffset');
function visit394_188_1(result) {
  _$jscoverage['/editor/range.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['179'][1].init(1936, 47, 'startNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit393_179_1(result) {
  _$jscoverage['/editor/range.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['163'][1].init(82, 41, 'endOffset >= endNode[0].childNodes.length');
function visit392_163_1(result) {
  _$jscoverage['/editor/range.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['161'][1].init(150, 32, 'endNode[0].childNodes.length > 0');
function visit391_161_1(result) {
  _$jscoverage['/editor/range.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['155'][1].init(874, 45, 'endNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit390_155_1(result) {
  _$jscoverage['/editor/range.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['142'][1].init(478, 14, 'self.collapsed');
function visit389_142_1(result) {
  _$jscoverage['/editor/range.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['138'][1].init(389, 10, 'action > 0');
function visit388_138_1(result) {
  _$jscoverage['/editor/range.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['107'][4].init(179, 16, 'nodeName == \'br\'');
function visit387_107_4(result) {
  _$jscoverage['/editor/range.js'].branchData['107'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['107'][3].init(179, 26, 'nodeName == \'br\' && !hadBr');
function visit386_107_3(result) {
  _$jscoverage['/editor/range.js'].branchData['107'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['107'][2].init(166, 39, '!UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit385_107_2(result) {
  _$jscoverage['/editor/range.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['107'][1].init(154, 51, '!isStart && !UA[\'ie\'] && nodeName == \'br\' && !hadBr');
function visit384_107_1(result) {
  _$jscoverage['/editor/range.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['104'][1].init(194, 35, '!inlineChildReqElements[nodeName]');
function visit383_104_1(result) {
  _$jscoverage['/editor/range.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['100'][1].init(374, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit382_100_1(result) {
  _$jscoverage['/editor/range.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['97'][1].init(98, 29, 'S.trim(node.nodeValue).length');
function visit381_97_1(result) {
  _$jscoverage['/editor/range.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['95'][1].init(125, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit380_95_1(result) {
  _$jscoverage['/editor/range.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['92'][1].init(61, 16, 'isBookmark(node)');
function visit379_92_1(result) {
  _$jscoverage['/editor/range.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['85'][1].init(77, 40, '!isWhitespace(node) && !isBookmark(node)');
function visit378_85_1(result) {
  _$jscoverage['/editor/range.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['80'][2].init(481, 8, 'c2 || c3');
function visit377_80_2(result) {
  _$jscoverage['/editor/range.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['80'][1].init(475, 14, 'c1 || c2 || c3');
function visit376_80_1(result) {
  _$jscoverage['/editor/range.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['77'][2].init(153, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit375_77_2(result) {
  _$jscoverage['/editor/range.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['77'][1].init(153, 66, 'node.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit374_77_1(result) {
  _$jscoverage['/editor/range.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['74'][2].init(150, 39, 'node.nodeType != Dom.NodeType.TEXT_NODE');
function visit373_74_2(result) {
  _$jscoverage['/editor/range.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].branchData['74'][1].init(150, 97, 'node.nodeType != Dom.NodeType.TEXT_NODE && Dom.nodeName(node) in dtd.$removeEmpty');
function visit372_74_1(result) {
  _$jscoverage['/editor/range.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/range.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/range.js'].functionData[0]++;
  _$jscoverage['/editor/range.js'].lineData[11]++;
  require('./dom');
  _$jscoverage['/editor/range.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/range.js'].lineData[13]++;
  var Utils = require('./utils');
  _$jscoverage['/editor/range.js'].lineData[14]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/range.js'].lineData[15]++;
  var Editor = require('./base');
  _$jscoverage['/editor/range.js'].lineData[16]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/range.js'].lineData[21]++;
  Editor.RangeType = {
  POSITION_AFTER_START: 1, 
  POSITION_BEFORE_END: 2, 
  POSITION_BEFORE_START: 3, 
  POSITION_AFTER_END: 4, 
  ENLARGE_ELEMENT: 1, 
  ENLARGE_BLOCK_CONTENTS: 2, 
  ENLARGE_LIST_ITEM_CONTENTS: 3, 
  START: 1, 
  END: 2, 
  SHRINK_ELEMENT: 1, 
  SHRINK_TEXT: 2};
  _$jscoverage['/editor/range.js'].lineData[35]++;
  var TRUE = true, FALSE = false, NULL = null, KER = Editor.RangeType, KEP = Editor.PositionType, Dom = S.DOM, UA = S.UA, dtd = Editor.XHTML_DTD, $ = Node.all, UN_REMOVABLE = {
  'td': 1}, EMPTY = {
  "area": 1, 
  "base": 1, 
  "br": 1, 
  "col": 1, 
  "hr": 1, 
  "img": 1, 
  "input": 1, 
  "link": 1, 
  "meta": 1, 
  "param": 1};
  _$jscoverage['/editor/range.js'].lineData[54]++;
  var isWhitespace = new Walker.whitespaces(), isBookmark = new Walker.bookmark(), isNotWhitespaces = Walker.whitespaces(TRUE), isNotBookmarks = Walker.bookmark(false, true);
  _$jscoverage['/editor/range.js'].lineData[59]++;
  var inlineChildReqElements = {
  "abbr": 1, 
  "acronym": 1, 
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
  _$jscoverage['/editor/range.js'].lineData[70]++;
  function elementBoundaryEval(node) {
    _$jscoverage['/editor/range.js'].functionData[1]++;
    _$jscoverage['/editor/range.js'].lineData[74]++;
    var c1 = visit372_74_1(visit373_74_2(node.nodeType != Dom.NodeType.TEXT_NODE) && Dom.nodeName(node) in dtd.$removeEmpty), c2 = visit374_77_1(visit375_77_2(node.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue)), c3 = !!node.parentNode.getAttribute('_ke_bookmark');
    _$jscoverage['/editor/range.js'].lineData[80]++;
    return visit376_80_1(c1 || visit377_80_2(c2 || c3));
  }
  _$jscoverage['/editor/range.js'].lineData[83]++;
  function nonWhitespaceOrIsBookmark(node) {
    _$jscoverage['/editor/range.js'].functionData[2]++;
    _$jscoverage['/editor/range.js'].lineData[85]++;
    return visit378_85_1(!isWhitespace(node) && !isBookmark(node));
  }
  _$jscoverage['/editor/range.js'].lineData[88]++;
  function getCheckStartEndBlockEvalFunction(isStart) {
    _$jscoverage['/editor/range.js'].functionData[3]++;
    _$jscoverage['/editor/range.js'].lineData[89]++;
    var hadBr = FALSE;
    _$jscoverage['/editor/range.js'].lineData[90]++;
    return function(node) {
  _$jscoverage['/editor/range.js'].functionData[4]++;
  _$jscoverage['/editor/range.js'].lineData[92]++;
  if (visit379_92_1(isBookmark(node))) {
    _$jscoverage['/editor/range.js'].lineData[93]++;
    return TRUE;
  }
  _$jscoverage['/editor/range.js'].lineData[95]++;
  if (visit380_95_1(node.nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[97]++;
    if (visit381_97_1(S.trim(node.nodeValue).length)) {
      _$jscoverage['/editor/range.js'].lineData[98]++;
      return FALSE;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[100]++;
    if (visit382_100_1(node.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[101]++;
      var nodeName = Dom.nodeName(node);
      _$jscoverage['/editor/range.js'].lineData[104]++;
      if (visit383_104_1(!inlineChildReqElements[nodeName])) {
        _$jscoverage['/editor/range.js'].lineData[107]++;
        if (visit384_107_1(!isStart && visit385_107_2(!UA['ie'] && visit386_107_3(visit387_107_4(nodeName == 'br') && !hadBr)))) {
          _$jscoverage['/editor/range.js'].lineData[108]++;
          hadBr = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[110]++;
          return FALSE;
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[114]++;
  return TRUE;
};
  }
  _$jscoverage['/editor/range.js'].lineData[125]++;
  function execContentsAction(self, action) {
    _$jscoverage['/editor/range.js'].functionData[5]++;
    _$jscoverage['/editor/range.js'].lineData[126]++;
    var startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, removeStartNode, hasSplitStart = FALSE, hasSplitEnd = FALSE, t, docFrag = undefined, doc = self.document, removeEndNode;
    _$jscoverage['/editor/range.js'].lineData[138]++;
    if (visit388_138_1(action > 0)) {
      _$jscoverage['/editor/range.js'].lineData[139]++;
      docFrag = doc.createDocumentFragment();
    }
    _$jscoverage['/editor/range.js'].lineData[142]++;
    if (visit389_142_1(self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[143]++;
      return docFrag;
    }
    _$jscoverage['/editor/range.js'].lineData[147]++;
    self.optimizeBookmark();
    _$jscoverage['/editor/range.js'].lineData[155]++;
    if (visit390_155_1(endNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[156]++;
      hasSplitEnd = TRUE;
      _$jscoverage['/editor/range.js'].lineData[157]++;
      endNode = endNode._4e_splitText(endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[161]++;
      if (visit391_161_1(endNode[0].childNodes.length > 0)) {
        _$jscoverage['/editor/range.js'].lineData[163]++;
        if (visit392_163_1(endOffset >= endNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[165]++;
          endNode = new Node(endNode[0].appendChild(doc.createTextNode("")));
          _$jscoverage['/editor/range.js'].lineData[168]++;
          removeEndNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[170]++;
          endNode = new Node(endNode[0].childNodes[endOffset]);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[179]++;
    if (visit393_179_1(startNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[180]++;
      hasSplitStart = TRUE;
      _$jscoverage['/editor/range.js'].lineData[181]++;
      startNode._4e_splitText(startOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[188]++;
      if (visit394_188_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[190]++;
        t = new Node(doc.createTextNode(""));
        _$jscoverage['/editor/range.js'].lineData[191]++;
        startNode.prepend(t);
        _$jscoverage['/editor/range.js'].lineData[192]++;
        startNode = t;
        _$jscoverage['/editor/range.js'].lineData[193]++;
        removeStartNode = TRUE;
      } else {
        _$jscoverage['/editor/range.js'].lineData[195]++;
        if (visit395_195_1(startOffset >= startNode[0].childNodes.length)) {
          _$jscoverage['/editor/range.js'].lineData[197]++;
          startNode = new Node(startNode[0].appendChild(doc.createTextNode('')));
          _$jscoverage['/editor/range.js'].lineData[199]++;
          removeStartNode = TRUE;
        } else {
          _$jscoverage['/editor/range.js'].lineData[201]++;
          startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[208]++;
    var startParents = startNode._4e_parents(), endParents = endNode._4e_parents();
    _$jscoverage['/editor/range.js'].lineData[211]++;
    startParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[6]++;
  _$jscoverage['/editor/range.js'].lineData[212]++;
  startParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[215]++;
    endParents.each(function(n, i) {
  _$jscoverage['/editor/range.js'].functionData[7]++;
  _$jscoverage['/editor/range.js'].lineData[216]++;
  endParents[i] = n;
});
    _$jscoverage['/editor/range.js'].lineData[221]++;
    var i, topStart, topEnd;
    _$jscoverage['/editor/range.js'].lineData[223]++;
    for (i = 0; visit396_223_1(i < startParents.length); i++) {
      _$jscoverage['/editor/range.js'].lineData[224]++;
      topStart = startParents[i];
      _$jscoverage['/editor/range.js'].lineData[225]++;
      topEnd = endParents[i];
      _$jscoverage['/editor/range.js'].lineData[231]++;
      if (visit397_231_1(!topStart.equals(topEnd))) {
        _$jscoverage['/editor/range.js'].lineData[232]++;
        break;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[236]++;
    var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;
    _$jscoverage['/editor/range.js'].lineData[244]++;
    for (var j = i; visit398_244_1(j < startParents.length); j++) {
      _$jscoverage['/editor/range.js'].lineData[245]++;
      levelStartNode = startParents[j];
      _$jscoverage['/editor/range.js'].lineData[248]++;
      if (visit399_248_1(visit400_248_2(action > 0) && !levelStartNode.equals(startNode))) {
        _$jscoverage['/editor/range.js'].lineData[250]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[252]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[256]++;
      currentNode = levelStartNode[0].nextSibling;
      _$jscoverage['/editor/range.js'].lineData[258]++;
      var endParentJ = endParents[j], domEndNode = endNode[0], domEndParentJ = visit401_260_1(endParentJ && endParentJ[0]);
      _$jscoverage['/editor/range.js'].lineData[262]++;
      while (currentNode) {
        _$jscoverage['/editor/range.js'].lineData[265]++;
        if (visit402_265_1(visit403_265_2(domEndParentJ == currentNode) || visit404_265_3(domEndNode == currentNode))) {
          _$jscoverage['/editor/range.js'].lineData[266]++;
          break;
        }
        _$jscoverage['/editor/range.js'].lineData[270]++;
        currentSibling = currentNode.nextSibling;
        _$jscoverage['/editor/range.js'].lineData[273]++;
        if (visit405_273_1(action == 2)) {
          _$jscoverage['/editor/range.js'].lineData[275]++;
          clone.appendChild(currentNode.cloneNode(TRUE));
        } else {
          _$jscoverage['/editor/range.js'].lineData[280]++;
          if (visit406_280_1(UN_REMOVABLE[currentNode.nodeName.toLowerCase()])) {
            _$jscoverage['/editor/range.js'].lineData[281]++;
            var tmp = currentNode.cloneNode(TRUE);
            _$jscoverage['/editor/range.js'].lineData[282]++;
            currentNode.innerHTML = '';
            _$jscoverage['/editor/range.js'].lineData[283]++;
            currentNode = tmp;
          } else {
            _$jscoverage['/editor/range.js'].lineData[286]++;
            Dom._4e_remove(currentNode);
          }
          _$jscoverage['/editor/range.js'].lineData[290]++;
          if (visit407_290_1(action == 1)) {
            _$jscoverage['/editor/range.js'].lineData[292]++;
            clone.appendChild(currentNode);
          }
        }
        _$jscoverage['/editor/range.js'].lineData[296]++;
        currentNode = currentSibling;
      }
      _$jscoverage['/editor/range.js'].lineData[299]++;
      if (visit408_299_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[300]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[304]++;
    clone = docFrag;
    _$jscoverage['/editor/range.js'].lineData[308]++;
    for (var k = i; visit409_308_1(k < endParents.length); k++) {
      _$jscoverage['/editor/range.js'].lineData[309]++;
      levelStartNode = endParents[k];
      _$jscoverage['/editor/range.js'].lineData[312]++;
      if (visit410_312_1(visit411_312_2(action > 0) && !levelStartNode.equals(endNode))) {
        _$jscoverage['/editor/range.js'].lineData[315]++;
        levelClone = clone.appendChild(levelStartNode.clone()[0]);
      } else {
        _$jscoverage['/editor/range.js'].lineData[317]++;
        levelClone = null;
      }
      _$jscoverage['/editor/range.js'].lineData[321]++;
      if (visit412_322_1(!startParents[k] || !levelStartNode._4e_sameLevel(startParents[k]))) {
        _$jscoverage['/editor/range.js'].lineData[326]++;
        currentNode = levelStartNode[0].previousSibling;
        _$jscoverage['/editor/range.js'].lineData[327]++;
        while (currentNode) {
          _$jscoverage['/editor/range.js'].lineData[329]++;
          currentSibling = currentNode.previousSibling;
          _$jscoverage['/editor/range.js'].lineData[332]++;
          if (visit413_332_1(action == 2)) {
            _$jscoverage['/editor/range.js'].lineData[333]++;
            clone.insertBefore(currentNode.cloneNode(TRUE), clone.firstChild);
          } else {
            _$jscoverage['/editor/range.js'].lineData[337]++;
            Dom._4e_remove(currentNode);
            _$jscoverage['/editor/range.js'].lineData[340]++;
            if (visit414_340_1(action == 1)) {
              _$jscoverage['/editor/range.js'].lineData[342]++;
              clone.insertBefore(currentNode, clone.firstChild);
            }
          }
          _$jscoverage['/editor/range.js'].lineData[346]++;
          currentNode = currentSibling;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[350]++;
      if (visit415_350_1(levelClone)) {
        _$jscoverage['/editor/range.js'].lineData[351]++;
        clone = levelClone;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[355]++;
    if (visit416_355_1(action == 2)) {
      _$jscoverage['/editor/range.js'].lineData[359]++;
      if (visit417_359_1(hasSplitStart)) {
        _$jscoverage['/editor/range.js'].lineData[360]++;
        var startTextNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[361]++;
        if (visit418_361_1(visit419_361_2(startTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit420_362_1(startTextNode.nextSibling && visit421_364_1(startTextNode.nextSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[365]++;
          startTextNode.data += startTextNode.nextSibling.data;
          _$jscoverage['/editor/range.js'].lineData[366]++;
          startTextNode.parentNode.removeChild(startTextNode.nextSibling);
        }
      }
      _$jscoverage['/editor/range.js'].lineData[370]++;
      if (visit422_370_1(hasSplitEnd)) {
        _$jscoverage['/editor/range.js'].lineData[371]++;
        var endTextNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[372]++;
        if (visit423_372_1(visit424_372_2(endTextNode.nodeType == Dom.NodeType.TEXT_NODE) && visit425_373_1(endTextNode.previousSibling && visit426_374_1(endTextNode.previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))) {
          _$jscoverage['/editor/range.js'].lineData[375]++;
          endTextNode.previousSibling.data += endTextNode.data;
          _$jscoverage['/editor/range.js'].lineData[376]++;
          endTextNode.parentNode.removeChild(endTextNode);
        }
      }
    } else {
      _$jscoverage['/editor/range.js'].lineData[386]++;
      if (visit427_387_1(topStart && visit428_387_2(topEnd && (visit429_389_1(!startNode._4e_sameLevel(topStart) || !endNode._4e_sameLevel(topEnd)))))) {
        _$jscoverage['/editor/range.js'].lineData[393]++;
        var startIndex = topStart._4e_index();
        _$jscoverage['/editor/range.js'].lineData[397]++;
        if (visit430_397_1(removeStartNode && (topStart._4e_sameLevel(startNode)))) {
          _$jscoverage['/editor/range.js'].lineData[400]++;
          startIndex--;
        }
        _$jscoverage['/editor/range.js'].lineData[403]++;
        self.setStart(topStart.parent(), startIndex + 1);
      }
      _$jscoverage['/editor/range.js'].lineData[407]++;
      self.collapse(TRUE);
    }
    _$jscoverage['/editor/range.js'].lineData[412]++;
    if (visit431_412_1(removeStartNode)) {
      _$jscoverage['/editor/range.js'].lineData[413]++;
      startNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[416]++;
    if (visit432_416_1(removeEndNode)) {
      _$jscoverage['/editor/range.js'].lineData[417]++;
      endNode.remove();
    }
    _$jscoverage['/editor/range.js'].lineData[420]++;
    return docFrag;
  }
  _$jscoverage['/editor/range.js'].lineData[423]++;
  function updateCollapsed(self) {
    _$jscoverage['/editor/range.js'].functionData[8]++;
    _$jscoverage['/editor/range.js'].lineData[424]++;
    self.collapsed = (visit433_425_1(self.startContainer && visit434_426_1(self.endContainer && visit435_427_1(visit436_427_2(self.startContainer[0] == self.endContainer[0]) && visit437_428_1(self.startOffset == self.endOffset)))));
  }
  _$jscoverage['/editor/range.js'].lineData[437]++;
  function KERange(document) {
    _$jscoverage['/editor/range.js'].functionData[9]++;
    _$jscoverage['/editor/range.js'].lineData[438]++;
    var self = this;
    _$jscoverage['/editor/range.js'].lineData[439]++;
    self.startContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[440]++;
    self.startOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[441]++;
    self.endContainer = NULL;
    _$jscoverage['/editor/range.js'].lineData[442]++;
    self.endOffset = NULL;
    _$jscoverage['/editor/range.js'].lineData[443]++;
    self.collapsed = TRUE;
    _$jscoverage['/editor/range.js'].lineData[444]++;
    self.document = document;
  }
  _$jscoverage['/editor/range.js'].lineData[447]++;
  S.augment(KERange, {
  toString: function() {
  _$jscoverage['/editor/range.js'].functionData[10]++;
  _$jscoverage['/editor/range.js'].lineData[453]++;
  var s = [], self = this, startContainer = self.startContainer[0], endContainer = self.endContainer[0];
  _$jscoverage['/editor/range.js'].lineData[457]++;
  s.push((visit438_457_1(startContainer.id || startContainer.nodeName)) + ":" + self.startOffset);
  _$jscoverage['/editor/range.js'].lineData[458]++;
  s.push((visit439_458_1(endContainer.id || endContainer.nodeName)) + ":" + self.endOffset);
  _$jscoverage['/editor/range.js'].lineData[459]++;
  return s.join("<br/>");
}, 
  optimize: function() {
  _$jscoverage['/editor/range.js'].functionData[11]++;
  _$jscoverage['/editor/range.js'].lineData[469]++;
  var self = this, container = self.startContainer, offset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[473]++;
  if (visit440_473_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[474]++;
    if (visit441_474_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[475]++;
      self.setStartBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[476]++;
      if (visit442_476_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[477]++;
        self.setStartAfter(container);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[481]++;
  container = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[482]++;
  offset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[484]++;
  if (visit443_484_1(container[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[485]++;
    if (visit444_485_1(!offset)) {
      _$jscoverage['/editor/range.js'].lineData[486]++;
      self.setEndBefore(container);
    } else {
      _$jscoverage['/editor/range.js'].lineData[487]++;
      if (visit445_487_1(offset >= container[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[488]++;
        self.setEndAfter(container);
      }
    }
  }
}, 
  setStartAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[12]++;
  _$jscoverage['/editor/range.js'].lineData[498]++;
  this.setStart(node.parent(), node._4e_index() + 1);
}, 
  setStartBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[13]++;
  _$jscoverage['/editor/range.js'].lineData[505]++;
  this.setStart(node.parent(), node._4e_index());
}, 
  setEndAfter: function(node) {
  _$jscoverage['/editor/range.js'].functionData[14]++;
  _$jscoverage['/editor/range.js'].lineData[512]++;
  this.setEnd(node.parent(), node._4e_index() + 1);
}, 
  setEndBefore: function(node) {
  _$jscoverage['/editor/range.js'].functionData[15]++;
  _$jscoverage['/editor/range.js'].lineData[519]++;
  this.setEnd(node.parent(), node._4e_index());
}, 
  optimizeBookmark: function() {
  _$jscoverage['/editor/range.js'].functionData[16]++;
  _$jscoverage['/editor/range.js'].lineData[526]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[530]++;
  if (visit446_530_1(startNode && visit447_531_1(visit448_531_2(startNode.nodeName() == 'span') && startNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[533]++;
    self.setStartBefore(startNode);
  }
  _$jscoverage['/editor/range.js'].lineData[535]++;
  if (visit449_535_1(endNode && visit450_536_1(visit451_536_2(endNode.nodeName() == 'span') && endNode.attr('_ke_bookmark')))) {
    _$jscoverage['/editor/range.js'].lineData[538]++;
    self.setEndAfter(endNode);
  }
}, 
  setStart: function(startNode, startOffset) {
  _$jscoverage['/editor/range.js'].functionData[17]++;
  _$jscoverage['/editor/range.js'].lineData[556]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[557]++;
  if (visit452_557_1(visit453_557_2(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[startNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[558]++;
    startNode = startNode.parent();
    _$jscoverage['/editor/range.js'].lineData[559]++;
    startOffset = startNode._4e_index();
  }
  _$jscoverage['/editor/range.js'].lineData[562]++;
  self.startContainer = startNode;
  _$jscoverage['/editor/range.js'].lineData[563]++;
  self.startOffset = startOffset;
  _$jscoverage['/editor/range.js'].lineData[565]++;
  if (visit454_565_1(!self.endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[566]++;
    self.endContainer = startNode;
    _$jscoverage['/editor/range.js'].lineData[567]++;
    self.endOffset = startOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[570]++;
  updateCollapsed(self);
}, 
  setEnd: function(endNode, endOffset) {
  _$jscoverage['/editor/range.js'].functionData[18]++;
  _$jscoverage['/editor/range.js'].lineData[587]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[588]++;
  if (visit455_588_1(visit456_588_2(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && EMPTY[endNode.nodeName()])) {
    _$jscoverage['/editor/range.js'].lineData[589]++;
    endNode = endNode.parent();
    _$jscoverage['/editor/range.js'].lineData[590]++;
    endOffset = endNode._4e_index() + 1;
  }
  _$jscoverage['/editor/range.js'].lineData[593]++;
  self.endContainer = endNode;
  _$jscoverage['/editor/range.js'].lineData[594]++;
  self.endOffset = endOffset;
  _$jscoverage['/editor/range.js'].lineData[596]++;
  if (visit457_596_1(!self.startContainer)) {
    _$jscoverage['/editor/range.js'].lineData[597]++;
    self.startContainer = endNode;
    _$jscoverage['/editor/range.js'].lineData[598]++;
    self.startOffset = endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[601]++;
  updateCollapsed(self);
}, 
  setStartAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[19]++;
  _$jscoverage['/editor/range.js'].lineData[610]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[611]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[613]++;
      self.setStart(node, 0);
      _$jscoverage['/editor/range.js'].lineData[614]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[617]++;
      if (visit458_617_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[618]++;
        self.setStart(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[620]++;
        self.setStart(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[622]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[625]++;
      self.setStartBefore(node);
      _$jscoverage['/editor/range.js'].lineData[626]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[629]++;
      self.setStartAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[632]++;
  updateCollapsed(self);
}, 
  setEndAt: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[20]++;
  _$jscoverage['/editor/range.js'].lineData[641]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[642]++;
  switch (position) {
    case KER.POSITION_AFTER_START:
      _$jscoverage['/editor/range.js'].lineData[644]++;
      self.setEnd(node, 0);
      _$jscoverage['/editor/range.js'].lineData[645]++;
      break;
    case KER.POSITION_BEFORE_END:
      _$jscoverage['/editor/range.js'].lineData[648]++;
      if (visit459_648_1(node[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[649]++;
        self.setEnd(node, node[0].nodeValue.length);
      } else {
        _$jscoverage['/editor/range.js'].lineData[651]++;
        self.setEnd(node, node[0].childNodes.length);
      }
      _$jscoverage['/editor/range.js'].lineData[653]++;
      break;
    case KER.POSITION_BEFORE_START:
      _$jscoverage['/editor/range.js'].lineData[656]++;
      self.setEndBefore(node);
      _$jscoverage['/editor/range.js'].lineData[657]++;
      break;
    case KER.POSITION_AFTER_END:
      _$jscoverage['/editor/range.js'].lineData[660]++;
      self.setEndAfter(node);
  }
  _$jscoverage['/editor/range.js'].lineData[663]++;
  updateCollapsed(self);
}, 
  cloneContents: function() {
  _$jscoverage['/editor/range.js'].functionData[21]++;
  _$jscoverage['/editor/range.js'].lineData[670]++;
  return execContentsAction(this, 2);
}, 
  deleteContents: function() {
  _$jscoverage['/editor/range.js'].functionData[22]++;
  _$jscoverage['/editor/range.js'].lineData[677]++;
  return execContentsAction(this, 0);
}, 
  extractContents: function() {
  _$jscoverage['/editor/range.js'].functionData[23]++;
  _$jscoverage['/editor/range.js'].lineData[684]++;
  return execContentsAction(this, 1);
}, 
  collapse: function(toStart) {
  _$jscoverage['/editor/range.js'].functionData[24]++;
  _$jscoverage['/editor/range.js'].lineData[692]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[693]++;
  if (visit460_693_1(toStart)) {
    _$jscoverage['/editor/range.js'].lineData[694]++;
    self.endContainer = self.startContainer;
    _$jscoverage['/editor/range.js'].lineData[695]++;
    self.endOffset = self.startOffset;
  } else {
    _$jscoverage['/editor/range.js'].lineData[697]++;
    self.startContainer = self.endContainer;
    _$jscoverage['/editor/range.js'].lineData[698]++;
    self.startOffset = self.endOffset;
  }
  _$jscoverage['/editor/range.js'].lineData[700]++;
  self.collapsed = TRUE;
}, 
  clone: function() {
  _$jscoverage['/editor/range.js'].functionData[25]++;
  _$jscoverage['/editor/range.js'].lineData[708]++;
  var self = this, clone = new KERange(self.document);
  _$jscoverage['/editor/range.js'].lineData[711]++;
  clone.startContainer = self.startContainer;
  _$jscoverage['/editor/range.js'].lineData[712]++;
  clone.startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[713]++;
  clone.endContainer = self.endContainer;
  _$jscoverage['/editor/range.js'].lineData[714]++;
  clone.endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[715]++;
  clone.collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[717]++;
  return clone;
}, 
  getEnclosedNode: function() {
  _$jscoverage['/editor/range.js'].functionData[26]++;
  _$jscoverage['/editor/range.js'].lineData[729]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[732]++;
  walkerRange.optimize();
  _$jscoverage['/editor/range.js'].lineData[734]++;
  if (visit461_734_1(visit462_734_2(walkerRange.startContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE) || visit463_735_1(walkerRange.endContainer[0].nodeType != Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[736]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[739]++;
  var walker = new Walker(walkerRange), node, pre;
  _$jscoverage['/editor/range.js'].lineData[742]++;
  walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[27]++;
  _$jscoverage['/editor/range.js'].lineData[743]++;
  return visit464_743_1(isNotWhitespaces(node) && isNotBookmarks(node));
};
  _$jscoverage['/editor/range.js'].lineData[750]++;
  node = walker.next();
  _$jscoverage['/editor/range.js'].lineData[751]++;
  walker.reset();
  _$jscoverage['/editor/range.js'].lineData[752]++;
  pre = walker.previous();
  _$jscoverage['/editor/range.js'].lineData[754]++;
  return visit465_754_1(node && node.equals(pre)) ? node : NULL;
}, 
  shrink: function(mode, selectContents) {
  _$jscoverage['/editor/range.js'].functionData[28]++;
  _$jscoverage['/editor/range.js'].lineData[764]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[765]++;
  if (visit466_765_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[766]++;
    mode = visit467_766_1(mode || KER.SHRINK_TEXT);
    _$jscoverage['/editor/range.js'].lineData[768]++;
    var walkerRange = self.clone(), startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, moveStart = TRUE, currentElement, walker, moveEnd = TRUE;
    _$jscoverage['/editor/range.js'].lineData[779]++;
    if (visit468_779_1(startContainer && visit469_780_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[781]++;
      if (visit470_781_1(!startOffset)) {
        _$jscoverage['/editor/range.js'].lineData[782]++;
        walkerRange.setStartBefore(startContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[783]++;
        if (visit471_783_1(startOffset >= startContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[784]++;
          walkerRange.setStartAfter(startContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[788]++;
          walkerRange.setStartBefore(startContainer);
          _$jscoverage['/editor/range.js'].lineData[789]++;
          moveStart = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[793]++;
    if (visit472_793_1(endContainer && visit473_794_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
      _$jscoverage['/editor/range.js'].lineData[795]++;
      if (visit474_795_1(!endOffset)) {
        _$jscoverage['/editor/range.js'].lineData[796]++;
        walkerRange.setEndBefore(endContainer);
      } else {
        _$jscoverage['/editor/range.js'].lineData[797]++;
        if (visit475_797_1(endOffset >= endContainer[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[798]++;
          walkerRange.setEndAfter(endContainer);
        } else {
          _$jscoverage['/editor/range.js'].lineData[800]++;
          walkerRange.setEndAfter(endContainer);
          _$jscoverage['/editor/range.js'].lineData[801]++;
          moveEnd = FALSE;
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[805]++;
    if (visit476_805_1(moveStart || moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[807]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[809]++;
      walker.evaluator = function(node) {
  _$jscoverage['/editor/range.js'].functionData[29]++;
  _$jscoverage['/editor/range.js'].lineData[810]++;
  return visit477_810_1(node.nodeType == (visit478_810_2(mode == KER.SHRINK_ELEMENT) ? Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE));
};
      _$jscoverage['/editor/range.js'].lineData[814]++;
      walker.guard = function(node, movingOut) {
  _$jscoverage['/editor/range.js'].functionData[30]++;
  _$jscoverage['/editor/range.js'].lineData[816]++;
  if (visit479_816_1(visit480_816_2(mode == KER.SHRINK_ELEMENT) && visit481_817_1(node.nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[818]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[821]++;
  if (visit482_821_1(movingOut && visit483_821_2(node == currentElement))) {
    _$jscoverage['/editor/range.js'].lineData[822]++;
    return FALSE;
  }
  _$jscoverage['/editor/range.js'].lineData[824]++;
  if (visit484_824_1(!movingOut && visit485_824_2(node.nodeType == Dom.NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[825]++;
    currentElement = node;
  }
  _$jscoverage['/editor/range.js'].lineData[827]++;
  return TRUE;
};
    }
    _$jscoverage['/editor/range.js'].lineData[832]++;
    if (visit486_832_1(moveStart)) {
      _$jscoverage['/editor/range.js'].lineData[833]++;
      var textStart = walker[visit487_833_1(mode == KER.SHRINK_ELEMENT) ? 'lastForward' : 'next']();
      _$jscoverage['/editor/range.js'].lineData[834]++;
      if (visit488_834_1(textStart)) {
        _$jscoverage['/editor/range.js'].lineData[835]++;
        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[839]++;
    if (visit489_839_1(moveEnd)) {
      _$jscoverage['/editor/range.js'].lineData[840]++;
      walker.reset();
      _$jscoverage['/editor/range.js'].lineData[841]++;
      var textEnd = walker[visit490_841_1(mode == KER.SHRINK_ELEMENT) ? 'lastBackward' : 'previous']();
      _$jscoverage['/editor/range.js'].lineData[842]++;
      if (visit491_842_1(textEnd)) {
        _$jscoverage['/editor/range.js'].lineData[843]++;
        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
      }
    }
    _$jscoverage['/editor/range.js'].lineData[847]++;
    return visit492_847_1(moveStart || moveEnd);
  }
}, 
  createBookmark2: function(normalized) {
  _$jscoverage['/editor/range.js'].functionData[31]++;
  _$jscoverage['/editor/range.js'].lineData[857]++;
  var self = this, startContainer = self.startContainer, endContainer = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, child, previous;
  _$jscoverage['/editor/range.js'].lineData[867]++;
  if (visit493_867_1(!startContainer || !endContainer)) {
    _$jscoverage['/editor/range.js'].lineData[868]++;
    return {
  start: 0, 
  end: 0};
  }
  _$jscoverage['/editor/range.js'].lineData[874]++;
  if (visit494_874_1(normalized)) {
    _$jscoverage['/editor/range.js'].lineData[877]++;
    if (visit495_877_1(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[878]++;
      child = new Node(startContainer[0].childNodes[startOffset]);
      _$jscoverage['/editor/range.js'].lineData[882]++;
      if (visit496_882_1(child && visit497_882_2(child[0] && visit498_882_3(visit499_882_4(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit500_883_1(visit501_883_2(startOffset > 0) && visit502_883_3(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
        _$jscoverage['/editor/range.js'].lineData[884]++;
        startContainer = child;
        _$jscoverage['/editor/range.js'].lineData[885]++;
        startOffset = 0;
      }
    }
    _$jscoverage['/editor/range.js'].lineData[891]++;
    while (visit503_891_1(visit504_891_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit505_892_1((previous = startContainer.prev(undefined, 1)) && visit506_893_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
      _$jscoverage['/editor/range.js'].lineData[894]++;
      startContainer = previous;
      _$jscoverage['/editor/range.js'].lineData[895]++;
      startOffset += previous[0].nodeValue.length;
    }
    _$jscoverage['/editor/range.js'].lineData[899]++;
    if (visit507_899_1(!self.collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[902]++;
      if (visit508_902_1(endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
        _$jscoverage['/editor/range.js'].lineData[903]++;
        child = new Node(endContainer[0].childNodes[endOffset]);
        _$jscoverage['/editor/range.js'].lineData[907]++;
        if (visit509_907_1(child && visit510_907_2(child[0] && visit511_908_1(visit512_908_2(child[0].nodeType == Dom.NodeType.TEXT_NODE) && visit513_908_3(visit514_908_4(endOffset > 0) && visit515_909_1(child[0].previousSibling.nodeType == Dom.NodeType.TEXT_NODE)))))) {
          _$jscoverage['/editor/range.js'].lineData[910]++;
          endContainer = child;
          _$jscoverage['/editor/range.js'].lineData[911]++;
          endOffset = 0;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[916]++;
      while (visit516_916_1(visit517_916_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE) && visit518_917_1((previous = endContainer.prev(undefined, 1)) && visit519_918_1(previous[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
        _$jscoverage['/editor/range.js'].lineData[919]++;
        endContainer = previous;
        _$jscoverage['/editor/range.js'].lineData[920]++;
        endOffset += previous[0].nodeValue.length;
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[925]++;
  return {
  start: startContainer._4e_address(normalized), 
  end: self.collapsed ? NULL : endContainer._4e_address(normalized), 
  startOffset: startOffset, 
  endOffset: endOffset, 
  normalized: normalized, 
  is2: TRUE};
}, 
  createBookmark: function(serializable) {
  _$jscoverage['/editor/range.js'].functionData[32]++;
  _$jscoverage['/editor/range.js'].lineData[939]++;
  var startNode, endNode, baseId, clone, self = this, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[945]++;
  startNode = new Node("<span>", NULL, self.document);
  _$jscoverage['/editor/range.js'].lineData[946]++;
  startNode.attr('_ke_bookmark', 1);
  _$jscoverage['/editor/range.js'].lineData[947]++;
  startNode.css('display', 'none');
  _$jscoverage['/editor/range.js'].lineData[951]++;
  startNode.html('&nbsp;');
  _$jscoverage['/editor/range.js'].lineData[953]++;
  if (visit520_953_1(serializable)) {
    _$jscoverage['/editor/range.js'].lineData[954]++;
    baseId = S.guid('ke_bm_');
    _$jscoverage['/editor/range.js'].lineData[955]++;
    startNode.attr('id', baseId + 'S');
  }
  _$jscoverage['/editor/range.js'].lineData[959]++;
  if (visit521_959_1(!collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[960]++;
    endNode = startNode.clone();
    _$jscoverage['/editor/range.js'].lineData[961]++;
    endNode.html('&nbsp;');
    _$jscoverage['/editor/range.js'].lineData[963]++;
    if (visit522_963_1(serializable)) {
      _$jscoverage['/editor/range.js'].lineData[964]++;
      endNode.attr('id', baseId + 'E');
    }
    _$jscoverage['/editor/range.js'].lineData[967]++;
    clone = self.clone();
    _$jscoverage['/editor/range.js'].lineData[968]++;
    clone.collapse();
    _$jscoverage['/editor/range.js'].lineData[969]++;
    clone.insertNode(endNode);
  }
  _$jscoverage['/editor/range.js'].lineData[972]++;
  clone = self.clone();
  _$jscoverage['/editor/range.js'].lineData[973]++;
  clone.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[974]++;
  clone.insertNode(startNode);
  _$jscoverage['/editor/range.js'].lineData[977]++;
  if (visit523_977_1(endNode)) {
    _$jscoverage['/editor/range.js'].lineData[978]++;
    self.setStartAfter(startNode);
    _$jscoverage['/editor/range.js'].lineData[979]++;
    self.setEndBefore(endNode);
  } else {
    _$jscoverage['/editor/range.js'].lineData[981]++;
    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
  }
  _$jscoverage['/editor/range.js'].lineData[984]++;
  return {
  startNode: serializable ? baseId + 'S' : startNode, 
  endNode: serializable ? baseId + 'E' : endNode, 
  serializable: serializable, 
  collapsed: collapsed};
}, 
  moveToPosition: function(node, position) {
  _$jscoverage['/editor/range.js'].functionData[33]++;
  _$jscoverage['/editor/range.js'].lineData[998]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[999]++;
  self.setStartAt(node, position);
  _$jscoverage['/editor/range.js'].lineData[1000]++;
  self.collapse(TRUE);
}, 
  trim: function(ignoreStart, ignoreEnd) {
  _$jscoverage['/editor/range.js'].functionData[34]++;
  _$jscoverage['/editor/range.js'].lineData[1009]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset, collapsed = self.collapsed;
  _$jscoverage['/editor/range.js'].lineData[1014]++;
  if (visit524_1014_1((visit525_1014_2(!ignoreStart || collapsed)) && visit526_1015_1(startContainer[0] && visit527_1016_1(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1019]++;
    if (visit528_1019_1(!startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1020]++;
      startOffset = startContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1021]++;
      startContainer = startContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1025]++;
      if (visit529_1025_1(startOffset >= startContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1026]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1027]++;
        startContainer = startContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1032]++;
        var nextText = startContainer._4e_splitText(startOffset);
        _$jscoverage['/editor/range.js'].lineData[1034]++;
        startOffset = startContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1035]++;
        startContainer = startContainer.parent();
        _$jscoverage['/editor/range.js'].lineData[1038]++;
        if (visit530_1038_1(Dom.equals(self.startContainer, self.endContainer))) {
          _$jscoverage['/editor/range.js'].lineData[1039]++;
          self.setEnd(nextText, self.endOffset - self.startOffset);
        } else {
          _$jscoverage['/editor/range.js'].lineData[1040]++;
          if (visit531_1040_1(Dom.equals(startContainer, self.endContainer))) {
            _$jscoverage['/editor/range.js'].lineData[1041]++;
            self.endOffset += 1;
          }
        }
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1045]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1047]++;
    if (visit532_1047_1(collapsed)) {
      _$jscoverage['/editor/range.js'].lineData[1048]++;
      self.collapse(TRUE);
      _$jscoverage['/editor/range.js'].lineData[1049]++;
      return;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1053]++;
  var endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1056]++;
  if (visit533_1056_1(!(visit534_1056_2(ignoreEnd || collapsed)) && visit535_1057_1(endContainer[0] && visit536_1057_2(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)))) {
    _$jscoverage['/editor/range.js'].lineData[1060]++;
    if (visit537_1060_1(!endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1061]++;
      endOffset = endContainer._4e_index();
      _$jscoverage['/editor/range.js'].lineData[1062]++;
      endContainer = endContainer.parent();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1066]++;
      if (visit538_1066_1(endOffset >= endContainer[0].nodeValue.length)) {
        _$jscoverage['/editor/range.js'].lineData[1067]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1068]++;
        endContainer = endContainer.parent();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1073]++;
        endContainer._4e_splitText(endOffset);
        _$jscoverage['/editor/range.js'].lineData[1075]++;
        endOffset = endContainer._4e_index() + 1;
        _$jscoverage['/editor/range.js'].lineData[1076]++;
        endContainer = endContainer.parent();
      }
    }
    _$jscoverage['/editor/range.js'].lineData[1079]++;
    self.setEnd(endContainer, endOffset);
  }
}, 
  insertNode: function(node) {
  _$jscoverage['/editor/range.js'].functionData[35]++;
  _$jscoverage['/editor/range.js'].lineData[1087]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1088]++;
  self.optimizeBookmark();
  _$jscoverage['/editor/range.js'].lineData[1089]++;
  self.trim(FALSE, TRUE);
  _$jscoverage['/editor/range.js'].lineData[1090]++;
  var startContainer = self.startContainer, startOffset = self.startOffset, nextNode = visit539_1092_1(startContainer[0].childNodes[startOffset] || null);
  _$jscoverage['/editor/range.js'].lineData[1094]++;
  startContainer[0].insertBefore(node[0], nextNode);
  _$jscoverage['/editor/range.js'].lineData[1096]++;
  if (visit540_1096_1(startContainer[0] == self.endContainer[0])) {
    _$jscoverage['/editor/range.js'].lineData[1097]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/range.js'].lineData[1100]++;
  self.setStartBefore(node);
}, 
  moveToBookmark: function(bookmark) {
  _$jscoverage['/editor/range.js'].functionData[36]++;
  _$jscoverage['/editor/range.js'].lineData[1108]++;
  var self = this, doc = $(self.document);
  _$jscoverage['/editor/range.js'].lineData[1110]++;
  if (visit541_1110_1(bookmark.is2)) {
    _$jscoverage['/editor/range.js'].lineData[1112]++;
    var startContainer = doc._4e_getByAddress(bookmark.start, bookmark.normalized), startOffset = bookmark.startOffset, endContainer = visit542_1114_1(bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized)), endOffset = bookmark.endOffset;
    _$jscoverage['/editor/range.js'].lineData[1118]++;
    self.setStart(startContainer, startOffset);
    _$jscoverage['/editor/range.js'].lineData[1121]++;
    if (visit543_1121_1(endContainer)) {
      _$jscoverage['/editor/range.js'].lineData[1122]++;
      self.setEnd(endContainer, endOffset);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1124]++;
      self.collapse(TRUE);
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1128]++;
    var serializable = bookmark.serializable, startNode = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode, endNode = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/range.js'].lineData[1135]++;
    self.setStartBefore(startNode);
    _$jscoverage['/editor/range.js'].lineData[1138]++;
    startNode._4e_remove();
    _$jscoverage['/editor/range.js'].lineData[1142]++;
    if (visit544_1142_1(endNode && endNode[0])) {
      _$jscoverage['/editor/range.js'].lineData[1143]++;
      self.setEndBefore(endNode);
      _$jscoverage['/editor/range.js'].lineData[1144]++;
      endNode._4e_remove();
    } else {
      _$jscoverage['/editor/range.js'].lineData[1146]++;
      self.collapse(TRUE);
    }
  }
}, 
  getCommonAncestor: function(includeSelf, ignoreTextNode) {
  _$jscoverage['/editor/range.js'].functionData[37]++;
  _$jscoverage['/editor/range.js'].lineData[1157]++;
  var self = this, start = self.startContainer, end = self.endContainer, ancestor;
  _$jscoverage['/editor/range.js'].lineData[1162]++;
  if (visit545_1162_1(start[0] == end[0])) {
    _$jscoverage['/editor/range.js'].lineData[1163]++;
    if (visit546_1163_1(includeSelf && visit547_1164_1(visit548_1164_2(start[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit549_1165_1(self.startOffset == self.endOffset - 1)))) {
      _$jscoverage['/editor/range.js'].lineData[1166]++;
      ancestor = new Node(start[0].childNodes[self.startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1168]++;
      ancestor = start;
    }
  } else {
    _$jscoverage['/editor/range.js'].lineData[1171]++;
    ancestor = start._4e_commonAncestor(end);
  }
  _$jscoverage['/editor/range.js'].lineData[1174]++;
  return visit550_1174_1(ignoreTextNode && visit551_1174_2(ancestor[0].nodeType == Dom.NodeType.TEXT_NODE)) ? ancestor.parent() : ancestor;
}, 
  enlarge: (function() {
  _$jscoverage['/editor/range.js'].functionData[38]++;
  _$jscoverage['/editor/range.js'].lineData[1188]++;
  function enlargeElement(self, left, stop, commonAncestor) {
    _$jscoverage['/editor/range.js'].functionData[39]++;
    _$jscoverage['/editor/range.js'].lineData[1189]++;
    var container = self[left ? 'startContainer' : 'endContainer'], enlarge, sibling, index = left ? 0 : 1, commonReached = 0, direction = left ? "previousSibling" : "nextSibling", offset = self[left ? 'startOffset' : 'endOffset'];
    _$jscoverage['/editor/range.js'].lineData[1197]++;
    if (visit552_1197_1(container[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1198]++;
      if (visit553_1198_1(left)) {
        _$jscoverage['/editor/range.js'].lineData[1200]++;
        if (visit554_1200_1(offset)) {
          _$jscoverage['/editor/range.js'].lineData[1201]++;
          return;
        }
      } else {
        _$jscoverage['/editor/range.js'].lineData[1204]++;
        if (visit555_1204_1(offset < container[0].nodeValue.length)) {
          _$jscoverage['/editor/range.js'].lineData[1205]++;
          return;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1210]++;
      sibling = container[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1212]++;
      enlarge = container[0].parentNode;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1215]++;
      sibling = visit556_1215_1(container[0].childNodes[offset + (left ? -1 : 1)] || null);
      _$jscoverage['/editor/range.js'].lineData[1217]++;
      enlarge = container[0];
    }
    _$jscoverage['/editor/range.js'].lineData[1220]++;
    while (enlarge) {
      _$jscoverage['/editor/range.js'].lineData[1222]++;
      while (sibling) {
        _$jscoverage['/editor/range.js'].lineData[1223]++;
        if (visit557_1223_1(isWhitespace(sibling) || isBookmark(sibling))) {
          _$jscoverage['/editor/range.js'].lineData[1224]++;
          sibling = sibling[direction];
        } else {
          _$jscoverage['/editor/range.js'].lineData[1226]++;
          break;
        }
      }
      _$jscoverage['/editor/range.js'].lineData[1231]++;
      if (visit558_1231_1(sibling)) {
        _$jscoverage['/editor/range.js'].lineData[1233]++;
        if (visit559_1233_1(!commonReached)) {
          _$jscoverage['/editor/range.js'].lineData[1235]++;
          self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
        }
        _$jscoverage['/editor/range.js'].lineData[1237]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1244]++;
      enlarge = $(enlarge);
      _$jscoverage['/editor/range.js'].lineData[1246]++;
      if (visit560_1246_1(enlarge.nodeName() == "body")) {
        _$jscoverage['/editor/range.js'].lineData[1247]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1250]++;
      if (visit561_1250_1(commonReached || enlarge.equals(commonAncestor))) {
        _$jscoverage['/editor/range.js'].lineData[1251]++;
        stop[index] = enlarge;
        _$jscoverage['/editor/range.js'].lineData[1252]++;
        commonReached = 1;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1255]++;
        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
      }
      _$jscoverage['/editor/range.js'].lineData[1258]++;
      sibling = enlarge[0][direction];
      _$jscoverage['/editor/range.js'].lineData[1259]++;
      enlarge = enlarge[0].parentNode;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1264]++;
  return function(unit) {
  _$jscoverage['/editor/range.js'].functionData[40]++;
  _$jscoverage['/editor/range.js'].lineData[1265]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1266]++;
  switch (unit) {
    case KER.ENLARGE_ELEMENT:
      _$jscoverage['/editor/range.js'].lineData[1269]++;
      if (visit562_1269_1(self.collapsed)) {
        _$jscoverage['/editor/range.js'].lineData[1270]++;
        return;
      }
      _$jscoverage['/editor/range.js'].lineData[1273]++;
      var commonAncestor = self.getCommonAncestor(), stop = [];
      _$jscoverage['/editor/range.js'].lineData[1276]++;
      enlargeElement(self, 1, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1277]++;
      enlargeElement(self, 0, stop, commonAncestor);
      _$jscoverage['/editor/range.js'].lineData[1279]++;
      if (visit563_1279_1(stop[0] && stop[1])) {
        _$jscoverage['/editor/range.js'].lineData[1280]++;
        var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
        _$jscoverage['/editor/range.js'].lineData[1281]++;
        self.setStartBefore(commonStop);
        _$jscoverage['/editor/range.js'].lineData[1282]++;
        self.setEndAfter(commonStop);
      }
      _$jscoverage['/editor/range.js'].lineData[1285]++;
      break;
    case KER.ENLARGE_BLOCK_CONTENTS:
    case KER.ENLARGE_LIST_ITEM_CONTENTS:
      _$jscoverage['/editor/range.js'].lineData[1291]++;
      var walkerRange = new KERange(self.document);
      _$jscoverage['/editor/range.js'].lineData[1292]++;
      var body = new Node(self.document.body);
      _$jscoverage['/editor/range.js'].lineData[1294]++;
      walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1295]++;
      walkerRange.setEnd(self.startContainer, self.startOffset);
      _$jscoverage['/editor/range.js'].lineData[1297]++;
      var walker = new Walker(walkerRange), blockBoundary, tailBr, defaultGuard = Walker.blockBoundary((visit564_1301_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? {
  br: 1} : NULL), boundaryGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[41]++;
  _$jscoverage['/editor/range.js'].lineData[1305]++;
  var retVal = defaultGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1306]++;
  if (visit565_1306_1(!retVal)) {
    _$jscoverage['/editor/range.js'].lineData[1307]++;
    blockBoundary = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1309]++;
  return retVal;
}, tailBrGuard = function(node) {
  _$jscoverage['/editor/range.js'].functionData[42]++;
  _$jscoverage['/editor/range.js'].lineData[1313]++;
  var retVal = boundaryGuard(node);
  _$jscoverage['/editor/range.js'].lineData[1314]++;
  if (visit566_1314_1(!retVal && visit567_1314_2(Dom.nodeName(node) == 'br'))) {
    _$jscoverage['/editor/range.js'].lineData[1315]++;
    tailBr = $(node);
  }
  _$jscoverage['/editor/range.js'].lineData[1317]++;
  return retVal;
};
      _$jscoverage['/editor/range.js'].lineData[1320]++;
      walker.guard = boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1322]++;
      enlargeable = walker.lastBackward();
      _$jscoverage['/editor/range.js'].lineData[1325]++;
      blockBoundary = visit568_1325_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1329]++;
      self.setStartAt(blockBoundary, visit569_1331_1(visit570_1331_2(blockBoundary.nodeName() != 'br') && (visit571_1339_1(visit572_1339_2(!enlargeable && self.checkStartOfBlock()) || visit573_1340_1(enlargeable && blockBoundary.contains(enlargeable))))) ? KER.POSITION_AFTER_START : KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1345]++;
      walkerRange = self.clone();
      _$jscoverage['/editor/range.js'].lineData[1346]++;
      walkerRange.collapse();
      _$jscoverage['/editor/range.js'].lineData[1347]++;
      walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/range.js'].lineData[1348]++;
      walker = new Walker(walkerRange);
      _$jscoverage['/editor/range.js'].lineData[1351]++;
      walker.guard = (visit574_1351_1(unit == KER.ENLARGE_LIST_ITEM_CONTENTS)) ? tailBrGuard : boundaryGuard;
      _$jscoverage['/editor/range.js'].lineData[1353]++;
      blockBoundary = NULL;
      _$jscoverage['/editor/range.js'].lineData[1356]++;
      var enlargeable = walker.lastForward();
      _$jscoverage['/editor/range.js'].lineData[1359]++;
      blockBoundary = visit575_1359_1(blockBoundary || body);
      _$jscoverage['/editor/range.js'].lineData[1363]++;
      self.setEndAt(blockBoundary, (visit576_1365_1(visit577_1365_2(!enlargeable && self.checkEndOfBlock()) || visit578_1366_1(enlargeable && blockBoundary.contains(enlargeable)))) ? KER.POSITION_BEFORE_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1371]++;
      if (visit579_1371_1(tailBr)) {
        _$jscoverage['/editor/range.js'].lineData[1372]++;
        self.setEndAfter(tailBr);
      }
  }
};
})(), 
  checkStartOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[43]++;
  _$jscoverage['/editor/range.js'].lineData[1383]++;
  var self = this, startContainer = self.startContainer, startOffset = self.startOffset;
  _$jscoverage['/editor/range.js'].lineData[1389]++;
  if (visit580_1389_1(startOffset && visit581_1389_2(startContainer[0].nodeType == Dom.NodeType.TEXT_NODE))) {
    _$jscoverage['/editor/range.js'].lineData[1390]++;
    var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
    _$jscoverage['/editor/range.js'].lineData[1391]++;
    if (visit582_1391_1(textBefore.length)) {
      _$jscoverage['/editor/range.js'].lineData[1392]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1399]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1403]++;
  var path = new ElementPath(self.startContainer);
  _$jscoverage['/editor/range.js'].lineData[1406]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1407]++;
  walkerRange.collapse(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1408]++;
  walkerRange.setStartAt(visit583_1408_1(path.block || path.blockLimit), KER.POSITION_AFTER_START);
  _$jscoverage['/editor/range.js'].lineData[1410]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1411]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);
  _$jscoverage['/editor/range.js'].lineData[1413]++;
  return walker.checkBackward();
}, 
  checkEndOfBlock: function() {
  _$jscoverage['/editor/range.js'].functionData[44]++;
  _$jscoverage['/editor/range.js'].lineData[1421]++;
  var self = this, endContainer = self.endContainer, endOffset = self.endOffset;
  _$jscoverage['/editor/range.js'].lineData[1426]++;
  if (visit584_1426_1(endContainer[0].nodeType == Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1427]++;
    var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
    _$jscoverage['/editor/range.js'].lineData[1428]++;
    if (visit585_1428_1(textAfter.length)) {
      _$jscoverage['/editor/range.js'].lineData[1429]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1436]++;
  self.trim();
  _$jscoverage['/editor/range.js'].lineData[1440]++;
  var path = new ElementPath(self.endContainer);
  _$jscoverage['/editor/range.js'].lineData[1443]++;
  var walkerRange = self.clone();
  _$jscoverage['/editor/range.js'].lineData[1444]++;
  walkerRange.collapse(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1445]++;
  walkerRange.setEndAt(visit586_1445_1(path.block || path.blockLimit), KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1447]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1448]++;
  walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1450]++;
  return walker.checkForward();
}, 
  checkBoundaryOfElement: function(element, checkType) {
  _$jscoverage['/editor/range.js'].functionData[45]++;
  _$jscoverage['/editor/range.js'].lineData[1459]++;
  var walkerRange = this.clone();
  _$jscoverage['/editor/range.js'].lineData[1463]++;
  walkerRange[visit587_1461_1(checkType == KER.START) ? 'setStartAt' : 'setEndAt'](element, visit588_1463_1(checkType == KER.START) ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1467]++;
  var walker = new Walker(walkerRange);
  _$jscoverage['/editor/range.js'].lineData[1469]++;
  walker.evaluator = elementBoundaryEval;
  _$jscoverage['/editor/range.js'].lineData[1470]++;
  return walker[visit589_1470_1(checkType == KER.START) ? 'checkBackward' : 'checkForward']();
}, 
  getBoundaryNodes: function() {
  _$jscoverage['/editor/range.js'].functionData[46]++;
  _$jscoverage['/editor/range.js'].lineData[1479]++;
  var self = this, startNode = self.startContainer, endNode = self.endContainer, startOffset = self.startOffset, endOffset = self.endOffset, childCount;
  _$jscoverage['/editor/range.js'].lineData[1486]++;
  if (visit590_1486_1(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1487]++;
    childCount = startNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1488]++;
    if (visit591_1488_1(childCount > startOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1489]++;
      startNode = $(startNode[0].childNodes[startOffset]);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1490]++;
      if (visit592_1490_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1492]++;
        startNode = startNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1496]++;
        startNode = startNode[0];
        _$jscoverage['/editor/range.js'].lineData[1497]++;
        while (startNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1498]++;
          startNode = startNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1501]++;
        startNode = $(startNode);
        _$jscoverage['/editor/range.js'].lineData[1506]++;
        startNode = visit593_1506_1(startNode._4e_nextSourceNode() || startNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1510]++;
  if (visit594_1510_1(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/editor/range.js'].lineData[1511]++;
    childCount = endNode[0].childNodes.length;
    _$jscoverage['/editor/range.js'].lineData[1512]++;
    if (visit595_1512_1(childCount > endOffset)) {
      _$jscoverage['/editor/range.js'].lineData[1513]++;
      endNode = $(endNode[0].childNodes[endOffset])._4e_previousSourceNode(TRUE);
    } else {
      _$jscoverage['/editor/range.js'].lineData[1516]++;
      if (visit596_1516_1(childCount == 0)) {
        _$jscoverage['/editor/range.js'].lineData[1517]++;
        endNode = endNode._4e_previousSourceNode();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1521]++;
        endNode = endNode[0];
        _$jscoverage['/editor/range.js'].lineData[1522]++;
        while (endNode.lastChild) {
          _$jscoverage['/editor/range.js'].lineData[1523]++;
          endNode = endNode.lastChild;
        }
        _$jscoverage['/editor/range.js'].lineData[1524]++;
        endNode = $(endNode);
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1530]++;
  if (visit597_1530_1(startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)) {
    _$jscoverage['/editor/range.js'].lineData[1531]++;
    startNode = endNode;
  }
  _$jscoverage['/editor/range.js'].lineData[1534]++;
  return {
  startNode: startNode, 
  endNode: endNode};
}, 
  fixBlock: function(isStart, blockTag) {
  _$jscoverage['/editor/range.js'].functionData[47]++;
  _$jscoverage['/editor/range.js'].lineData[1545]++;
  var self = this, bookmark = self.createBookmark(), fixedBlock = $(self.document.createElement(blockTag));
  _$jscoverage['/editor/range.js'].lineData[1548]++;
  self.collapse(isStart);
  _$jscoverage['/editor/range.js'].lineData[1549]++;
  self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
  _$jscoverage['/editor/range.js'].lineData[1550]++;
  fixedBlock[0].appendChild(self.extractContents());
  _$jscoverage['/editor/range.js'].lineData[1551]++;
  fixedBlock._4e_trim();
  _$jscoverage['/editor/range.js'].lineData[1552]++;
  if (visit598_1552_1(!UA['ie'])) {
    _$jscoverage['/editor/range.js'].lineData[1553]++;
    fixedBlock._4e_appendBogus();
  }
  _$jscoverage['/editor/range.js'].lineData[1555]++;
  self.insertNode(fixedBlock);
  _$jscoverage['/editor/range.js'].lineData[1556]++;
  self.moveToBookmark(bookmark);
  _$jscoverage['/editor/range.js'].lineData[1557]++;
  return fixedBlock;
}, 
  splitBlock: function(blockTag) {
  _$jscoverage['/editor/range.js'].functionData[48]++;
  _$jscoverage['/editor/range.js'].lineData[1566]++;
  var self = this, startPath = new ElementPath(self.startContainer), endPath = new ElementPath(self.endContainer), startBlockLimit = startPath.blockLimit, endBlockLimit = endPath.blockLimit, startBlock = startPath.block, endBlock = endPath.block, elementPath = NULL;
  _$jscoverage['/editor/range.js'].lineData[1576]++;
  if (visit599_1576_1(!startBlockLimit.equals(endBlockLimit))) {
    _$jscoverage['/editor/range.js'].lineData[1577]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1581]++;
  if (visit600_1581_1(blockTag != 'br')) {
    _$jscoverage['/editor/range.js'].lineData[1582]++;
    if (visit601_1582_1(!startBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1583]++;
      startBlock = self.fixBlock(TRUE, blockTag);
      _$jscoverage['/editor/range.js'].lineData[1584]++;
      endBlock = new ElementPath(self.endContainer).block;
    }
    _$jscoverage['/editor/range.js'].lineData[1587]++;
    if (visit602_1587_1(!endBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1588]++;
      endBlock = self.fixBlock(FALSE, blockTag);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1593]++;
  var isStartOfBlock = visit603_1593_1(startBlock && self.checkStartOfBlock()), isEndOfBlock = visit604_1594_1(endBlock && self.checkEndOfBlock());
  _$jscoverage['/editor/range.js'].lineData[1597]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1599]++;
  if (visit605_1599_1(startBlock && visit606_1599_2(startBlock[0] == endBlock[0]))) {
    _$jscoverage['/editor/range.js'].lineData[1600]++;
    if (visit607_1600_1(isEndOfBlock)) {
      _$jscoverage['/editor/range.js'].lineData[1601]++;
      elementPath = new ElementPath(self.startContainer);
      _$jscoverage['/editor/range.js'].lineData[1602]++;
      self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/range.js'].lineData[1603]++;
      endBlock = NULL;
    } else {
      _$jscoverage['/editor/range.js'].lineData[1605]++;
      if (visit608_1605_1(isStartOfBlock)) {
        _$jscoverage['/editor/range.js'].lineData[1606]++;
        elementPath = new ElementPath(self.startContainer);
        _$jscoverage['/editor/range.js'].lineData[1607]++;
        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
        _$jscoverage['/editor/range.js'].lineData[1608]++;
        startBlock = NULL;
      } else {
        _$jscoverage['/editor/range.js'].lineData[1611]++;
        endBlock = self.splitElement(startBlock);
        _$jscoverage['/editor/range.js'].lineData[1615]++;
        if (visit609_1615_1(!UA['ie'] && !S.inArray(startBlock.nodeName(), ['ul', 'ol']))) {
          _$jscoverage['/editor/range.js'].lineData[1616]++;
          startBlock._4e_appendBogus();
        }
      }
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1621]++;
  return {
  previousBlock: startBlock, 
  nextBlock: endBlock, 
  wasStartOfBlock: isStartOfBlock, 
  wasEndOfBlock: isEndOfBlock, 
  elementPath: elementPath};
}, 
  splitElement: function(toSplit) {
  _$jscoverage['/editor/range.js'].functionData[49]++;
  _$jscoverage['/editor/range.js'].lineData[1636]++;
  var self = this;
  _$jscoverage['/editor/range.js'].lineData[1637]++;
  if (visit610_1637_1(!self.collapsed)) {
    _$jscoverage['/editor/range.js'].lineData[1638]++;
    return NULL;
  }
  _$jscoverage['/editor/range.js'].lineData[1642]++;
  self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/range.js'].lineData[1643]++;
  var documentFragment = self.extractContents(), clone = toSplit.clone(FALSE);
  _$jscoverage['/editor/range.js'].lineData[1648]++;
  clone[0].appendChild(documentFragment);
  _$jscoverage['/editor/range.js'].lineData[1650]++;
  clone.insertAfter(toSplit);
  _$jscoverage['/editor/range.js'].lineData[1651]++;
  self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
  _$jscoverage['/editor/range.js'].lineData[1652]++;
  return clone;
}, 
  moveToElementEditablePosition: function(el, isMoveToEnd) {
  _$jscoverage['/editor/range.js'].functionData[50]++;
  _$jscoverage['/editor/range.js'].lineData[1664]++;
  function nextDFS(node, childOnly) {
    _$jscoverage['/editor/range.js'].functionData[51]++;
    _$jscoverage['/editor/range.js'].lineData[1665]++;
    var next;
    _$jscoverage['/editor/range.js'].lineData[1667]++;
    if (visit611_1667_1(visit612_1667_2(node[0].nodeType == Dom.NodeType.ELEMENT_NODE) && node._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1669]++;
      next = node[isMoveToEnd ? 'last' : 'first'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1672]++;
    if (visit613_1672_1(!childOnly && !next)) {
      _$jscoverage['/editor/range.js'].lineData[1673]++;
      next = node[isMoveToEnd ? 'prev' : 'next'](nonWhitespaceOrIsBookmark, 1);
    }
    _$jscoverage['/editor/range.js'].lineData[1676]++;
    return next;
  }
  _$jscoverage['/editor/range.js'].lineData[1679]++;
  var found = 0, self = this;
  _$jscoverage['/editor/range.js'].lineData[1681]++;
  while (el) {
    _$jscoverage['/editor/range.js'].lineData[1683]++;
    if (visit614_1683_1(el[0].nodeType == Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/range.js'].lineData[1684]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_AFTER_END : KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/range.js'].lineData[1687]++;
      found = 1;
      _$jscoverage['/editor/range.js'].lineData[1688]++;
      break;
    }
    _$jscoverage['/editor/range.js'].lineData[1692]++;
    if (visit615_1692_1(visit616_1692_2(el[0].nodeType == Dom.NodeType.ELEMENT_NODE) && el._4e_isEditable())) {
      _$jscoverage['/editor/range.js'].lineData[1693]++;
      self.moveToPosition(el, isMoveToEnd ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_START);
      _$jscoverage['/editor/range.js'].lineData[1696]++;
      found = 1;
    }
    _$jscoverage['/editor/range.js'].lineData[1699]++;
    el = nextDFS(el, found);
  }
  _$jscoverage['/editor/range.js'].lineData[1702]++;
  return !!found;
}, 
  selectNodeContents: function(node) {
  _$jscoverage['/editor/range.js'].functionData[52]++;
  _$jscoverage['/editor/range.js'].lineData[1710]++;
  var self = this, domNode = node[0];
  _$jscoverage['/editor/range.js'].lineData[1711]++;
  self.setStart(node, 0);
  _$jscoverage['/editor/range.js'].lineData[1712]++;
  self.setEnd(node, visit617_1712_1(domNode.nodeType == Dom.NodeType.TEXT_NODE) ? domNode.nodeValue.length : domNode.childNodes.length);
}, 
  insertNodeByDtd: function(element) {
  _$jscoverage['/editor/range.js'].functionData[53]++;
  _$jscoverage['/editor/range.js'].lineData[1722]++;
  var current, self = this, tmpDtd, last, elementName = element['nodeName'](), isBlock = dtd['$block'][elementName];
  _$jscoverage['/editor/range.js'].lineData[1728]++;
  self.deleteContents();
  _$jscoverage['/editor/range.js'].lineData[1729]++;
  if (visit618_1729_1(isBlock)) {
    _$jscoverage['/editor/range.js'].lineData[1730]++;
    current = self.getCommonAncestor(FALSE, TRUE);
    _$jscoverage['/editor/range.js'].lineData[1731]++;
    while (visit619_1731_1((tmpDtd = dtd[current.nodeName()]) && !(visit620_1731_2(tmpDtd && tmpDtd[elementName])))) {
      _$jscoverage['/editor/range.js'].lineData[1732]++;
      var parent = current.parent();
      _$jscoverage['/editor/range.js'].lineData[1735]++;
      if (visit621_1735_1(self.checkStartOfBlock() && self.checkEndOfBlock())) {
        _$jscoverage['/editor/range.js'].lineData[1736]++;
        self.setStartBefore(current);
        _$jscoverage['/editor/range.js'].lineData[1737]++;
        self.collapse(TRUE);
        _$jscoverage['/editor/range.js'].lineData[1738]++;
        current.remove();
      } else {
        _$jscoverage['/editor/range.js'].lineData[1740]++;
        last = current;
      }
      _$jscoverage['/editor/range.js'].lineData[1742]++;
      current = parent;
    }
    _$jscoverage['/editor/range.js'].lineData[1745]++;
    if (visit622_1745_1(last)) {
      _$jscoverage['/editor/range.js'].lineData[1746]++;
      self.splitElement(last);
    }
  }
  _$jscoverage['/editor/range.js'].lineData[1750]++;
  self.insertNode(element);
}});
  _$jscoverage['/editor/range.js'].lineData[1754]++;
  Utils.injectDom({
  _4e_breakParent: function(el, parent) {
  _$jscoverage['/editor/range.js'].functionData[54]++;
  _$jscoverage['/editor/range.js'].lineData[1756]++;
  parent = $(parent);
  _$jscoverage['/editor/range.js'].lineData[1757]++;
  el = $(el);
  _$jscoverage['/editor/range.js'].lineData[1759]++;
  var KERange = Editor.Range, docFrag, range = new KERange(el[0].ownerDocument);
  _$jscoverage['/editor/range.js'].lineData[1765]++;
  range.setStartAfter(el);
  _$jscoverage['/editor/range.js'].lineData[1766]++;
  range.setEndAfter(parent);
  _$jscoverage['/editor/range.js'].lineData[1769]++;
  docFrag = range.extractContents();
  _$jscoverage['/editor/range.js'].lineData[1772]++;
  range.insertNode(el.remove());
  _$jscoverage['/editor/range.js'].lineData[1775]++;
  el.after(docFrag);
}});
  _$jscoverage['/editor/range.js'].lineData[1779]++;
  Editor.Range = KERange;
  _$jscoverage['/editor/range.js'].lineData[1781]++;
  return KERange;
});
