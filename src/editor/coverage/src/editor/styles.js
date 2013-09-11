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
  _$jscoverage['/editor/styles.js'].lineData[63] = 0;
  _$jscoverage['/editor/styles.js'].lineData[69] = 0;
  _$jscoverage['/editor/styles.js'].lineData[72] = 0;
  _$jscoverage['/editor/styles.js'].lineData[75] = 0;
  _$jscoverage['/editor/styles.js'].lineData[76] = 0;
  _$jscoverage['/editor/styles.js'].lineData[77] = 0;
  _$jscoverage['/editor/styles.js'].lineData[78] = 0;
  _$jscoverage['/editor/styles.js'].lineData[79] = 0;
  _$jscoverage['/editor/styles.js'].lineData[82] = 0;
  _$jscoverage['/editor/styles.js'].lineData[93] = 0;
  _$jscoverage['/editor/styles.js'].lineData[94] = 0;
  _$jscoverage['/editor/styles.js'].lineData[95] = 0;
  _$jscoverage['/editor/styles.js'].lineData[96] = 0;
  _$jscoverage['/editor/styles.js'].lineData[99] = 0;
  _$jscoverage['/editor/styles.js'].lineData[101] = 0;
  _$jscoverage['/editor/styles.js'].lineData[106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[111] = 0;
  _$jscoverage['/editor/styles.js'].lineData[113] = 0;
  _$jscoverage['/editor/styles.js'].lineData[117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[119] = 0;
  _$jscoverage['/editor/styles.js'].lineData[121] = 0;
  _$jscoverage['/editor/styles.js'].lineData[122] = 0;
  _$jscoverage['/editor/styles.js'].lineData[124] = 0;
  _$jscoverage['/editor/styles.js'].lineData[126] = 0;
  _$jscoverage['/editor/styles.js'].lineData[129] = 0;
  _$jscoverage['/editor/styles.js'].lineData[133] = 0;
  _$jscoverage['/editor/styles.js'].lineData[137] = 0;
  _$jscoverage['/editor/styles.js'].lineData[141] = 0;
  _$jscoverage['/editor/styles.js'].lineData[142] = 0;
  _$jscoverage['/editor/styles.js'].lineData[155] = 0;
  _$jscoverage['/editor/styles.js'].lineData[156] = 0;
  _$jscoverage['/editor/styles.js'].lineData[165] = 0;
  _$jscoverage['/editor/styles.js'].lineData[166] = 0;
  _$jscoverage['/editor/styles.js'].lineData[168] = 0;
  _$jscoverage['/editor/styles.js'].lineData[172] = 0;
  _$jscoverage['/editor/styles.js'].lineData[174] = 0;
  _$jscoverage['/editor/styles.js'].lineData[175] = 0;
  _$jscoverage['/editor/styles.js'].lineData[177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[179] = 0;
  _$jscoverage['/editor/styles.js'].lineData[180] = 0;
  _$jscoverage['/editor/styles.js'].lineData[182] = 0;
  _$jscoverage['/editor/styles.js'].lineData[183] = 0;
  _$jscoverage['/editor/styles.js'].lineData[185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[186] = 0;
  _$jscoverage['/editor/styles.js'].lineData[190] = 0;
  _$jscoverage['/editor/styles.js'].lineData[191] = 0;
  _$jscoverage['/editor/styles.js'].lineData[193] = 0;
  _$jscoverage['/editor/styles.js'].lineData[194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[197] = 0;
  _$jscoverage['/editor/styles.js'].lineData[198] = 0;
  _$jscoverage['/editor/styles.js'].lineData[201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[208] = 0;
  _$jscoverage['/editor/styles.js'].lineData[210] = 0;
  _$jscoverage['/editor/styles.js'].lineData[213] = 0;
  _$jscoverage['/editor/styles.js'].lineData[214] = 0;
  _$jscoverage['/editor/styles.js'].lineData[215] = 0;
  _$jscoverage['/editor/styles.js'].lineData[216] = 0;
  _$jscoverage['/editor/styles.js'].lineData[217] = 0;
  _$jscoverage['/editor/styles.js'].lineData[218] = 0;
  _$jscoverage['/editor/styles.js'].lineData[219] = 0;
  _$jscoverage['/editor/styles.js'].lineData[226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[235] = 0;
  _$jscoverage['/editor/styles.js'].lineData[236] = 0;
  _$jscoverage['/editor/styles.js'].lineData[237] = 0;
  _$jscoverage['/editor/styles.js'].lineData[238] = 0;
  _$jscoverage['/editor/styles.js'].lineData[239] = 0;
  _$jscoverage['/editor/styles.js'].lineData[240] = 0;
  _$jscoverage['/editor/styles.js'].lineData[246] = 0;
  _$jscoverage['/editor/styles.js'].lineData[251] = 0;
  _$jscoverage['/editor/styles.js'].lineData[259] = 0;
  _$jscoverage['/editor/styles.js'].lineData[261] = 0;
  _$jscoverage['/editor/styles.js'].lineData[267] = 0;
  _$jscoverage['/editor/styles.js'].lineData[269] = 0;
  _$jscoverage['/editor/styles.js'].lineData[270] = 0;
  _$jscoverage['/editor/styles.js'].lineData[272] = 0;
  _$jscoverage['/editor/styles.js'].lineData[275] = 0;
  _$jscoverage['/editor/styles.js'].lineData[277] = 0;
  _$jscoverage['/editor/styles.js'].lineData[279] = 0;
  _$jscoverage['/editor/styles.js'].lineData[281] = 0;
  _$jscoverage['/editor/styles.js'].lineData[282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[290] = 0;
  _$jscoverage['/editor/styles.js'].lineData[292] = 0;
  _$jscoverage['/editor/styles.js'].lineData[293] = 0;
  _$jscoverage['/editor/styles.js'].lineData[294] = 0;
  _$jscoverage['/editor/styles.js'].lineData[296] = 0;
  _$jscoverage['/editor/styles.js'].lineData[299] = 0;
  _$jscoverage['/editor/styles.js'].lineData[303] = 0;
  _$jscoverage['/editor/styles.js'].lineData[304] = 0;
  _$jscoverage['/editor/styles.js'].lineData[306] = 0;
  _$jscoverage['/editor/styles.js'].lineData[308] = 0;
  _$jscoverage['/editor/styles.js'].lineData[312] = 0;
  _$jscoverage['/editor/styles.js'].lineData[313] = 0;
  _$jscoverage['/editor/styles.js'].lineData[315] = 0;
  _$jscoverage['/editor/styles.js'].lineData[321] = 0;
  _$jscoverage['/editor/styles.js'].lineData[322] = 0;
  _$jscoverage['/editor/styles.js'].lineData[324] = 0;
  _$jscoverage['/editor/styles.js'].lineData[327] = 0;
  _$jscoverage['/editor/styles.js'].lineData[330] = 0;
  _$jscoverage['/editor/styles.js'].lineData[331] = 0;
  _$jscoverage['/editor/styles.js'].lineData[336] = 0;
  _$jscoverage['/editor/styles.js'].lineData[337] = 0;
  _$jscoverage['/editor/styles.js'].lineData[340] = 0;
  _$jscoverage['/editor/styles.js'].lineData[343] = 0;
  _$jscoverage['/editor/styles.js'].lineData[344] = 0;
  _$jscoverage['/editor/styles.js'].lineData[346] = 0;
  _$jscoverage['/editor/styles.js'].lineData[349] = 0;
  _$jscoverage['/editor/styles.js'].lineData[350] = 0;
  _$jscoverage['/editor/styles.js'].lineData[355] = 0;
  _$jscoverage['/editor/styles.js'].lineData[356] = 0;
  _$jscoverage['/editor/styles.js'].lineData[357] = 0;
  _$jscoverage['/editor/styles.js'].lineData[363] = 0;
  _$jscoverage['/editor/styles.js'].lineData[364] = 0;
  _$jscoverage['/editor/styles.js'].lineData[366] = 0;
  _$jscoverage['/editor/styles.js'].lineData[369] = 0;
  _$jscoverage['/editor/styles.js'].lineData[372] = 0;
  _$jscoverage['/editor/styles.js'].lineData[374] = 0;
  _$jscoverage['/editor/styles.js'].lineData[378] = 0;
  _$jscoverage['/editor/styles.js'].lineData[380] = 0;
  _$jscoverage['/editor/styles.js'].lineData[382] = 0;
  _$jscoverage['/editor/styles.js'].lineData[383] = 0;
  _$jscoverage['/editor/styles.js'].lineData[384] = 0;
  _$jscoverage['/editor/styles.js'].lineData[386] = 0;
  _$jscoverage['/editor/styles.js'].lineData[390] = 0;
  _$jscoverage['/editor/styles.js'].lineData[391] = 0;
  _$jscoverage['/editor/styles.js'].lineData[394] = 0;
  _$jscoverage['/editor/styles.js'].lineData[396] = 0;
  _$jscoverage['/editor/styles.js'].lineData[397] = 0;
  _$jscoverage['/editor/styles.js'].lineData[398] = 0;
  _$jscoverage['/editor/styles.js'].lineData[400] = 0;
  _$jscoverage['/editor/styles.js'].lineData[406] = 0;
  _$jscoverage['/editor/styles.js'].lineData[408] = 0;
  _$jscoverage['/editor/styles.js'].lineData[411] = 0;
  _$jscoverage['/editor/styles.js'].lineData[414] = 0;
  _$jscoverage['/editor/styles.js'].lineData[418] = 0;
  _$jscoverage['/editor/styles.js'].lineData[421] = 0;
  _$jscoverage['/editor/styles.js'].lineData[424] = 0;
  _$jscoverage['/editor/styles.js'].lineData[425] = 0;
  _$jscoverage['/editor/styles.js'].lineData[426] = 0;
  _$jscoverage['/editor/styles.js'].lineData[427] = 0;
  _$jscoverage['/editor/styles.js'].lineData[428] = 0;
  _$jscoverage['/editor/styles.js'].lineData[429] = 0;
  _$jscoverage['/editor/styles.js'].lineData[432] = 0;
  _$jscoverage['/editor/styles.js'].lineData[434] = 0;
  _$jscoverage['/editor/styles.js'].lineData[439] = 0;
  _$jscoverage['/editor/styles.js'].lineData[442] = 0;
  _$jscoverage['/editor/styles.js'].lineData[447] = 0;
  _$jscoverage['/editor/styles.js'].lineData[450] = 0;
  _$jscoverage['/editor/styles.js'].lineData[451] = 0;
  _$jscoverage['/editor/styles.js'].lineData[453] = 0;
  _$jscoverage['/editor/styles.js'].lineData[455] = 0;
  _$jscoverage['/editor/styles.js'].lineData[461] = 0;
  _$jscoverage['/editor/styles.js'].lineData[462] = 0;
  _$jscoverage['/editor/styles.js'].lineData[467] = 0;
  _$jscoverage['/editor/styles.js'].lineData[468] = 0;
  _$jscoverage['/editor/styles.js'].lineData[469] = 0;
  _$jscoverage['/editor/styles.js'].lineData[471] = 0;
  _$jscoverage['/editor/styles.js'].lineData[473] = 0;
  _$jscoverage['/editor/styles.js'].lineData[475] = 0;
  _$jscoverage['/editor/styles.js'].lineData[476] = 0;
  _$jscoverage['/editor/styles.js'].lineData[478] = 0;
  _$jscoverage['/editor/styles.js'].lineData[483] = 0;
  _$jscoverage['/editor/styles.js'].lineData[484] = 0;
  _$jscoverage['/editor/styles.js'].lineData[485] = 0;
  _$jscoverage['/editor/styles.js'].lineData[487] = 0;
  _$jscoverage['/editor/styles.js'].lineData[496] = 0;
  _$jscoverage['/editor/styles.js'].lineData[500] = 0;
  _$jscoverage['/editor/styles.js'].lineData[501] = 0;
  _$jscoverage['/editor/styles.js'].lineData[503] = 0;
  _$jscoverage['/editor/styles.js'].lineData[505] = 0;
  _$jscoverage['/editor/styles.js'].lineData[510] = 0;
  _$jscoverage['/editor/styles.js'].lineData[511] = 0;
  _$jscoverage['/editor/styles.js'].lineData[512] = 0;
  _$jscoverage['/editor/styles.js'].lineData[513] = 0;
  _$jscoverage['/editor/styles.js'].lineData[517] = 0;
  _$jscoverage['/editor/styles.js'].lineData[518] = 0;
  _$jscoverage['/editor/styles.js'].lineData[519] = 0;
  _$jscoverage['/editor/styles.js'].lineData[521] = 0;
  _$jscoverage['/editor/styles.js'].lineData[522] = 0;
  _$jscoverage['/editor/styles.js'].lineData[523] = 0;
  _$jscoverage['/editor/styles.js'].lineData[524] = 0;
  _$jscoverage['/editor/styles.js'].lineData[525] = 0;
  _$jscoverage['/editor/styles.js'].lineData[527] = 0;
  _$jscoverage['/editor/styles.js'].lineData[532] = 0;
  _$jscoverage['/editor/styles.js'].lineData[533] = 0;
  _$jscoverage['/editor/styles.js'].lineData[535] = 0;
  _$jscoverage['/editor/styles.js'].lineData[538] = 0;
  _$jscoverage['/editor/styles.js'].lineData[539] = 0;
  _$jscoverage['/editor/styles.js'].lineData[540] = 0;
  _$jscoverage['/editor/styles.js'].lineData[542] = 0;
  _$jscoverage['/editor/styles.js'].lineData[545] = 0;
  _$jscoverage['/editor/styles.js'].lineData[546] = 0;
  _$jscoverage['/editor/styles.js'].lineData[549] = 0;
  _$jscoverage['/editor/styles.js'].lineData[551] = 0;
  _$jscoverage['/editor/styles.js'].lineData[553] = 0;
  _$jscoverage['/editor/styles.js'].lineData[555] = 0;
  _$jscoverage['/editor/styles.js'].lineData[556] = 0;
  _$jscoverage['/editor/styles.js'].lineData[558] = 0;
  _$jscoverage['/editor/styles.js'].lineData[563] = 0;
  _$jscoverage['/editor/styles.js'].lineData[564] = 0;
  _$jscoverage['/editor/styles.js'].lineData[565] = 0;
  _$jscoverage['/editor/styles.js'].lineData[569] = 0;
  _$jscoverage['/editor/styles.js'].lineData[572] = 0;
  _$jscoverage['/editor/styles.js'].lineData[573] = 0;
  _$jscoverage['/editor/styles.js'].lineData[577] = 0;
  _$jscoverage['/editor/styles.js'].lineData[583] = 0;
  _$jscoverage['/editor/styles.js'].lineData[584] = 0;
  _$jscoverage['/editor/styles.js'].lineData[586] = 0;
  _$jscoverage['/editor/styles.js'].lineData[587] = 0;
  _$jscoverage['/editor/styles.js'].lineData[588] = 0;
  _$jscoverage['/editor/styles.js'].lineData[591] = 0;
  _$jscoverage['/editor/styles.js'].lineData[595] = 0;
  _$jscoverage['/editor/styles.js'].lineData[596] = 0;
  _$jscoverage['/editor/styles.js'].lineData[597] = 0;
  _$jscoverage['/editor/styles.js'].lineData[601] = 0;
  _$jscoverage['/editor/styles.js'].lineData[612] = 0;
  _$jscoverage['/editor/styles.js'].lineData[623] = 0;
  _$jscoverage['/editor/styles.js'].lineData[626] = 0;
  _$jscoverage['/editor/styles.js'].lineData[627] = 0;
  _$jscoverage['/editor/styles.js'].lineData[628] = 0;
  _$jscoverage['/editor/styles.js'].lineData[629] = 0;
  _$jscoverage['/editor/styles.js'].lineData[634] = 0;
  _$jscoverage['/editor/styles.js'].lineData[643] = 0;
  _$jscoverage['/editor/styles.js'].lineData[655] = 0;
  _$jscoverage['/editor/styles.js'].lineData[656] = 0;
  _$jscoverage['/editor/styles.js'].lineData[661] = 0;
  _$jscoverage['/editor/styles.js'].lineData[663] = 0;
  _$jscoverage['/editor/styles.js'].lineData[676] = 0;
  _$jscoverage['/editor/styles.js'].lineData[688] = 0;
  _$jscoverage['/editor/styles.js'].lineData[691] = 0;
  _$jscoverage['/editor/styles.js'].lineData[696] = 0;
  _$jscoverage['/editor/styles.js'].lineData[699] = 0;
  _$jscoverage['/editor/styles.js'].lineData[702] = 0;
  _$jscoverage['/editor/styles.js'].lineData[706] = 0;
  _$jscoverage['/editor/styles.js'].lineData[708] = 0;
  _$jscoverage['/editor/styles.js'].lineData[714] = 0;
  _$jscoverage['/editor/styles.js'].lineData[723] = 0;
  _$jscoverage['/editor/styles.js'].lineData[727] = 0;
  _$jscoverage['/editor/styles.js'].lineData[728] = 0;
  _$jscoverage['/editor/styles.js'].lineData[729] = 0;
  _$jscoverage['/editor/styles.js'].lineData[731] = 0;
  _$jscoverage['/editor/styles.js'].lineData[733] = 0;
  _$jscoverage['/editor/styles.js'].lineData[735] = 0;
  _$jscoverage['/editor/styles.js'].lineData[737] = 0;
  _$jscoverage['/editor/styles.js'].lineData[739] = 0;
  _$jscoverage['/editor/styles.js'].lineData[746] = 0;
  _$jscoverage['/editor/styles.js'].lineData[748] = 0;
  _$jscoverage['/editor/styles.js'].lineData[750] = 0;
  _$jscoverage['/editor/styles.js'].lineData[752] = 0;
  _$jscoverage['/editor/styles.js'].lineData[754] = 0;
  _$jscoverage['/editor/styles.js'].lineData[756] = 0;
  _$jscoverage['/editor/styles.js'].lineData[760] = 0;
  _$jscoverage['/editor/styles.js'].lineData[761] = 0;
  _$jscoverage['/editor/styles.js'].lineData[762] = 0;
  _$jscoverage['/editor/styles.js'].lineData[766] = 0;
  _$jscoverage['/editor/styles.js'].lineData[769] = 0;
  _$jscoverage['/editor/styles.js'].lineData[771] = 0;
  _$jscoverage['/editor/styles.js'].lineData[775] = 0;
  _$jscoverage['/editor/styles.js'].lineData[779] = 0;
  _$jscoverage['/editor/styles.js'].lineData[782] = 0;
  _$jscoverage['/editor/styles.js'].lineData[790] = 0;
  _$jscoverage['/editor/styles.js'].lineData[791] = 0;
  _$jscoverage['/editor/styles.js'].lineData[804] = 0;
  _$jscoverage['/editor/styles.js'].lineData[805] = 0;
  _$jscoverage['/editor/styles.js'].lineData[806] = 0;
  _$jscoverage['/editor/styles.js'].lineData[807] = 0;
  _$jscoverage['/editor/styles.js'].lineData[808] = 0;
  _$jscoverage['/editor/styles.js'].lineData[813] = 0;
  _$jscoverage['/editor/styles.js'].lineData[817] = 0;
  _$jscoverage['/editor/styles.js'].lineData[818] = 0;
  _$jscoverage['/editor/styles.js'].lineData[819] = 0;
  _$jscoverage['/editor/styles.js'].lineData[821] = 0;
  _$jscoverage['/editor/styles.js'].lineData[825] = 0;
  _$jscoverage['/editor/styles.js'].lineData[830] = 0;
  _$jscoverage['/editor/styles.js'].lineData[832] = 0;
  _$jscoverage['/editor/styles.js'].lineData[835] = 0;
  _$jscoverage['/editor/styles.js'].lineData[837] = 0;
  _$jscoverage['/editor/styles.js'].lineData[842] = 0;
  _$jscoverage['/editor/styles.js'].lineData[851] = 0;
  _$jscoverage['/editor/styles.js'].lineData[853] = 0;
  _$jscoverage['/editor/styles.js'].lineData[855] = 0;
  _$jscoverage['/editor/styles.js'].lineData[856] = 0;
  _$jscoverage['/editor/styles.js'].lineData[859] = 0;
  _$jscoverage['/editor/styles.js'].lineData[860] = 0;
  _$jscoverage['/editor/styles.js'].lineData[861] = 0;
  _$jscoverage['/editor/styles.js'].lineData[869] = 0;
  _$jscoverage['/editor/styles.js'].lineData[873] = 0;
  _$jscoverage['/editor/styles.js'].lineData[874] = 0;
  _$jscoverage['/editor/styles.js'].lineData[875] = 0;
  _$jscoverage['/editor/styles.js'].lineData[878] = 0;
  _$jscoverage['/editor/styles.js'].lineData[888] = 0;
  _$jscoverage['/editor/styles.js'].lineData[889] = 0;
  _$jscoverage['/editor/styles.js'].lineData[890] = 0;
  _$jscoverage['/editor/styles.js'].lineData[891] = 0;
  _$jscoverage['/editor/styles.js'].lineData[892] = 0;
  _$jscoverage['/editor/styles.js'].lineData[893] = 0;
  _$jscoverage['/editor/styles.js'].lineData[895] = 0;
  _$jscoverage['/editor/styles.js'].lineData[896] = 0;
  _$jscoverage['/editor/styles.js'].lineData[898] = 0;
  _$jscoverage['/editor/styles.js'].lineData[899] = 0;
  _$jscoverage['/editor/styles.js'].lineData[900] = 0;
  _$jscoverage['/editor/styles.js'].lineData[906] = 0;
  _$jscoverage['/editor/styles.js'].lineData[909] = 0;
  _$jscoverage['/editor/styles.js'].lineData[910] = 0;
  _$jscoverage['/editor/styles.js'].lineData[913] = 0;
  _$jscoverage['/editor/styles.js'].lineData[916] = 0;
  _$jscoverage['/editor/styles.js'].lineData[917] = 0;
  _$jscoverage['/editor/styles.js'].lineData[925] = 0;
  _$jscoverage['/editor/styles.js'].lineData[932] = 0;
  _$jscoverage['/editor/styles.js'].lineData[933] = 0;
  _$jscoverage['/editor/styles.js'].lineData[937] = 0;
  _$jscoverage['/editor/styles.js'].lineData[938] = 0;
  _$jscoverage['/editor/styles.js'].lineData[940] = 0;
  _$jscoverage['/editor/styles.js'].lineData[942] = 0;
  _$jscoverage['/editor/styles.js'].lineData[944] = 0;
  _$jscoverage['/editor/styles.js'].lineData[945] = 0;
  _$jscoverage['/editor/styles.js'].lineData[947] = 0;
  _$jscoverage['/editor/styles.js'].lineData[948] = 0;
  _$jscoverage['/editor/styles.js'].lineData[950] = 0;
  _$jscoverage['/editor/styles.js'].lineData[952] = 0;
  _$jscoverage['/editor/styles.js'].lineData[954] = 0;
  _$jscoverage['/editor/styles.js'].lineData[955] = 0;
  _$jscoverage['/editor/styles.js'].lineData[958] = 0;
  _$jscoverage['/editor/styles.js'].lineData[959] = 0;
  _$jscoverage['/editor/styles.js'].lineData[960] = 0;
  _$jscoverage['/editor/styles.js'].lineData[961] = 0;
  _$jscoverage['/editor/styles.js'].lineData[964] = 0;
  _$jscoverage['/editor/styles.js'].lineData[967] = 0;
  _$jscoverage['/editor/styles.js'].lineData[968] = 0;
  _$jscoverage['/editor/styles.js'].lineData[973] = 0;
  _$jscoverage['/editor/styles.js'].lineData[974] = 0;
  _$jscoverage['/editor/styles.js'].lineData[978] = 0;
  _$jscoverage['/editor/styles.js'].lineData[979] = 0;
  _$jscoverage['/editor/styles.js'].lineData[981] = 0;
  _$jscoverage['/editor/styles.js'].lineData[982] = 0;
  _$jscoverage['/editor/styles.js'].lineData[993] = 0;
  _$jscoverage['/editor/styles.js'].lineData[995] = 0;
  _$jscoverage['/editor/styles.js'].lineData[996] = 0;
  _$jscoverage['/editor/styles.js'].lineData[999] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1002] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1006] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1007] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1008] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1010] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1012] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1014] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1017] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1018] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1019] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1020] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1024] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1028] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1032] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1035] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1036] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1037] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1040] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1041] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1043] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1046] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1050] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1060] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1062] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1063] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1064] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1066] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1068] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1072] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1073] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1075] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1076] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1082] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1083] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1084] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1085] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1086] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1091] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1094] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1103] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1104] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1110] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1113] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1114] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1118] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1119] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1120] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1121] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1124] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1125] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1128] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1132] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1138] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1141] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1145] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1147] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1151] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1156] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1160] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1162] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1166] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1172] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1176] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1191] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1195] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1196] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1200] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1203] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1206] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1208] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1210] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1216] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1219] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1220] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1221] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1222] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1227] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1233] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1234] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1239] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1241] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1242] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1243] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1258] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1259] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1261] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1262] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1263] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1265] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1266] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1274] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1277] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1284] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1286] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1288] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1289] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1290] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1294] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1299] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1303] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1306] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1309] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1312] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1316] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1319] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1321] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1326] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1328] = 0;
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
  _$jscoverage['/editor/styles.js'].branchData['77'] = [];
  _$jscoverage['/editor/styles.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['94'] = [];
  _$jscoverage['/editor/styles.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['99'] = [];
  _$jscoverage['/editor/styles.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['101'] = [];
  _$jscoverage['/editor/styles.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['122'] = [];
  _$jscoverage['/editor/styles.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['143'] = [];
  _$jscoverage['/editor/styles.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['145'] = [];
  _$jscoverage['/editor/styles.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['147'] = [];
  _$jscoverage['/editor/styles.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['157'] = [];
  _$jscoverage['/editor/styles.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['165'] = [];
  _$jscoverage['/editor/styles.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['172'] = [];
  _$jscoverage['/editor/styles.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['174'] = [];
  _$jscoverage['/editor/styles.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['179'] = [];
  _$jscoverage['/editor/styles.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['182'] = [];
  _$jscoverage['/editor/styles.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['185'] = [];
  _$jscoverage['/editor/styles.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['186'] = [];
  _$jscoverage['/editor/styles.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['189'] = [];
  _$jscoverage['/editor/styles.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['190'] = [];
  _$jscoverage['/editor/styles.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['193'] = [];
  _$jscoverage['/editor/styles.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['197'] = [];
  _$jscoverage['/editor/styles.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['206'] = [];
  _$jscoverage['/editor/styles.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['208'] = [];
  _$jscoverage['/editor/styles.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['210'] = [];
  _$jscoverage['/editor/styles.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['215'] = [];
  _$jscoverage['/editor/styles.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['218'] = [];
  _$jscoverage['/editor/styles.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['226'] = [];
  _$jscoverage['/editor/styles.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['227'] = [];
  _$jscoverage['/editor/styles.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['227'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['227'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['228'] = [];
  _$jscoverage['/editor/styles.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['229'] = [];
  _$jscoverage['/editor/styles.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['234'] = [];
  _$jscoverage['/editor/styles.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['235'] = [];
  _$jscoverage['/editor/styles.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['238'] = [];
  _$jscoverage['/editor/styles.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['240'] = [];
  _$jscoverage['/editor/styles.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['243'] = [];
  _$jscoverage['/editor/styles.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['243'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'] = [];
  _$jscoverage['/editor/styles.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'] = [];
  _$jscoverage['/editor/styles.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['261'] = [];
  _$jscoverage['/editor/styles.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['269'] = [];
  _$jscoverage['/editor/styles.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['272'] = [];
  _$jscoverage['/editor/styles.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['272'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['273'] = [];
  _$jscoverage['/editor/styles.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['277'] = [];
  _$jscoverage['/editor/styles.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['277'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['281'] = [];
  _$jscoverage['/editor/styles.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['293'] = [];
  _$jscoverage['/editor/styles.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['299'] = [];
  _$jscoverage['/editor/styles.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['299'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['303'] = [];
  _$jscoverage['/editor/styles.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['312'] = [];
  _$jscoverage['/editor/styles.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['321'] = [];
  _$jscoverage['/editor/styles.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['336'] = [];
  _$jscoverage['/editor/styles.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['343'] = [];
  _$jscoverage['/editor/styles.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['355'] = [];
  _$jscoverage['/editor/styles.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['363'] = [];
  _$jscoverage['/editor/styles.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['396'] = [];
  _$jscoverage['/editor/styles.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['397'] = [];
  _$jscoverage['/editor/styles.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['424'] = [];
  _$jscoverage['/editor/styles.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['462'] = [];
  _$jscoverage['/editor/styles.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['463'] = [];
  _$jscoverage['/editor/styles.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['464'] = [];
  _$jscoverage['/editor/styles.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['465'] = [];
  _$jscoverage['/editor/styles.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['467'] = [];
  _$jscoverage['/editor/styles.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['469'] = [];
  _$jscoverage['/editor/styles.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['476'] = [];
  _$jscoverage['/editor/styles.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['485'] = [];
  _$jscoverage['/editor/styles.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['485'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['486'] = [];
  _$jscoverage['/editor/styles.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['500'] = [];
  _$jscoverage['/editor/styles.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['512'] = [];
  _$jscoverage['/editor/styles.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['522'] = [];
  _$jscoverage['/editor/styles.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['524'] = [];
  _$jscoverage['/editor/styles.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['549'] = [];
  _$jscoverage['/editor/styles.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['563'] = [];
  _$jscoverage['/editor/styles.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['583'] = [];
  _$jscoverage['/editor/styles.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['586'] = [];
  _$jscoverage['/editor/styles.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['592'] = [];
  _$jscoverage['/editor/styles.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['595'] = [];
  _$jscoverage['/editor/styles.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['601'] = [];
  _$jscoverage['/editor/styles.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['602'] = [];
  _$jscoverage['/editor/styles.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['603'] = [];
  _$jscoverage['/editor/styles.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['603'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['610'] = [];
  _$jscoverage['/editor/styles.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['623'] = [];
  _$jscoverage['/editor/styles.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['624'] = [];
  _$jscoverage['/editor/styles.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['624'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['625'] = [];
  _$jscoverage['/editor/styles.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['634'] = [];
  _$jscoverage['/editor/styles.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['634'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['635'] = [];
  _$jscoverage['/editor/styles.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['635'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['636'] = [];
  _$jscoverage['/editor/styles.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['638'] = [];
  _$jscoverage['/editor/styles.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['643'] = [];
  _$jscoverage['/editor/styles.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['644'] = [];
  _$jscoverage['/editor/styles.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['645'] = [];
  _$jscoverage['/editor/styles.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['646'] = [];
  _$jscoverage['/editor/styles.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['661'] = [];
  _$jscoverage['/editor/styles.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['661'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['662'] = [];
  _$jscoverage['/editor/styles.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['662'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['677'] = [];
  _$jscoverage['/editor/styles.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['678'] = [];
  _$jscoverage['/editor/styles.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['678'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'] = [];
  _$jscoverage['/editor/styles.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['680'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['687'] = [];
  _$jscoverage['/editor/styles.js'].branchData['687'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['706'] = [];
  _$jscoverage['/editor/styles.js'].branchData['706'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['706'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['727'] = [];
  _$jscoverage['/editor/styles.js'].branchData['727'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['727'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['727'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['728'] = [];
  _$jscoverage['/editor/styles.js'].branchData['728'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['731'] = [];
  _$jscoverage['/editor/styles.js'].branchData['731'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['735'] = [];
  _$jscoverage['/editor/styles.js'].branchData['735'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['748'] = [];
  _$jscoverage['/editor/styles.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['752'] = [];
  _$jscoverage['/editor/styles.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['760'] = [];
  _$jscoverage['/editor/styles.js'].branchData['760'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['769'] = [];
  _$jscoverage['/editor/styles.js'].branchData['769'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['790'] = [];
  _$jscoverage['/editor/styles.js'].branchData['790'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['835'] = [];
  _$jscoverage['/editor/styles.js'].branchData['835'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['842'] = [];
  _$jscoverage['/editor/styles.js'].branchData['842'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['842'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['851'] = [];
  _$jscoverage['/editor/styles.js'].branchData['851'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['851'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['852'] = [];
  _$jscoverage['/editor/styles.js'].branchData['852'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['855'] = [];
  _$jscoverage['/editor/styles.js'].branchData['855'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['857'] = [];
  _$jscoverage['/editor/styles.js'].branchData['857'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['859'] = [];
  _$jscoverage['/editor/styles.js'].branchData['859'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['873'] = [];
  _$jscoverage['/editor/styles.js'].branchData['873'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['876'] = [];
  _$jscoverage['/editor/styles.js'].branchData['876'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['888'] = [];
  _$jscoverage['/editor/styles.js'].branchData['888'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['892'] = [];
  _$jscoverage['/editor/styles.js'].branchData['892'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['895'] = [];
  _$jscoverage['/editor/styles.js'].branchData['895'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['905'] = [];
  _$jscoverage['/editor/styles.js'].branchData['905'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['910'] = [];
  _$jscoverage['/editor/styles.js'].branchData['910'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['912'] = [];
  _$jscoverage['/editor/styles.js'].branchData['912'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['916'] = [];
  _$jscoverage['/editor/styles.js'].branchData['916'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['937'] = [];
  _$jscoverage['/editor/styles.js'].branchData['937'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['940'] = [];
  _$jscoverage['/editor/styles.js'].branchData['940'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['940'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['941'] = [];
  _$jscoverage['/editor/styles.js'].branchData['941'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['944'] = [];
  _$jscoverage['/editor/styles.js'].branchData['944'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['947'] = [];
  _$jscoverage['/editor/styles.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['950'] = [];
  _$jscoverage['/editor/styles.js'].branchData['950'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['950'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['951'] = [];
  _$jscoverage['/editor/styles.js'].branchData['951'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['954'] = [];
  _$jscoverage['/editor/styles.js'].branchData['954'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['958'] = [];
  _$jscoverage['/editor/styles.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['960'] = [];
  _$jscoverage['/editor/styles.js'].branchData['960'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['968'] = [];
  _$jscoverage['/editor/styles.js'].branchData['968'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['974'] = [];
  _$jscoverage['/editor/styles.js'].branchData['974'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['975'] = [];
  _$jscoverage['/editor/styles.js'].branchData['975'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['975'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['978'] = [];
  _$jscoverage['/editor/styles.js'].branchData['978'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['983'] = [];
  _$jscoverage['/editor/styles.js'].branchData['983'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['993'] = [];
  _$jscoverage['/editor/styles.js'].branchData['993'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['993'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1018'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1018'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1018'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1019'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1019'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1019'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1024'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1024'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1024'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1025'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1025'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1025'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1026'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1026'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1026'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1027'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1027'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1037'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1043'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1043'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1063'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1063'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1072'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1072'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1083'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1083'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1084'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1084'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1104'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1104'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1110'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1110'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1113'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1113'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1117'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1117'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1124'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1124'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1138'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1138'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1141'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1141'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1146'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1146'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1156'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1156'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1161'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1161'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1180'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1180'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1180'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1182'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1182'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1182'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1184'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1184'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1191'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1191'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1191'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1191'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1192'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1192'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1195'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1195'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1203'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1203'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1204'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1204'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1208'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1208'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1233'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1233'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1241'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1241'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1243'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1243'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1259'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1259'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1261'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1261'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1262'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1262'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1274'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1274'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1274'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1275'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1275'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1275'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1276'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1276'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1276'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1276'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1282'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1282'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1284'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1285'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1285'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1290'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1290'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1290'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1292'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1292'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1292'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1293'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1293'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1293'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1293'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1306'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1306'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1314'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1314'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1316'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1316'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1316'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1319'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1319'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1320'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1320'][1] = new BranchData();
}
_$jscoverage['/editor/styles.js'].branchData['1320'][1].init(47, 47, 'lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1044_1320_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1320'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][3].init(214, 23, 'firstChild != lastChild');
function visit1043_1319_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][2].init(214, 95, 'firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1042_1319_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1319'][1].init(201, 108, 'lastChild && firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1041_1319_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1319'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1316'][2].init(74, 48, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1040_1316_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1316'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1316'][1].init(74, 102, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_mergeSiblings(firstChild)');
function visit1039_1316_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1314'][1].init(318, 10, 'firstChild');
function visit1038_1314_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1306'][1].init(118, 28, '!element._4e_hasAttributes()');
function visit1037_1306_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1293'][3].init(116, 30, 'actualStyleValue == styleValue');
function visit1036_1293_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1293'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1293'][2].init(83, 29, 'typeof styleValue == \'string\'');
function visit1035_1293_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1293'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1293'][1].init(83, 63, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit1034_1293_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1292'][2].init(185, 51, 'styleValue.test && styleValue.test(actualAttrValue)');
function visit1033_1292_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1292'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1292'][1].init(104, 149, '(styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1032_1292_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1290'][2].init(78, 19, 'styleValue === NULL');
function visit1031_1290_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1290'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1290'][1].init(78, 254, 'styleValue === NULL || (styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1030_1290_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1285'][1].init(26, 17, 'i < styles.length');
function visit1029_1285_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1284'][1].init(1139, 6, 'styles');
function visit1028_1284_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1282'][1].init(1090, 32, 'overrides && overrides["styles"]');
function visit1027_1282_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1276'][3].init(110, 27, 'actualAttrValue == attValue');
function visit1026_1276_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1276'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1276'][2].init(79, 27, 'typeof attValue == \'string\'');
function visit1025_1276_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1276'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1276'][1].init(79, 58, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit1024_1276_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1275'][2].init(532, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit1023_1275_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1275'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1275'][1].init(47, 140, '(attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1022_1275_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1275'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1274'][2].init(482, 17, 'attValue === NULL');
function visit1021_1274_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1274'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1274'][1].init(482, 188, 'attValue === NULL || (attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1020_1274_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1274'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1262'][1].init(26, 21, 'i < attributes.length');
function visit1019_1262_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1261'][1].init(83, 10, 'attributes');
function visit1018_1261_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1261'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1259'][1].init(30, 36, 'overrides && overrides["attributes"]');
function visit1017_1259_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1243'][1].init(116, 6, 'i >= 0');
function visit1016_1243_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1241'][1].init(20, 35, 'overrideElement != style["element"]');
function visit1015_1241_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1241'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1233'][1].init(263, 8, '--i >= 0');
function visit1014_1233_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1233'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1208'][1].init(307, 41, 'removeEmpty || !!element.style(styleName)');
function visit1013_1208_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1204'][1].init(51, 100, 'element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1012_1204_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1203'][1].init(97, 152, 'style._.definition["fullMatch"] && element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1011_1203_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1195'][1].init(307, 41, 'removeEmpty || !!element.hasAttr(attName)');
function visit1010_1195_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1192'][1].init(75, 91, 'element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1009_1192_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1191'][3].init(84, 18, 'attName == \'class\'');
function visit1008_1191_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1191'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1191'][2].init(84, 53, 'attName == \'class\' || style._.definition["fullMatch"]');
function visit1007_1191_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1191'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1191'][1].init(84, 167, '(attName == \'class\' || style._.definition["fullMatch"]) && element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1006_1191_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1184'][1].init(466, 71, 'S.isEmptyObject(attributes) && S.isEmptyObject(styles)');
function visit1005_1184_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1182'][2].init(74, 20, 'overrides["*"] || {}');
function visit1004_1182_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1182'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1182'][1].init(40, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1003_1182_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1180'][2].init(78, 20, 'overrides["*"] || {}');
function visit1002_1180_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1180'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1180'][1].init(44, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1001_1180_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1161'][1].init(47, 35, 'overrideEl["styles"] || new Array()');
function visit1000_1161_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1156'][1].init(1755, 6, 'styles');
function visit999_1156_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1146'][1].init(51, 39, 'overrideEl["attributes"] || new Array()');
function visit998_1146_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1146'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1141'][1].init(1005, 5, 'attrs');
function visit997_1141_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1138'][1].init(898, 82, 'overrides[elementName] || (overrides[elementName] = {})');
function visit996_1138_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1124'][1].init(236, 27, 'typeof override == \'string\'');
function visit995_1124_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1117'][1].init(329, 21, 'i < definition.length');
function visit994_1117_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1113'][1].init(173, 22, '!S.isArray(definition)');
function visit993_1113_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1110'][1].init(201, 10, 'definition');
function visit992_1110_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1104'][1].init(14, 17, 'style._.overrides');
function visit991_1104_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1084'][1].init(18, 19, '!attribs[\'style\']');
function visit990_1084_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1084'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1083'][1].init(653, 9, 'styleText');
function visit989_1083_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1083'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1072'][1].init(342, 12, 'styleAttribs');
function visit988_1072_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1072'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1063'][1].init(118, 7, 'attribs');
function visit987_1063_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1063'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1043'][1].init(326, 24, 'temp.style.cssText || \'\'');
function visit986_1043_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1043'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1037'][1].init(43, 25, 'nativeNormalize !== FALSE');
function visit985_1037_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1027'][1].init(51, 27, 'target[name] == \'inherit\'');
function visit984_1027_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1027'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1026'][2].init(95, 27, 'source[name] == \'inherit\'');
function visit983_1026_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1026'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1026'][1].init(56, 79, 'source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit982_1026_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1026'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1025'][2].init(36, 32, 'target[name] == source[name]');
function visit981_1025_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1025'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1025'][1].init(36, 136, 'target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit980_1025_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1025'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1024'][2].init(126, 175, 'name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\')');
function visit979_1024_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1024'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1024'][1].init(123, 180, '!(name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'))');
function visit978_1024_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1024'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1019'][2].init(85, 25, 'typeof target == \'string\'');
function visit977_1019_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1019'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1019'][1].init(85, 64, 'typeof target == \'string\' && (target = parseStyleText(target))');
function visit976_1019_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1019'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1018'][2].init(10, 25, 'typeof source == \'string\'');
function visit975_1018_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1018'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1018'][1].init(10, 64, 'typeof source == \'string\' && (source = parseStyleText(source))');
function visit974_1018_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1018'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['993'][2].init(891, 49, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit973_993_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['993'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['993'][1].init(891, 106, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && nextNode.contains(startNode)');
function visit972_993_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['993'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['983'][1].init(57, 53, 'overrides[currentNode.nodeName()] || overrides["*"]');
function visit971_983_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['983'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['978'][1].init(99, 41, 'currentNode.nodeName() == this["element"]');
function visit970_978_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['978'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['975'][2].init(313, 52, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit969_975_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['975'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['975'][1].init(38, 116, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit968_975_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['975'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['974'][1].init(272, 155, 'currentNode[0] && currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit967_974_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['974'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['968'][1].init(1806, 29, 'currentNode[0] !== endNode[0]');
function visit966_968_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['968'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['960'][1].init(1119, 10, 'breakStart');
function visit965_960_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['960'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['958'][1].init(1032, 8, 'breakEnd');
function visit964_958_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['954'][1].init(225, 33, 'me.checkElementRemovable(element)');
function visit963_954_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['954'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['951'][1].init(52, 29, 'element == endPath.blockLimit');
function visit962_951_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['951'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['950'][2].init(82, 24, 'element == endPath.block');
function visit961_950_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['950'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['950'][1].init(82, 82, 'element == endPath.block || element == endPath.blockLimit');
function visit960_950_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['950'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['947'][1].init(650, 27, 'i < endPath.elements.length');
function visit959_947_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['944'][1].init(235, 33, 'me.checkElementRemovable(element)');
function visit958_944_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['944'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['941'][1].init(54, 31, 'element == startPath.blockLimit');
function visit957_941_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['941'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['940'][2].init(88, 26, 'element == startPath.block');
function visit956_940_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['940'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['940'][1].init(88, 86, 'element == startPath.block || element == startPath.blockLimit');
function visit955_940_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['940'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['937'][1].init(248, 29, 'i < startPath.elements.length');
function visit954_937_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['937'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['916'][1].init(1284, 9, 'UA.webkit');
function visit953_916_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['916'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['912'][1].init(65, 15, 'tmp == \'\\u200b\'');
function visit952_912_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['912'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['910'][1].init(1028, 81, '!tmp || tmp == \'\\u200b\'');
function visit951_910_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['910'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['905'][1].init(14, 32, 'boundaryElement.match == \'start\'');
function visit950_905_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['905'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['895'][1].init(247, 16, 'newElement.match');
function visit949_895_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['895'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['892'][1].init(89, 34, 'newElement.equals(boundaryElement)');
function visit948_892_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['892'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['888'][1].init(2671, 15, 'boundaryElement');
function visit947_888_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['888'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['876'][1].init(57, 51, '_overrides[element.nodeName()] || _overrides["*"]');
function visit946_876_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['876'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['873'][1].init(660, 34, 'element.nodeName() != this.element');
function visit945_873_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['873'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['859'][1].init(252, 30, 'startOfElement || endOfElement');
function visit944_859_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['859'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['857'][1].init(108, 94, '!endOfElement && range.checkBoundaryOfElement(element, KER.START)');
function visit943_857_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['857'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['855'][1].init(576, 35, 'this.checkElementRemovable(element)');
function visit942_855_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['855'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['852'][1].init(50, 31, 'element == startPath.blockLimit');
function visit941_852_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['852'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['851'][2].init(422, 26, 'element == startPath.block');
function visit940_851_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['851'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['851'][1].init(422, 82, 'element == startPath.block || element == startPath.blockLimit');
function visit939_851_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['851'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['842'][2].init(227, 29, 'i < startPath.elements.length');
function visit938_842_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['842'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['842'][1].init(227, 85, 'i < startPath.elements.length && (element = startPath.elements[i])');
function visit937_842_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['842'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['835'][1].init(316, 15, 'range.collapsed');
function visit936_835_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['835'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['790'][1].init(1185, 9, '!UA[\'ie\']');
function visit935_790_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['790'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['769'][1].init(2643, 9, 'styleNode');
function visit934_769_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['769'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['760'][1].init(1471, 30, '!styleNode._4e_hasAttributes()');
function visit933_760_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['752'][1].init(226, 35, 'styleNode.style(styleName) == value');
function visit932_752_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['748'][1].init(36, 110, 'removeList.blockedStyles[styleName] || !(value = parent.style(styleName))');
function visit931_748_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['735'][1].init(222, 32, 'styleNode.attr(attName) == value');
function visit930_735_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['735'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['731'][1].init(36, 106, 'removeList.blockedAttrs[attName] || !(value = parent.attr(styleName))');
function visit929_731_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['731'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['728'][1].init(26, 32, 'parent.nodeName() == elementName');
function visit928_728_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['728'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['727'][3].init(825, 25, 'styleNode[0] && parent[0]');
function visit927_727_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['727'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['727'][2].init(815, 35, 'parent && styleNode[0] && parent[0]');
function visit926_727_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['727'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['727'][1].init(802, 48, 'styleNode && parent && styleNode[0] && parent[0]');
function visit925_727_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['727'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['706'][2].init(6543, 35, 'styleRange && !styleRange.collapsed');
function visit924_706_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['706'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['706'][1].init(6529, 49, 'applyStyle && styleRange && !styleRange.collapsed');
function visit923_706_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['706'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['687'][1].init(468, 49, '!def["childRule"] || def["childRule"](parentNode)');
function visit922_687_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][2].init(1142, 426, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit921_680_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['680'][1].init(148, 520, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit920_680_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['678'][2].init(992, 104, '(parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]');
function visit919_678_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['678'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['678'][1].init(91, 669, '((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit918_678_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['677'][1].init(41, 761, '(applyStyle = !includedNode.next(notBookmark, 1)) && ((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit917_677_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['662'][2].init(68, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit916_662_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['662'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['662'][1].init(68, 74, 'nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length');
function visit915_662_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['661'][2].init(1311, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit914_661_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['661'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['661'][1].init(1311, 145, 'nodeType == Dom.NodeType.TEXT_NODE || (nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length)');
function visit913_661_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['646'][1].init(67, 447, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit912_646_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['645'][1].init(45, 515, '!DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit911_645_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['644'][1].init(45, 561, '!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit910_644_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['643'][1].init(342, 642, '!styleRange && (!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))');
function visit909_643_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['638'][1].init(163, 54, '!def["parentRule"] || def["parentRule"](currentParent)');
function visit908_638_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['635'][2].init(-1, 69, 'DTD[currentParent.nodeName()] || DTD["span"]');
function visit907_635_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['635'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['636'][1].init(-1, 131, '(DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement');
function visit906_636_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['635'][1].init(48, 220, '((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit905_635_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['634'][2].init(1285, 269, 'currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit904_634_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['634'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['634'][1].init(1268, 286, 'currentParent && currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit903_634_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['625'][1].init(46, 39, 'currentParent.nodeName() == elementName');
function visit902_625_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['624'][2].init(663, 18, 'elementName == "a"');
function visit901_624_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['624'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['624'][1].init(41, 86, 'elementName == "a" && currentParent.nodeName() == elementName');
function visit900_624_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['623'][1].init(619, 128, 'currentParent && elementName == "a" && currentParent.nodeName() == elementName');
function visit899_623_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['610'][1].init(412, 50, '!def["childRule"] || def["childRule"](currentNode)');
function visit898_610_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['603'][2].init(83, 382, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit897_603_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['603'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['603'][1].init(45, 465, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit896_603_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['602'][1].init(-1, 511, 'dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit895_602_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['601'][1].init(486, 570, '!nodeName || (dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode)))');
function visit894_601_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['595'][1].init(209, 44, 'nodeName && currentNode.attr(\'_ke_bookmark\')');
function visit893_595_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['592'][1].init(71, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit892_592_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['586'][1].init(57, 33, 'Dom.equals(currentNode, lastNode)');
function visit891_586_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['583'][1].init(1431, 29, 'currentNode && currentNode[0]');
function visit890_583_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['563'][1].init(782, 4, '!dtd');
function visit889_563_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['549'][1].init(82, 15, 'range.collapsed');
function visit888_549_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['524'][1].init(135, 7, '!offset');
function visit887_524_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['522'][1].init(22, 17, 'match.length == 1');
function visit886_522_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['512'][1].init(101, 19, 'i < preHTMLs.length');
function visit885_512_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['500'][1].init(812, 8, 'UA[\'ie\']');
function visit884_500_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['486'][1].init(98, 33, 'previousBlock.nodeName() == \'pre\'');
function visit883_486_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['485'][2].init(47, 132, '(previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\'');
function visit882_485_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['485'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['485'][1].init(42, 139, '!((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\')');
function visit881_485_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['476'][1].init(595, 13, 'newBlockIsPre');
function visit880_476_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['469'][1].init(312, 9, 'isFromPre');
function visit879_469_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['467'][1].init(236, 7, 'isToPre');
function visit878_467_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['465'][1].init(180, 28, '!newBlockIsPre && blockIsPre');
function visit877_465_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['464'][1].init(125, 28, 'newBlockIsPre && !blockIsPre');
function visit876_464_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['463'][1].init(75, 25, 'block.nodeName == (\'pre\')');
function visit875_463_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['462'][1].init(30, 28, 'newBlock.nodeName == (\'pre\')');
function visit874_462_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['424'][1].init(962, 8, 'UA[\'ie\']');
function visit873_424_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['397'][1].init(64, 27, 'm2 && (tailBookmark = m2)');
function visit872_397_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['396'][1].init(18, 27, 'm1 && (headBookmark = m1)');
function visit871_396_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['363'][1].init(384, 6, 'styles');
function visit870_363_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['355'][1].init(195, 10, 'attributes');
function visit869_355_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['343'][1].init(439, 7, 'element');
function visit868_343_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['336'][1].init(189, 18, 'elementName == \'*\'');
function visit867_336_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['321'][1].init(1091, 17, 'stylesText.length');
function visit866_321_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['312'][1].init(251, 21, 'styleVal == \'inherit\'');
function visit865_312_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['303'][1].init(428, 17, 'stylesText.length');
function visit864_303_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['299'][2].init(276, 90, 'styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']');
function visit863_299_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['299'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['299'][1].init(276, 98, '(styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']) || \'\'');
function visit862_299_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['293'][1].init(120, 9, 'stylesDef');
function visit861_293_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['281'][1].init(511, 41, 'this.checkElementRemovable(element, TRUE)');
function visit860_281_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['277'][2].init(335, 30, 'this.type == KEST.STYLE_OBJECT');
function visit859_277_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['277'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['277'][1].init(335, 104, 'this.type == KEST.STYLE_OBJECT && !(element.nodeName() in objectElements)');
function visit858_277_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['273'][1].init(64, 114, 'Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit)');
function visit857_273_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['272'][2].init(82, 30, 'this.type == KEST.STYLE_INLINE');
function visit856_272_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['272'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['272'][1].init(82, 181, 'this.type == KEST.STYLE_INLINE && (Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))');
function visit855_272_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['269'][1].init(132, 19, 'i < elements.length');
function visit854_269_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['261'][1].init(78, 68, 'elementPath.block || elementPath.blockLimit');
function visit853_261_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][1].init(134, 52, 'styleValue.test && styleValue.test(actualStyleValue)');
function visit852_245_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][1].init(65, 30, 'actualStyleValue == styleValue');
function visit851_244_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['243'][3].init(270, 29, 'typeof styleValue == \'string\'');
function visit850_243_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['243'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['243'][2].init(270, 96, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit849_243_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['243'][1].init(173, 187, '(typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit848_243_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['240'][2].init(94, 19, 'styleValue === NULL');
function visit847_240_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['240'][1].init(94, 361, 'styleValue === NULL || (typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit846_240_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['238'][1].init(157, 16, 'actualStyleValue');
function visit845_238_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['235'][1].init(34, 17, 'i < styles.length');
function visit844_235_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['234'][1].init(1421, 6, 'styles');
function visit843_234_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['229'][1].init(133, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit842_229_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['228'][1].init(67, 27, 'actualAttrValue == attValue');
function visit841_228_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['227'][3].init(598, 27, 'typeof attValue == \'string\'');
function visit840_227_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['227'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['227'][2].init(598, 95, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit839_227_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['227'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['227'][1].init(55, 181, '(typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit838_227_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['226'][2].init(540, 17, 'attValue === NULL');
function visit837_226_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['226'][1].init(540, 237, 'attValue === NULL || (typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit836_226_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['218'][1].init(150, 15, 'actualAttrValue');
function visit835_218_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['215'][1].init(38, 18, 'i < attribs.length');
function visit834_215_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['214'][1].init(264, 7, 'attribs');
function visit833_214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['210'][1].init(98, 87, '!(attribs = override.attributes) && !(styles = override.styles)');
function visit832_210_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['208'][1].init(1610, 8, 'override');
function visit831_208_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['206'][1].init(63, 49, 'overrides[element.nodeName()] || overrides["*"]');
function visit830_206_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['197'][1].init(728, 9, 'fullMatch');
function visit829_197_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['193'][1].init(573, 9, 'fullMatch');
function visit828_193_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['190'][1].init(34, 10, '!fullMatch');
function visit827_190_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['189'][1].init(186, 33, 'attribs[attName] == elementAttr');
function visit826_189_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['186'][2].init(196, 18, 'attName == \'style\'');
function visit825_186_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['186'][1].init(196, 220, 'attName == \'style\' ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : attribs[attName] == elementAttr');
function visit824_186_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['185'][1].init(138, 27, 'element.attr(attName) || \'\'');
function visit823_185_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['182'][1].init(32, 20, 'attName == \'_length\'');
function visit822_182_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['179'][1].init(250, 18, 'attribs["_length"]');
function visit821_179_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['174'][1].init(87, 42, '!fullMatch && !element._4e_hasAttributes()');
function visit820_174_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['172'][1].init(223, 34, 'element.nodeName() == this.element');
function visit819_172_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['165'][1].init(18, 8, '!element');
function visit818_165_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['157'][1].init(39, 30, 'self.type == KEST.STYLE_INLINE');
function visit817_157_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['147'][1].init(91, 30, 'self.type == KEST.STYLE_OBJECT');
function visit816_147_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['145'][1].init(93, 29, 'self.type == KEST.STYLE_BLOCK');
function visit815_145_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['143'][1].init(36, 30, 'this.type == KEST.STYLE_INLINE');
function visit814_143_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['122'][1].init(458, 17, 'i < ranges.length');
function visit813_122_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['101'][2].init(317, 18, 'element == \'#text\'');
function visit812_101_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['101'][1].init(317, 46, 'element == \'#text\' || blockElements[element]');
function visit811_101_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['99'][1].init(226, 33, 'styleDefinition["element"] || \'*\'');
function visit810_99_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['94'][1].init(14, 15, 'variablesValues');
function visit809_94_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['77'][1].init(18, 33, 'typeof (list[item]) == \'string\'');
function visit808_77_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].lineData[10]++;
KISSY.add("editor/styles", function(S, Editor) {
  _$jscoverage['/editor/styles.js'].functionData[0]++;
  _$jscoverage['/editor/styles.js'].lineData[11]++;
  var TRUE = true, FALSE = false, NULL = null, $ = S.all, Dom = S.DOM, KER = Editor.RangeType, KESelection = Editor.Selection, KEP = Editor.PositionType, KERange = Editor.Range, Node = S.Node, UA = S.UA, ElementPath = Editor.ElementPath, blockElements = {
  "address": 1, 
  "div": 1, 
  "h1": 1, 
  "h2": 1, 
  "h3": 1, 
  "h4": 1, 
  "h5": 1, 
  "h6": 1, 
  "p": 1, 
  "pre": 1}, DTD = Editor.XHTML_DTD, objectElements = {
  "embed": 1, 
  "hr": 1, 
  "img": 1, 
  "li": 1, 
  "object": 1, 
  "ol": 1, 
  "table": 1, 
  "td": 1, 
  "tr": 1, 
  "th": 1, 
  "ul": 1, 
  "dl": 1, 
  "dt": 1, 
  "dd": 1, 
  "form": 1}, semicolonFixRegex = /\s*(?:;\s*|$)/g, varRegex = /#\((.+?)\)/g;
  _$jscoverage['/editor/styles.js'].lineData[63]++;
  Editor.StyleType = KEST = {
  STYLE_BLOCK: 1, 
  STYLE_INLINE: 2, 
  STYLE_OBJECT: 3};
  _$jscoverage['/editor/styles.js'].lineData[69]++;
  function notBookmark(node) {
    _$jscoverage['/editor/styles.js'].functionData[1]++;
    _$jscoverage['/editor/styles.js'].lineData[72]++;
    return !Dom.attr(node, "_ke_bookmark");
  }
  _$jscoverage['/editor/styles.js'].lineData[75]++;
  function replaceVariables(list, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[2]++;
    _$jscoverage['/editor/styles.js'].lineData[76]++;
    for (var item in list) {
      _$jscoverage['/editor/styles.js'].lineData[77]++;
      if (visit808_77_1(typeof (list[item]) == 'string')) {
        _$jscoverage['/editor/styles.js'].lineData[78]++;
        list[item] = list[item].replace(varRegex, function(match, varName) {
  _$jscoverage['/editor/styles.js'].functionData[3]++;
  _$jscoverage['/editor/styles.js'].lineData[79]++;
  return variablesValues[varName];
});
      } else {
        _$jscoverage['/editor/styles.js'].lineData[82]++;
        replaceVariables(list[item], variablesValues);
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[93]++;
  function KEStyle(styleDefinition, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[4]++;
    _$jscoverage['/editor/styles.js'].lineData[94]++;
    if (visit809_94_1(variablesValues)) {
      _$jscoverage['/editor/styles.js'].lineData[95]++;
      styleDefinition = S.clone(styleDefinition);
      _$jscoverage['/editor/styles.js'].lineData[96]++;
      replaceVariables(styleDefinition, variablesValues);
    }
    _$jscoverage['/editor/styles.js'].lineData[99]++;
    var element = this["element"] = this.element = (visit810_99_1(styleDefinition["element"] || '*')).toLowerCase();
    _$jscoverage['/editor/styles.js'].lineData[101]++;
    this["type"] = this.type = (visit811_101_1(visit812_101_2(element == '#text') || blockElements[element])) ? KEST.STYLE_BLOCK : objectElements[element] ? KEST.STYLE_OBJECT : KEST.STYLE_INLINE;
    _$jscoverage['/editor/styles.js'].lineData[106]++;
    this._ = {
  "definition": styleDefinition};
  }
  _$jscoverage['/editor/styles.js'].lineData[111]++;
  function applyStyle(document, remove) {
    _$jscoverage['/editor/styles.js'].functionData[5]++;
    _$jscoverage['/editor/styles.js'].lineData[113]++;
    var self = this, func = remove ? self.removeFromRange : self.applyToRange;
    _$jscoverage['/editor/styles.js'].lineData[117]++;
    document.body.focus();
    _$jscoverage['/editor/styles.js'].lineData[119]++;
    var selection = new KESelection(document);
    _$jscoverage['/editor/styles.js'].lineData[121]++;
    var ranges = selection.getRanges();
    _$jscoverage['/editor/styles.js'].lineData[122]++;
    for (var i = 0; visit813_122_1(i < ranges.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[124]++;
      func.call(self, ranges[i]);
    }
    _$jscoverage['/editor/styles.js'].lineData[126]++;
    selection.selectRanges(ranges);
  }
  _$jscoverage['/editor/styles.js'].lineData[129]++;
  KEStyle.prototype = {
  constructor: KEStyle, 
  apply: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[6]++;
  _$jscoverage['/editor/styles.js'].lineData[133]++;
  applyStyle.call(this, document, FALSE);
}, 
  remove: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[7]++;
  _$jscoverage['/editor/styles.js'].lineData[137]++;
  applyStyle.call(this, document, TRUE);
}, 
  applyToRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[8]++;
  _$jscoverage['/editor/styles.js'].lineData[141]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[142]++;
  return (self.applyToRange = visit814_143_1(this.type == KEST.STYLE_INLINE) ? applyInlineStyle : visit815_145_1(self.type == KEST.STYLE_BLOCK) ? applyBlockStyle : visit816_147_1(self.type == KEST.STYLE_OBJECT) ? NULL : NULL).call(self, range);
}, 
  removeFromRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[9]++;
  _$jscoverage['/editor/styles.js'].lineData[155]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[156]++;
  return (self.removeFromRange = visit817_157_1(self.type == KEST.STYLE_INLINE) ? removeInlineStyle : NULL).call(self, range);
}, 
  checkElementRemovable: function(element, fullMatch) {
  _$jscoverage['/editor/styles.js'].functionData[10]++;
  _$jscoverage['/editor/styles.js'].lineData[165]++;
  if (visit818_165_1(!element)) {
    _$jscoverage['/editor/styles.js'].lineData[166]++;
    return FALSE;
  }
  _$jscoverage['/editor/styles.js'].lineData[168]++;
  var def = this._.definition, attribs, styles;
  _$jscoverage['/editor/styles.js'].lineData[172]++;
  if (visit819_172_1(element.nodeName() == this.element)) {
    _$jscoverage['/editor/styles.js'].lineData[174]++;
    if (visit820_174_1(!fullMatch && !element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[175]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[177]++;
    attribs = getAttributesForComparison(def);
    _$jscoverage['/editor/styles.js'].lineData[179]++;
    if (visit821_179_1(attribs["_length"])) {
      _$jscoverage['/editor/styles.js'].lineData[180]++;
      for (var attName in attribs) {
        _$jscoverage['/editor/styles.js'].lineData[182]++;
        if (visit822_182_1(attName == '_length')) {
          _$jscoverage['/editor/styles.js'].lineData[183]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[185]++;
        var elementAttr = visit823_185_1(element.attr(attName) || '');
        _$jscoverage['/editor/styles.js'].lineData[186]++;
        if (visit824_186_1(visit825_186_2(attName == 'style') ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : visit826_189_1(attribs[attName] == elementAttr))) {
          _$jscoverage['/editor/styles.js'].lineData[190]++;
          if (visit827_190_1(!fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[191]++;
            return TRUE;
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[193]++;
          if (visit828_193_1(fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[194]++;
            return FALSE;
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[197]++;
      if (visit829_197_1(fullMatch)) {
        _$jscoverage['/editor/styles.js'].lineData[198]++;
        return TRUE;
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[201]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[205]++;
  var overrides = getOverrides(this), override = visit830_206_1(overrides[element.nodeName()] || overrides["*"]);
  _$jscoverage['/editor/styles.js'].lineData[208]++;
  if (visit831_208_1(override)) {
    _$jscoverage['/editor/styles.js'].lineData[210]++;
    if (visit832_210_1(!(attribs = override.attributes) && !(styles = override.styles))) {
      _$jscoverage['/editor/styles.js'].lineData[213]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[214]++;
    if (visit833_214_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[215]++;
      for (var i = 0; visit834_215_1(i < attribs.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[216]++;
        attName = attribs[i][0];
        _$jscoverage['/editor/styles.js'].lineData[217]++;
        var actualAttrValue = element.attr(attName);
        _$jscoverage['/editor/styles.js'].lineData[218]++;
        if (visit835_218_1(actualAttrValue)) {
          _$jscoverage['/editor/styles.js'].lineData[219]++;
          var attValue = attribs[i][1];
          _$jscoverage['/editor/styles.js'].lineData[226]++;
          if (visit836_226_1(visit837_226_2(attValue === NULL) || visit838_227_1((visit839_227_2(visit840_227_3(typeof attValue == 'string') && visit841_228_1(actualAttrValue == attValue))) || visit842_229_1(attValue.test && attValue.test(actualAttrValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[230]++;
            return TRUE;
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[234]++;
    if (visit843_234_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[235]++;
      for (i = 0; visit844_235_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[236]++;
        var styleName = styles[i][0];
        _$jscoverage['/editor/styles.js'].lineData[237]++;
        var actualStyleValue = element.css(styleName);
        _$jscoverage['/editor/styles.js'].lineData[238]++;
        if (visit845_238_1(actualStyleValue)) {
          _$jscoverage['/editor/styles.js'].lineData[239]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[240]++;
          if (visit846_240_1(visit847_240_2(styleValue === NULL) || visit848_243_1((visit849_243_2(visit850_243_3(typeof styleValue == 'string') && visit851_244_1(actualStyleValue == styleValue))) || visit852_245_1(styleValue.test && styleValue.test(actualStyleValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[246]++;
            return TRUE;
          }
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[251]++;
  return FALSE;
}, 
  checkActive: function(elementPath) {
  _$jscoverage['/editor/styles.js'].functionData[11]++;
  _$jscoverage['/editor/styles.js'].lineData[259]++;
  switch (this.type) {
    case KEST.STYLE_BLOCK:
      _$jscoverage['/editor/styles.js'].lineData[261]++;
      return this.checkElementRemovable(visit853_261_1(elementPath.block || elementPath.blockLimit), TRUE);
    case KEST.STYLE_OBJECT:
    case KEST.STYLE_INLINE:
      _$jscoverage['/editor/styles.js'].lineData[267]++;
      var elements = elementPath.elements;
      _$jscoverage['/editor/styles.js'].lineData[269]++;
      for (var i = 0, element; visit854_269_1(i < elements.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[270]++;
        element = elements[i];
        _$jscoverage['/editor/styles.js'].lineData[272]++;
        if (visit855_272_1(visit856_272_2(this.type == KEST.STYLE_INLINE) && (visit857_273_1(Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))))) {
          _$jscoverage['/editor/styles.js'].lineData[275]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[277]++;
        if (visit858_277_1(visit859_277_2(this.type == KEST.STYLE_OBJECT) && !(element.nodeName() in objectElements))) {
          _$jscoverage['/editor/styles.js'].lineData[279]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[281]++;
        if (visit860_281_1(this.checkElementRemovable(element, TRUE))) {
          _$jscoverage['/editor/styles.js'].lineData[282]++;
          return TRUE;
        }
      }
  }
  _$jscoverage['/editor/styles.js'].lineData[285]++;
  return FALSE;
}};
  _$jscoverage['/editor/styles.js'].lineData[290]++;
  KEStyle.getStyleText = function(styleDefinition) {
  _$jscoverage['/editor/styles.js'].functionData[12]++;
  _$jscoverage['/editor/styles.js'].lineData[292]++;
  var stylesDef = styleDefinition._ST;
  _$jscoverage['/editor/styles.js'].lineData[293]++;
  if (visit861_293_1(stylesDef)) {
    _$jscoverage['/editor/styles.js'].lineData[294]++;
    return stylesDef;
  }
  _$jscoverage['/editor/styles.js'].lineData[296]++;
  stylesDef = styleDefinition["styles"];
  _$jscoverage['/editor/styles.js'].lineData[299]++;
  var stylesText = visit862_299_1((visit863_299_2(styleDefinition["attributes"] && styleDefinition["attributes"]['style'])) || ''), specialStylesText = '';
  _$jscoverage['/editor/styles.js'].lineData[303]++;
  if (visit864_303_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[304]++;
    stylesText = stylesText.replace(semicolonFixRegex, ';');
  }
  _$jscoverage['/editor/styles.js'].lineData[306]++;
  for (var style in stylesDef) {
    _$jscoverage['/editor/styles.js'].lineData[308]++;
    var styleVal = stylesDef[style], text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');
    _$jscoverage['/editor/styles.js'].lineData[312]++;
    if (visit865_312_1(styleVal == 'inherit')) {
      _$jscoverage['/editor/styles.js'].lineData[313]++;
      specialStylesText += text;
    } else {
      _$jscoverage['/editor/styles.js'].lineData[315]++;
      stylesText += text;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[321]++;
  if (visit866_321_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[322]++;
    stylesText = normalizeCssText(stylesText);
  }
  _$jscoverage['/editor/styles.js'].lineData[324]++;
  stylesText += specialStylesText;
  _$jscoverage['/editor/styles.js'].lineData[327]++;
  return (styleDefinition._ST = stylesText);
};
  _$jscoverage['/editor/styles.js'].lineData[330]++;
  function getElement(style, targetDocument, element) {
    _$jscoverage['/editor/styles.js'].functionData[13]++;
    _$jscoverage['/editor/styles.js'].lineData[331]++;
    var el, elementName = style["element"];
    _$jscoverage['/editor/styles.js'].lineData[336]++;
    if (visit867_336_1(elementName == '*')) {
      _$jscoverage['/editor/styles.js'].lineData[337]++;
      elementName = 'span';
    }
    _$jscoverage['/editor/styles.js'].lineData[340]++;
    el = new Node(targetDocument.createElement(elementName));
    _$jscoverage['/editor/styles.js'].lineData[343]++;
    if (visit868_343_1(element)) {
      _$jscoverage['/editor/styles.js'].lineData[344]++;
      element._4e_copyAttributes(el);
    }
    _$jscoverage['/editor/styles.js'].lineData[346]++;
    return setupElement(el, style);
  }
  _$jscoverage['/editor/styles.js'].lineData[349]++;
  function setupElement(el, style) {
    _$jscoverage['/editor/styles.js'].functionData[14]++;
    _$jscoverage['/editor/styles.js'].lineData[350]++;
    var def = style._["definition"], attributes = def["attributes"], styles = KEStyle.getStyleText(def);
    _$jscoverage['/editor/styles.js'].lineData[355]++;
    if (visit869_355_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[356]++;
      for (var att in attributes) {
        _$jscoverage['/editor/styles.js'].lineData[357]++;
        el.attr(att, attributes[att]);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[363]++;
    if (visit870_363_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[364]++;
      el[0].style.cssText = styles;
    }
    _$jscoverage['/editor/styles.js'].lineData[366]++;
    return el;
  }
  _$jscoverage['/editor/styles.js'].lineData[369]++;
  function applyBlockStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[15]++;
    _$jscoverage['/editor/styles.js'].lineData[372]++;
    var bookmark = range.createBookmark(TRUE), iterator = range.createIterator();
    _$jscoverage['/editor/styles.js'].lineData[374]++;
    iterator.enforceRealBlocks = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[378]++;
    iterator.enlargeBr = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[380]++;
    var block, doc = range.document;
    _$jscoverage['/editor/styles.js'].lineData[382]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/editor/styles.js'].lineData[383]++;
      var newBlock = getElement(this, doc, block);
      _$jscoverage['/editor/styles.js'].lineData[384]++;
      replaceBlock(block, newBlock);
    }
    _$jscoverage['/editor/styles.js'].lineData[386]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[390]++;
  function replace(str, regexp, replacement) {
    _$jscoverage['/editor/styles.js'].functionData[16]++;
    _$jscoverage['/editor/styles.js'].lineData[391]++;
    var headBookmark = '', tailBookmark = '';
    _$jscoverage['/editor/styles.js'].lineData[394]++;
    str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi, function(str, m1, m2) {
  _$jscoverage['/editor/styles.js'].functionData[17]++;
  _$jscoverage['/editor/styles.js'].lineData[396]++;
  visit871_396_1(m1 && (headBookmark = m1));
  _$jscoverage['/editor/styles.js'].lineData[397]++;
  visit872_397_1(m2 && (tailBookmark = m2));
  _$jscoverage['/editor/styles.js'].lineData[398]++;
  return '';
});
    _$jscoverage['/editor/styles.js'].lineData[400]++;
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }
  _$jscoverage['/editor/styles.js'].lineData[406]++;
  function toPre(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[18]++;
    _$jscoverage['/editor/styles.js'].lineData[408]++;
    var preHTML = block.html();
    _$jscoverage['/editor/styles.js'].lineData[411]++;
    preHTML = replace(preHTML, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
    _$jscoverage['/editor/styles.js'].lineData[414]++;
    preHTML = preHTML.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
    _$jscoverage['/editor/styles.js'].lineData[418]++;
    preHTML = preHTML.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
    _$jscoverage['/editor/styles.js'].lineData[421]++;
    preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');
    _$jscoverage['/editor/styles.js'].lineData[424]++;
    if (visit873_424_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[425]++;
      var temp = block[0].ownerDocument.createElement('div');
      _$jscoverage['/editor/styles.js'].lineData[426]++;
      temp.appendChild(newBlock[0]);
      _$jscoverage['/editor/styles.js'].lineData[427]++;
      newBlock.outerHtml('<pre>' + preHTML + '</pre>');
      _$jscoverage['/editor/styles.js'].lineData[428]++;
      newBlock = new Node(temp.firstChild);
      _$jscoverage['/editor/styles.js'].lineData[429]++;
      newBlock._4e_remove();
    } else {
      _$jscoverage['/editor/styles.js'].lineData[432]++;
      newBlock.html(preHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[434]++;
    return newBlock;
  }
  _$jscoverage['/editor/styles.js'].lineData[439]++;
  function splitIntoPres(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[19]++;
    _$jscoverage['/editor/styles.js'].lineData[442]++;
    var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi, splittedHTML = replace(preBlock.outerHtml(), duoBrRegex, function(match, charBefore, bookmark) {
  _$jscoverage['/editor/styles.js'].functionData[20]++;
  _$jscoverage['/editor/styles.js'].lineData[447]++;
  return charBefore + '</pre>' + bookmark + '<pre>';
});
    _$jscoverage['/editor/styles.js'].lineData[450]++;
    var pres = [];
    _$jscoverage['/editor/styles.js'].lineData[451]++;
    splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
  _$jscoverage['/editor/styles.js'].functionData[21]++;
  _$jscoverage['/editor/styles.js'].lineData[453]++;
  pres.push(preContent);
});
    _$jscoverage['/editor/styles.js'].lineData[455]++;
    return pres;
  }
  _$jscoverage['/editor/styles.js'].lineData[461]++;
  function replaceBlock(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[22]++;
    _$jscoverage['/editor/styles.js'].lineData[462]++;
    var newBlockIsPre = visit874_462_1(newBlock.nodeName == ('pre')), blockIsPre = visit875_463_1(block.nodeName == ('pre')), isToPre = visit876_464_1(newBlockIsPre && !blockIsPre), isFromPre = visit877_465_1(!newBlockIsPre && blockIsPre);
    _$jscoverage['/editor/styles.js'].lineData[467]++;
    if (visit878_467_1(isToPre)) {
      _$jscoverage['/editor/styles.js'].lineData[468]++;
      newBlock = toPre(block, newBlock);
    } else {
      _$jscoverage['/editor/styles.js'].lineData[469]++;
      if (visit879_469_1(isFromPre)) {
        _$jscoverage['/editor/styles.js'].lineData[471]++;
        newBlock = fromPres(splitIntoPres(block), newBlock);
      } else {
        _$jscoverage['/editor/styles.js'].lineData[473]++;
        block._4e_moveChildren(newBlock);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[475]++;
    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    _$jscoverage['/editor/styles.js'].lineData[476]++;
    if (visit880_476_1(newBlockIsPre)) {
      _$jscoverage['/editor/styles.js'].lineData[478]++;
      mergePre(newBlock);
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[483]++;
  function mergePre(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[23]++;
    _$jscoverage['/editor/styles.js'].lineData[484]++;
    var previousBlock;
    _$jscoverage['/editor/styles.js'].lineData[485]++;
    if (visit881_485_1(!(visit882_485_2((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && visit883_486_1(previousBlock.nodeName() == 'pre'))))) {
      _$jscoverage['/editor/styles.js'].lineData[487]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[496]++;
    var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' + replace(preBlock.html(), /^\n/, '');
    _$jscoverage['/editor/styles.js'].lineData[500]++;
    if (visit884_500_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[501]++;
      preBlock.outerHtml('<pre>' + mergedHTML + '</pre>');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[503]++;
      preBlock.html(mergedHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[505]++;
    previousBlock._4e_remove();
  }
  _$jscoverage['/editor/styles.js'].lineData[510]++;
  function fromPres(preHTMLs, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[24]++;
    _$jscoverage['/editor/styles.js'].lineData[511]++;
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    _$jscoverage['/editor/styles.js'].lineData[512]++;
    for (var i = 0; visit885_512_1(i < preHTMLs.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[513]++;
      var blockHTML = preHTMLs[i];
      _$jscoverage['/editor/styles.js'].lineData[517]++;
      blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
      _$jscoverage['/editor/styles.js'].lineData[518]++;
      blockHTML = replace(blockHTML, /^[ \t]*\n/, '');
      _$jscoverage['/editor/styles.js'].lineData[519]++;
      blockHTML = replace(blockHTML, /\n$/, '');
      _$jscoverage['/editor/styles.js'].lineData[521]++;
      blockHTML = replace(blockHTML, /^[ \t]+|[ \t]+$/g, function(match, offset) {
  _$jscoverage['/editor/styles.js'].functionData[25]++;
  _$jscoverage['/editor/styles.js'].lineData[522]++;
  if (visit886_522_1(match.length == 1)) {
    _$jscoverage['/editor/styles.js'].lineData[523]++;
    return '&nbsp;';
  } else {
    _$jscoverage['/editor/styles.js'].lineData[524]++;
    if (visit887_524_1(!offset)) {
      _$jscoverage['/editor/styles.js'].lineData[525]++;
      return new Array(match.length).join('&nbsp;') + ' ';
    } else {
      _$jscoverage['/editor/styles.js'].lineData[527]++;
      return ' ' + new Array(match.length).join('&nbsp;');
    }
  }
});
      _$jscoverage['/editor/styles.js'].lineData[532]++;
      blockHTML = blockHTML.replace(/\n/g, '<br>');
      _$jscoverage['/editor/styles.js'].lineData[533]++;
      blockHTML = blockHTML.replace(/[ \t]{2,}/g, function(match) {
  _$jscoverage['/editor/styles.js'].functionData[26]++;
  _$jscoverage['/editor/styles.js'].lineData[535]++;
  return new Array(match.length).join('&nbsp;') + ' ';
});
      _$jscoverage['/editor/styles.js'].lineData[538]++;
      var newBlockClone = newBlock.clone();
      _$jscoverage['/editor/styles.js'].lineData[539]++;
      newBlockClone.html(blockHTML);
      _$jscoverage['/editor/styles.js'].lineData[540]++;
      docFrag.appendChild(newBlockClone[0]);
    }
    _$jscoverage['/editor/styles.js'].lineData[542]++;
    return docFrag;
  }
  _$jscoverage['/editor/styles.js'].lineData[545]++;
  function applyInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[27]++;
    _$jscoverage['/editor/styles.js'].lineData[546]++;
    var self = this, document = range.document;
    _$jscoverage['/editor/styles.js'].lineData[549]++;
    if (visit888_549_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[551]++;
      var collapsedElement = getElement(this, document, undefined);
      _$jscoverage['/editor/styles.js'].lineData[553]++;
      range.insertNode(collapsedElement);
      _$jscoverage['/editor/styles.js'].lineData[555]++;
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/styles.js'].lineData[556]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[558]++;
    var elementName = this["element"], def = this._["definition"], isUnknownElement, dtd = DTD[elementName];
    _$jscoverage['/editor/styles.js'].lineData[563]++;
    if (visit889_563_1(!dtd)) {
      _$jscoverage['/editor/styles.js'].lineData[564]++;
      isUnknownElement = TRUE;
      _$jscoverage['/editor/styles.js'].lineData[565]++;
      dtd = DTD["span"];
    }
    _$jscoverage['/editor/styles.js'].lineData[569]++;
    var bookmark = range.createBookmark();
    _$jscoverage['/editor/styles.js'].lineData[572]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[573]++;
    range.trim();
    _$jscoverage['/editor/styles.js'].lineData[577]++;
    var boundaryNodes = range.createBookmark(), firstNode = boundaryNodes.startNode, lastNode = boundaryNodes.endNode, currentNode = firstNode, styleRange;
    _$jscoverage['/editor/styles.js'].lineData[583]++;
    while (visit890_583_1(currentNode && currentNode[0])) {
      _$jscoverage['/editor/styles.js'].lineData[584]++;
      var applyStyle = FALSE;
      _$jscoverage['/editor/styles.js'].lineData[586]++;
      if (visit891_586_1(Dom.equals(currentNode, lastNode))) {
        _$jscoverage['/editor/styles.js'].lineData[587]++;
        currentNode = NULL;
        _$jscoverage['/editor/styles.js'].lineData[588]++;
        applyStyle = TRUE;
      } else {
        _$jscoverage['/editor/styles.js'].lineData[591]++;
        var nodeType = currentNode[0].nodeType, nodeName = visit892_592_1(nodeType == Dom.NodeType.ELEMENT_NODE) ? currentNode.nodeName() : NULL;
        _$jscoverage['/editor/styles.js'].lineData[595]++;
        if (visit893_595_1(nodeName && currentNode.attr('_ke_bookmark'))) {
          _$jscoverage['/editor/styles.js'].lineData[596]++;
          currentNode = currentNode._4e_nextSourceNode(TRUE);
          _$jscoverage['/editor/styles.js'].lineData[597]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[601]++;
        if (visit894_601_1(!nodeName || (visit895_602_1(dtd[nodeName] && visit896_603_1(visit897_603_2((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit898_610_1(!def["childRule"] || def["childRule"](currentNode)))))))) {
          _$jscoverage['/editor/styles.js'].lineData[612]++;
          var currentParent = currentNode.parent();
          _$jscoverage['/editor/styles.js'].lineData[623]++;
          if (visit899_623_1(currentParent && visit900_624_1(visit901_624_2(elementName == "a") && visit902_625_1(currentParent.nodeName() == elementName)))) {
            _$jscoverage['/editor/styles.js'].lineData[626]++;
            var tmpANode = getElement(self, document, undefined);
            _$jscoverage['/editor/styles.js'].lineData[627]++;
            currentParent._4e_moveChildren(tmpANode);
            _$jscoverage['/editor/styles.js'].lineData[628]++;
            currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
            _$jscoverage['/editor/styles.js'].lineData[629]++;
            tmpANode._4e_mergeSiblings();
          } else {
            _$jscoverage['/editor/styles.js'].lineData[634]++;
            if (visit903_634_1(currentParent && visit904_634_2(currentParent[0] && visit905_635_1((visit906_636_1((visit907_635_2(DTD[currentParent.nodeName()] || DTD["span"]))[elementName] || isUnknownElement)) && (visit908_638_1(!def["parentRule"] || def["parentRule"](currentParent))))))) {
              _$jscoverage['/editor/styles.js'].lineData[643]++;
              if (visit909_643_1(!styleRange && (visit910_644_1(!nodeName || visit911_645_1(!DTD.$removeEmpty[nodeName] || visit912_646_1((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))))))) {
                _$jscoverage['/editor/styles.js'].lineData[655]++;
                styleRange = new KERange(document);
                _$jscoverage['/editor/styles.js'].lineData[656]++;
                styleRange.setStartBefore(currentNode);
              }
              _$jscoverage['/editor/styles.js'].lineData[661]++;
              if (visit913_661_1(visit914_661_2(nodeType == Dom.NodeType.TEXT_NODE) || (visit915_662_1(visit916_662_2(nodeType == Dom.NodeType.ELEMENT_NODE) && !currentNode[0].childNodes.length)))) {
                _$jscoverage['/editor/styles.js'].lineData[663]++;
                var includedNode = currentNode, parentNode = null;
                _$jscoverage['/editor/styles.js'].lineData[676]++;
                while (visit917_677_1((applyStyle = !includedNode.next(notBookmark, 1)) && visit918_678_1((visit919_678_2((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()])) && visit920_680_1(visit921_680_2((parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit922_687_1(!def["childRule"] || def["childRule"](parentNode))))))) {
                  _$jscoverage['/editor/styles.js'].lineData[688]++;
                  includedNode = parentNode;
                }
                _$jscoverage['/editor/styles.js'].lineData[691]++;
                styleRange.setEndAfter(includedNode);
              }
            } else {
              _$jscoverage['/editor/styles.js'].lineData[696]++;
              applyStyle = TRUE;
            }
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[699]++;
          applyStyle = TRUE;
        }
        _$jscoverage['/editor/styles.js'].lineData[702]++;
        currentNode = currentNode._4e_nextSourceNode();
      }
      _$jscoverage['/editor/styles.js'].lineData[706]++;
      if (visit923_706_1(applyStyle && visit924_706_2(styleRange && !styleRange.collapsed))) {
        _$jscoverage['/editor/styles.js'].lineData[708]++;
        var styleNode = getElement(self, document, undefined), parent = styleRange.getCommonAncestor();
        _$jscoverage['/editor/styles.js'].lineData[714]++;
        var removeList = {
  styles: {}, 
  attrs: {}, 
  blockedStyles: {}, 
  blockedAttrs: {}};
        _$jscoverage['/editor/styles.js'].lineData[723]++;
        var attName, styleName = null, value;
        _$jscoverage['/editor/styles.js'].lineData[727]++;
        while (visit925_727_1(styleNode && visit926_727_2(parent && visit927_727_3(styleNode[0] && parent[0])))) {
          _$jscoverage['/editor/styles.js'].lineData[728]++;
          if (visit928_728_1(parent.nodeName() == elementName)) {
            _$jscoverage['/editor/styles.js'].lineData[729]++;
            for (attName in def.attributes) {
              _$jscoverage['/editor/styles.js'].lineData[731]++;
              if (visit929_731_1(removeList.blockedAttrs[attName] || !(value = parent.attr(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[733]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[735]++;
              if (visit930_735_1(styleNode.attr(attName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[737]++;
                styleNode.removeAttr(attName);
              } else {
                _$jscoverage['/editor/styles.js'].lineData[739]++;
                removeList.blockedAttrs[attName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[746]++;
            for (styleName in def.styles) {
              _$jscoverage['/editor/styles.js'].lineData[748]++;
              if (visit931_748_1(removeList.blockedStyles[styleName] || !(value = parent.style(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[750]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[752]++;
              if (visit932_752_1(styleNode.style(styleName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[754]++;
                styleNode.style(styleName, "");
              } else {
                _$jscoverage['/editor/styles.js'].lineData[756]++;
                removeList.blockedStyles[styleName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[760]++;
            if (visit933_760_1(!styleNode._4e_hasAttributes())) {
              _$jscoverage['/editor/styles.js'].lineData[761]++;
              styleNode = NULL;
              _$jscoverage['/editor/styles.js'].lineData[762]++;
              break;
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[766]++;
          parent = parent.parent();
        }
        _$jscoverage['/editor/styles.js'].lineData[769]++;
        if (visit934_769_1(styleNode)) {
          _$jscoverage['/editor/styles.js'].lineData[771]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[775]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[779]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[782]++;
          styleNode._4e_mergeSiblings();
          _$jscoverage['/editor/styles.js'].lineData[790]++;
          if (visit935_790_1(!UA['ie'])) {
            _$jscoverage['/editor/styles.js'].lineData[791]++;
            styleNode[0].normalize();
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[804]++;
          styleNode = new Node(document.createElement("span"));
          _$jscoverage['/editor/styles.js'].lineData[805]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[806]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[807]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[808]++;
          styleNode._4e_remove(true);
        }
        _$jscoverage['/editor/styles.js'].lineData[813]++;
        styleRange = NULL;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[817]++;
    firstNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[818]++;
    lastNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[819]++;
    range.moveToBookmark(bookmark);
    _$jscoverage['/editor/styles.js'].lineData[821]++;
    range.shrink(KER.SHRINK_TEXT);
  }
  _$jscoverage['/editor/styles.js'].lineData[825]++;
  function removeInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[28]++;
    _$jscoverage['/editor/styles.js'].lineData[830]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[832]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode;
    _$jscoverage['/editor/styles.js'].lineData[835]++;
    if (visit936_835_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[837]++;
      var startPath = new ElementPath(startNode.parent()), boundaryElement;
      _$jscoverage['/editor/styles.js'].lineData[842]++;
      for (var i = 0, element; visit937_842_1(visit938_842_2(i < startPath.elements.length) && (element = startPath.elements[i])); i++) {
        _$jscoverage['/editor/styles.js'].lineData[851]++;
        if (visit939_851_1(visit940_851_2(element == startPath.block) || visit941_852_1(element == startPath.blockLimit))) {
          _$jscoverage['/editor/styles.js'].lineData[853]++;
          break;
        }
        _$jscoverage['/editor/styles.js'].lineData[855]++;
        if (visit942_855_1(this.checkElementRemovable(element))) {
          _$jscoverage['/editor/styles.js'].lineData[856]++;
          var endOfElement = range.checkBoundaryOfElement(element, KER.END), startOfElement = visit943_857_1(!endOfElement && range.checkBoundaryOfElement(element, KER.START));
          _$jscoverage['/editor/styles.js'].lineData[859]++;
          if (visit944_859_1(startOfElement || endOfElement)) {
            _$jscoverage['/editor/styles.js'].lineData[860]++;
            boundaryElement = element;
            _$jscoverage['/editor/styles.js'].lineData[861]++;
            boundaryElement.match = startOfElement ? 'start' : 'end';
          } else {
            _$jscoverage['/editor/styles.js'].lineData[869]++;
            element._4e_mergeSiblings();
            _$jscoverage['/editor/styles.js'].lineData[873]++;
            if (visit945_873_1(element.nodeName() != this.element)) {
              _$jscoverage['/editor/styles.js'].lineData[874]++;
              var _overrides = getOverrides(this);
              _$jscoverage['/editor/styles.js'].lineData[875]++;
              removeOverrides(element, visit946_876_1(_overrides[element.nodeName()] || _overrides["*"]));
            } else {
              _$jscoverage['/editor/styles.js'].lineData[878]++;
              removeFromElement(this, element);
            }
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[888]++;
      if (visit947_888_1(boundaryElement)) {
        _$jscoverage['/editor/styles.js'].lineData[889]++;
        var clonedElement = startNode;
        _$jscoverage['/editor/styles.js'].lineData[890]++;
        for (i = 0; ; i++) {
          _$jscoverage['/editor/styles.js'].lineData[891]++;
          var newElement = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[892]++;
          if (visit948_892_1(newElement.equals(boundaryElement))) {
            _$jscoverage['/editor/styles.js'].lineData[893]++;
            break;
          } else {
            _$jscoverage['/editor/styles.js'].lineData[895]++;
            if (visit949_895_1(newElement.match)) {
              _$jscoverage['/editor/styles.js'].lineData[896]++;
              continue;
            } else {
              _$jscoverage['/editor/styles.js'].lineData[898]++;
              newElement = newElement.clone();
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[899]++;
          newElement[0].appendChild(clonedElement[0]);
          _$jscoverage['/editor/styles.js'].lineData[900]++;
          clonedElement = newElement;
        }
        _$jscoverage['/editor/styles.js'].lineData[906]++;
        clonedElement[visit950_905_1(boundaryElement.match == 'start') ? 'insertBefore' : 'insertAfter'](boundaryElement);
        _$jscoverage['/editor/styles.js'].lineData[909]++;
        var tmp = boundaryElement.html();
        _$jscoverage['/editor/styles.js'].lineData[910]++;
        if (visit951_910_1(!tmp || visit952_912_1(tmp == '\u200b'))) {
          _$jscoverage['/editor/styles.js'].lineData[913]++;
          boundaryElement.remove();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[916]++;
          if (visit953_916_1(UA.webkit)) {
            _$jscoverage['/editor/styles.js'].lineData[917]++;
            $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
          }
        }
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[925]++;
      var endNode = bookmark.endNode, me = this;
      _$jscoverage['/editor/styles.js'].lineData[932]++;
      function breakNodes() {
        _$jscoverage['/editor/styles.js'].functionData[29]++;
        _$jscoverage['/editor/styles.js'].lineData[933]++;
        var startPath = new ElementPath(startNode.parent()), endPath = new ElementPath(endNode.parent()), breakStart = NULL, breakEnd = NULL;
        _$jscoverage['/editor/styles.js'].lineData[937]++;
        for (var i = 0; visit954_937_1(i < startPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[938]++;
          var element = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[940]++;
          if (visit955_940_1(visit956_940_2(element == startPath.block) || visit957_941_1(element == startPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[942]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[944]++;
          if (visit958_944_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[945]++;
            breakStart = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[947]++;
        for (i = 0; visit959_947_1(i < endPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[948]++;
          element = endPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[950]++;
          if (visit960_950_1(visit961_950_2(element == endPath.block) || visit962_951_1(element == endPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[952]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[954]++;
          if (visit963_954_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[955]++;
            breakEnd = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[958]++;
        if (visit964_958_1(breakEnd)) {
          _$jscoverage['/editor/styles.js'].lineData[959]++;
          endNode._4e_breakParent(breakEnd);
        }
        _$jscoverage['/editor/styles.js'].lineData[960]++;
        if (visit965_960_1(breakStart)) {
          _$jscoverage['/editor/styles.js'].lineData[961]++;
          startNode._4e_breakParent(breakStart);
        }
      }      _$jscoverage['/editor/styles.js'].lineData[964]++;
      breakNodes();
      _$jscoverage['/editor/styles.js'].lineData[967]++;
      var currentNode = new Node(startNode[0].nextSibling);
      _$jscoverage['/editor/styles.js'].lineData[968]++;
      while (visit966_968_1(currentNode[0] !== endNode[0])) {
        _$jscoverage['/editor/styles.js'].lineData[973]++;
        var nextNode = currentNode._4e_nextSourceNode();
        _$jscoverage['/editor/styles.js'].lineData[974]++;
        if (visit967_974_1(currentNode[0] && visit968_975_1(visit969_975_2(currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && this.checkElementRemovable(currentNode)))) {
          _$jscoverage['/editor/styles.js'].lineData[978]++;
          if (visit970_978_1(currentNode.nodeName() == this["element"])) {
            _$jscoverage['/editor/styles.js'].lineData[979]++;
            removeFromElement(this, currentNode);
          } else {
            _$jscoverage['/editor/styles.js'].lineData[981]++;
            var overrides = getOverrides(this);
            _$jscoverage['/editor/styles.js'].lineData[982]++;
            removeOverrides(currentNode, visit971_983_1(overrides[currentNode.nodeName()] || overrides["*"]));
          }
          _$jscoverage['/editor/styles.js'].lineData[993]++;
          if (visit972_993_1(visit973_993_2(nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && nextNode.contains(startNode))) {
            _$jscoverage['/editor/styles.js'].lineData[995]++;
            breakNodes();
            _$jscoverage['/editor/styles.js'].lineData[996]++;
            nextNode = new Node(startNode[0].nextSibling);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[999]++;
        currentNode = nextNode;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1002]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[1006]++;
  function parseStyleText(styleText) {
    _$jscoverage['/editor/styles.js'].functionData[30]++;
    _$jscoverage['/editor/styles.js'].lineData[1007]++;
    styleText = String(styleText);
    _$jscoverage['/editor/styles.js'].lineData[1008]++;
    var retval = {};
    _$jscoverage['/editor/styles.js'].lineData[1010]++;
    styleText.replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/editor/styles.js'].functionData[31]++;
  _$jscoverage['/editor/styles.js'].lineData[1012]++;
  retval[name] = value;
});
    _$jscoverage['/editor/styles.js'].lineData[1014]++;
    return retval;
  }
  _$jscoverage['/editor/styles.js'].lineData[1017]++;
  function compareCssText(source, target) {
    _$jscoverage['/editor/styles.js'].functionData[32]++;
    _$jscoverage['/editor/styles.js'].lineData[1018]++;
    visit974_1018_1(visit975_1018_2(typeof source == 'string') && (source = parseStyleText(source)));
    _$jscoverage['/editor/styles.js'].lineData[1019]++;
    visit976_1019_1(visit977_1019_2(typeof target == 'string') && (target = parseStyleText(target)));
    _$jscoverage['/editor/styles.js'].lineData[1020]++;
    for (var name in source) {
      _$jscoverage['/editor/styles.js'].lineData[1024]++;
      if (visit978_1024_1(!(visit979_1024_2(name in target && (visit980_1025_1(visit981_1025_2(target[name] == source[name]) || visit982_1026_1(visit983_1026_2(source[name] == 'inherit') || visit984_1027_1(target[name] == 'inherit')))))))) {
        _$jscoverage['/editor/styles.js'].lineData[1028]++;
        return FALSE;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1032]++;
    return TRUE;
  }
  _$jscoverage['/editor/styles.js'].lineData[1035]++;
  function normalizeCssText(unparsedCssText, nativeNormalize) {
    _$jscoverage['/editor/styles.js'].functionData[33]++;
    _$jscoverage['/editor/styles.js'].lineData[1036]++;
    var styleText = "";
    _$jscoverage['/editor/styles.js'].lineData[1037]++;
    if (visit985_1037_1(nativeNormalize !== FALSE)) {
      _$jscoverage['/editor/styles.js'].lineData[1040]++;
      var temp = document.createElement('span');
      _$jscoverage['/editor/styles.js'].lineData[1041]++;
      temp.style.cssText = unparsedCssText;
      _$jscoverage['/editor/styles.js'].lineData[1043]++;
      styleText = visit986_1043_1(temp.style.cssText || '');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[1046]++;
      styleText = unparsedCssText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1050]++;
    return styleText.replace(/\s*([;:])\s*/, '$1').replace(/([^\s;])$/, "$1;").replace(/,\s+/g, ',').toLowerCase();
  }
  _$jscoverage['/editor/styles.js'].lineData[1060]++;
  function getAttributesForComparison(styleDefinition) {
    _$jscoverage['/editor/styles.js'].functionData[34]++;
    _$jscoverage['/editor/styles.js'].lineData[1062]++;
    var attribs = styleDefinition._AC;
    _$jscoverage['/editor/styles.js'].lineData[1063]++;
    if (visit987_1063_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1064]++;
      return attribs;
    }
    _$jscoverage['/editor/styles.js'].lineData[1066]++;
    attribs = {};
    _$jscoverage['/editor/styles.js'].lineData[1068]++;
    var length = 0, styleAttribs = styleDefinition["attributes"];
    _$jscoverage['/editor/styles.js'].lineData[1072]++;
    if (visit988_1072_1(styleAttribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1073]++;
      for (var styleAtt in styleAttribs) {
        _$jscoverage['/editor/styles.js'].lineData[1075]++;
        length++;
        _$jscoverage['/editor/styles.js'].lineData[1076]++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1082]++;
    var styleText = KEStyle.getStyleText(styleDefinition);
    _$jscoverage['/editor/styles.js'].lineData[1083]++;
    if (visit989_1083_1(styleText)) {
      _$jscoverage['/editor/styles.js'].lineData[1084]++;
      if (visit990_1084_1(!attribs['style'])) {
        _$jscoverage['/editor/styles.js'].lineData[1085]++;
        length++;
      }
      _$jscoverage['/editor/styles.js'].lineData[1086]++;
      attribs['style'] = styleText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1091]++;
    attribs["_length"] = length;
    _$jscoverage['/editor/styles.js'].lineData[1094]++;
    return (styleDefinition._AC = attribs);
  }
  _$jscoverage['/editor/styles.js'].lineData[1103]++;
  function getOverrides(style) {
    _$jscoverage['/editor/styles.js'].functionData[35]++;
    _$jscoverage['/editor/styles.js'].lineData[1104]++;
    if (visit991_1104_1(style._.overrides)) {
      _$jscoverage['/editor/styles.js'].lineData[1105]++;
      return style._.overrides;
    }
    _$jscoverage['/editor/styles.js'].lineData[1107]++;
    var overrides = (style._.overrides = {}), definition = style._.definition["overrides"];
    _$jscoverage['/editor/styles.js'].lineData[1110]++;
    if (visit992_1110_1(definition)) {
      _$jscoverage['/editor/styles.js'].lineData[1113]++;
      if (visit993_1113_1(!S.isArray(definition))) {
        _$jscoverage['/editor/styles.js'].lineData[1114]++;
        definition = [definition];
      }
      _$jscoverage['/editor/styles.js'].lineData[1117]++;
      for (var i = 0; visit994_1117_1(i < definition.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1118]++;
        var override = definition[i];
        _$jscoverage['/editor/styles.js'].lineData[1119]++;
        var elementName;
        _$jscoverage['/editor/styles.js'].lineData[1120]++;
        var overrideEl;
        _$jscoverage['/editor/styles.js'].lineData[1121]++;
        var attrs, styles;
        _$jscoverage['/editor/styles.js'].lineData[1124]++;
        if (visit995_1124_1(typeof override == 'string')) {
          _$jscoverage['/editor/styles.js'].lineData[1125]++;
          elementName = override.toLowerCase();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[1128]++;
          elementName = override["element"] ? override["element"].toLowerCase() : style.element;
          _$jscoverage['/editor/styles.js'].lineData[1131]++;
          attrs = override["attributes"];
          _$jscoverage['/editor/styles.js'].lineData[1132]++;
          styles = override["styles"];
        }
        _$jscoverage['/editor/styles.js'].lineData[1138]++;
        overrideEl = visit996_1138_1(overrides[elementName] || (overrides[elementName] = {}));
        _$jscoverage['/editor/styles.js'].lineData[1141]++;
        if (visit997_1141_1(attrs)) {
          _$jscoverage['/editor/styles.js'].lineData[1145]++;
          var overrideAttrs = (overrideEl["attributes"] = visit998_1146_1(overrideEl["attributes"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1147]++;
          for (var attName in attrs) {
            _$jscoverage['/editor/styles.js'].lineData[1151]++;
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1156]++;
        if (visit999_1156_1(styles)) {
          _$jscoverage['/editor/styles.js'].lineData[1160]++;
          var overrideStyles = (overrideEl["styles"] = visit1000_1161_1(overrideEl["styles"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1162]++;
          for (var styleName in styles) {
            _$jscoverage['/editor/styles.js'].lineData[1166]++;
            overrideStyles.push([styleName.toLowerCase(), styles[styleName]]);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1172]++;
    return overrides;
  }
  _$jscoverage['/editor/styles.js'].lineData[1176]++;
  function removeFromElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[36]++;
    _$jscoverage['/editor/styles.js'].lineData[1177]++;
    var def = style._.definition, overrides = getOverrides(style), attributes = S.merge(def["attributes"], (visit1001_1180_1(overrides[element.nodeName()] || visit1002_1180_2(overrides["*"] || {})))["attributes"]), styles = S.merge(def["styles"], (visit1003_1182_1(overrides[element.nodeName()] || visit1004_1182_2(overrides["*"] || {})))["styles"]), removeEmpty = visit1005_1184_1(S.isEmptyObject(attributes) && S.isEmptyObject(styles));
    _$jscoverage['/editor/styles.js'].lineData[1188]++;
    for (var attName in attributes) {
      _$jscoverage['/editor/styles.js'].lineData[1191]++;
      if (visit1006_1191_1((visit1007_1191_2(visit1008_1191_3(attName == 'class') || style._.definition["fullMatch"])) && visit1009_1192_1(element.attr(attName) != normalizeProperty(attName, attributes[attName])))) {
        _$jscoverage['/editor/styles.js'].lineData[1194]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1195]++;
      removeEmpty = visit1010_1195_1(removeEmpty || !!element.hasAttr(attName));
      _$jscoverage['/editor/styles.js'].lineData[1196]++;
      element.removeAttr(attName);
    }
    _$jscoverage['/editor/styles.js'].lineData[1200]++;
    for (var styleName in styles) {
      _$jscoverage['/editor/styles.js'].lineData[1203]++;
      if (visit1011_1203_1(style._.definition["fullMatch"] && visit1012_1204_1(element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)))) {
        _$jscoverage['/editor/styles.js'].lineData[1206]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1208]++;
      removeEmpty = visit1013_1208_1(removeEmpty || !!element.style(styleName));
      _$jscoverage['/editor/styles.js'].lineData[1210]++;
      element.style(styleName, "");
    }
    _$jscoverage['/editor/styles.js'].lineData[1216]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1219]++;
  function normalizeProperty(name, value, isStyle) {
    _$jscoverage['/editor/styles.js'].functionData[37]++;
    _$jscoverage['/editor/styles.js'].lineData[1220]++;
    var temp = new Node('<span>');
    _$jscoverage['/editor/styles.js'].lineData[1221]++;
    temp[isStyle ? 'style' : 'attr'](name, value);
    _$jscoverage['/editor/styles.js'].lineData[1222]++;
    return temp[isStyle ? 'style' : 'attr'](name);
  }
  _$jscoverage['/editor/styles.js'].lineData[1226]++;
  function removeFromInsideElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[38]++;
    _$jscoverage['/editor/styles.js'].lineData[1227]++;
    var overrides = getOverrides(style), innerElements = element.all(style["element"]);
    _$jscoverage['/editor/styles.js'].lineData[1233]++;
    for (var i = innerElements.length; visit1014_1233_1(--i >= 0); ) {
      _$jscoverage['/editor/styles.js'].lineData[1234]++;
      removeFromElement(style, new Node(innerElements[i]));
    }
    _$jscoverage['/editor/styles.js'].lineData[1239]++;
    for (var overrideElement in overrides) {
      _$jscoverage['/editor/styles.js'].lineData[1241]++;
      if (visit1015_1241_1(overrideElement != style["element"])) {
        _$jscoverage['/editor/styles.js'].lineData[1242]++;
        innerElements = element.all(overrideElement);
        _$jscoverage['/editor/styles.js'].lineData[1243]++;
        for (i = innerElements.length - 1; visit1016_1243_1(i >= 0); i--) {
          _$jscoverage['/editor/styles.js'].lineData[1244]++;
          var innerElement = new Node(innerElements[i]);
          _$jscoverage['/editor/styles.js'].lineData[1245]++;
          removeOverrides(innerElement, overrides[overrideElement]);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1258]++;
  function removeOverrides(element, overrides) {
    _$jscoverage['/editor/styles.js'].functionData[39]++;
    _$jscoverage['/editor/styles.js'].lineData[1259]++;
    var i, attributes = visit1017_1259_1(overrides && overrides["attributes"]);
    _$jscoverage['/editor/styles.js'].lineData[1261]++;
    if (visit1018_1261_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[1262]++;
      for (i = 0; visit1019_1262_1(i < attributes.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1263]++;
        var attName = attributes[i][0], actualAttrValue;
        _$jscoverage['/editor/styles.js'].lineData[1265]++;
        if ((actualAttrValue = element.attr(attName))) {
          _$jscoverage['/editor/styles.js'].lineData[1266]++;
          var attValue = attributes[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1274]++;
          if (visit1020_1274_1(visit1021_1274_2(attValue === NULL) || visit1022_1275_1((visit1023_1275_2(attValue.test && attValue.test(actualAttrValue))) || (visit1024_1276_1(visit1025_1276_2(typeof attValue == 'string') && visit1026_1276_3(actualAttrValue == attValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1277]++;
            element[0].removeAttribute(attName);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1282]++;
    var styles = visit1027_1282_1(overrides && overrides["styles"]);
    _$jscoverage['/editor/styles.js'].lineData[1284]++;
    if (visit1028_1284_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[1285]++;
      for (i = 0; visit1029_1285_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1286]++;
        var styleName = styles[i][0], actualStyleValue;
        _$jscoverage['/editor/styles.js'].lineData[1288]++;
        if ((actualStyleValue = element.css(styleName))) {
          _$jscoverage['/editor/styles.js'].lineData[1289]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1290]++;
          if (visit1030_1290_1(visit1031_1290_2(styleValue === NULL) || visit1032_1292_1((visit1033_1292_2(styleValue.test && styleValue.test(actualAttrValue))) || (visit1034_1293_1(visit1035_1293_2(typeof styleValue == 'string') && visit1036_1293_3(actualStyleValue == styleValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1294]++;
            element.css(styleName, "");
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1299]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1303]++;
  function removeNoAttribsElement(element) {
    _$jscoverage['/editor/styles.js'].functionData[40]++;
    _$jscoverage['/editor/styles.js'].lineData[1306]++;
    if (visit1037_1306_1(!element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[1309]++;
      var firstChild = element[0].firstChild, lastChild = element[0].lastChild;
      _$jscoverage['/editor/styles.js'].lineData[1312]++;
      element._4e_remove(TRUE);
      _$jscoverage['/editor/styles.js'].lineData[1314]++;
      if (visit1038_1314_1(firstChild)) {
        _$jscoverage['/editor/styles.js'].lineData[1316]++;
        visit1039_1316_1(visit1040_1316_2(firstChild.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_mergeSiblings(firstChild));
        _$jscoverage['/editor/styles.js'].lineData[1319]++;
        if (visit1041_1319_1(lastChild && visit1042_1319_2(visit1043_1319_3(firstChild != lastChild) && visit1044_1320_1(lastChild.nodeType == Dom.NodeType.ELEMENT_NODE)))) {
          _$jscoverage['/editor/styles.js'].lineData[1321]++;
          Dom._4e_mergeSiblings(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1326]++;
  Editor.Style = KEStyle;
  _$jscoverage['/editor/styles.js'].lineData[1328]++;
  return KEStyle;
}, {
  requires: ['./base', './range', './selection', './domIterator', './elementPath', 'node']});
