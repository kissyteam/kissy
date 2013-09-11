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
if (! _$jscoverage['/editor/selection.js']) {
  _$jscoverage['/editor/selection.js'] = {};
  _$jscoverage['/editor/selection.js'].lineData = [];
  _$jscoverage['/editor/selection.js'].lineData[10] = 0;
  _$jscoverage['/editor/selection.js'].lineData[15] = 0;
  _$jscoverage['/editor/selection.js'].lineData[20] = 0;
  _$jscoverage['/editor/selection.js'].lineData[40] = 0;
  _$jscoverage['/editor/selection.js'].lineData[41] = 0;
  _$jscoverage['/editor/selection.js'].lineData[42] = 0;
  _$jscoverage['/editor/selection.js'].lineData[43] = 0;
  _$jscoverage['/editor/selection.js'].lineData[51] = 0;
  _$jscoverage['/editor/selection.js'].lineData[52] = 0;
  _$jscoverage['/editor/selection.js'].lineData[53] = 0;
  _$jscoverage['/editor/selection.js'].lineData[54] = 0;
  _$jscoverage['/editor/selection.js'].lineData[57] = 0;
  _$jscoverage['/editor/selection.js'].lineData[63] = 0;
  _$jscoverage['/editor/selection.js'].lineData[68] = 0;
  _$jscoverage['/editor/selection.js'].lineData[73] = 0;
  _$jscoverage['/editor/selection.js'].lineData[83] = 0;
  _$jscoverage['/editor/selection.js'].lineData[85] = 0;
  _$jscoverage['/editor/selection.js'].lineData[89] = 0;
  _$jscoverage['/editor/selection.js'].lineData[90] = 0;
  _$jscoverage['/editor/selection.js'].lineData[113] = 0;
  _$jscoverage['/editor/selection.js'].lineData[114] = 0;
  _$jscoverage['/editor/selection.js'].lineData[115] = 0;
  _$jscoverage['/editor/selection.js'].lineData[117] = 0;
  _$jscoverage['/editor/selection.js'].lineData[120] = 0;
  _$jscoverage['/editor/selection.js'].lineData[121] = 0;
  _$jscoverage['/editor/selection.js'].lineData[122] = 0;
  _$jscoverage['/editor/selection.js'].lineData[126] = 0;
  _$jscoverage['/editor/selection.js'].lineData[129] = 0;
  _$jscoverage['/editor/selection.js'].lineData[133] = 0;
  _$jscoverage['/editor/selection.js'].lineData[137] = 0;
  _$jscoverage['/editor/selection.js'].lineData[140] = 0;
  _$jscoverage['/editor/selection.js'].lineData[141] = 0;
  _$jscoverage['/editor/selection.js'].lineData[142] = 0;
  _$jscoverage['/editor/selection.js'].lineData[144] = 0;
  _$jscoverage['/editor/selection.js'].lineData[146] = 0;
  _$jscoverage['/editor/selection.js'].lineData[147] = 0;
  _$jscoverage['/editor/selection.js'].lineData[150] = 0;
  _$jscoverage['/editor/selection.js'].lineData[151] = 0;
  _$jscoverage['/editor/selection.js'].lineData[153] = 0;
  _$jscoverage['/editor/selection.js'].lineData[154] = 0;
  _$jscoverage['/editor/selection.js'].lineData[161] = 0;
  _$jscoverage['/editor/selection.js'].lineData[162] = 0;
  _$jscoverage['/editor/selection.js'].lineData[167] = 0;
  _$jscoverage['/editor/selection.js'].lineData[179] = 0;
  _$jscoverage['/editor/selection.js'].lineData[181] = 0;
  _$jscoverage['/editor/selection.js'].lineData[182] = 0;
  _$jscoverage['/editor/selection.js'].lineData[185] = 0;
  _$jscoverage['/editor/selection.js'].lineData[188] = 0;
  _$jscoverage['/editor/selection.js'].lineData[189] = 0;
  _$jscoverage['/editor/selection.js'].lineData[191] = 0;
  _$jscoverage['/editor/selection.js'].lineData[192] = 0;
  _$jscoverage['/editor/selection.js'].lineData[194] = 0;
  _$jscoverage['/editor/selection.js'].lineData[196] = 0;
  _$jscoverage['/editor/selection.js'].lineData[199] = 0;
  _$jscoverage['/editor/selection.js'].lineData[201] = 0;
  _$jscoverage['/editor/selection.js'].lineData[202] = 0;
  _$jscoverage['/editor/selection.js'].lineData[205] = 0;
  _$jscoverage['/editor/selection.js'].lineData[207] = 0;
  _$jscoverage['/editor/selection.js'].lineData[208] = 0;
  _$jscoverage['/editor/selection.js'].lineData[209] = 0;
  _$jscoverage['/editor/selection.js'].lineData[211] = 0;
  _$jscoverage['/editor/selection.js'].lineData[215] = 0;
  _$jscoverage['/editor/selection.js'].lineData[216] = 0;
  _$jscoverage['/editor/selection.js'].lineData[217] = 0;
  _$jscoverage['/editor/selection.js'].lineData[218] = 0;
  _$jscoverage['/editor/selection.js'].lineData[221] = 0;
  _$jscoverage['/editor/selection.js'].lineData[225] = 0;
  _$jscoverage['/editor/selection.js'].lineData[228] = 0;
  _$jscoverage['/editor/selection.js'].lineData[229] = 0;
  _$jscoverage['/editor/selection.js'].lineData[233] = 0;
  _$jscoverage['/editor/selection.js'].lineData[237] = 0;
  _$jscoverage['/editor/selection.js'].lineData[241] = 0;
  _$jscoverage['/editor/selection.js'].lineData[242] = 0;
  _$jscoverage['/editor/selection.js'].lineData[248] = 0;
  _$jscoverage['/editor/selection.js'].lineData[255] = 0;
  _$jscoverage['/editor/selection.js'].lineData[256] = 0;
  _$jscoverage['/editor/selection.js'].lineData[257] = 0;
  _$jscoverage['/editor/selection.js'].lineData[258] = 0;
  _$jscoverage['/editor/selection.js'].lineData[264] = 0;
  _$jscoverage['/editor/selection.js'].lineData[269] = 0;
  _$jscoverage['/editor/selection.js'].lineData[270] = 0;
  _$jscoverage['/editor/selection.js'].lineData[272] = 0;
  _$jscoverage['/editor/selection.js'].lineData[273] = 0;
  _$jscoverage['/editor/selection.js'].lineData[274] = 0;
  _$jscoverage['/editor/selection.js'].lineData[275] = 0;
  _$jscoverage['/editor/selection.js'].lineData[276] = 0;
  _$jscoverage['/editor/selection.js'].lineData[277] = 0;
  _$jscoverage['/editor/selection.js'].lineData[278] = 0;
  _$jscoverage['/editor/selection.js'].lineData[279] = 0;
  _$jscoverage['/editor/selection.js'].lineData[280] = 0;
  _$jscoverage['/editor/selection.js'].lineData[282] = 0;
  _$jscoverage['/editor/selection.js'].lineData[283] = 0;
  _$jscoverage['/editor/selection.js'].lineData[287] = 0;
  _$jscoverage['/editor/selection.js'].lineData[289] = 0;
  _$jscoverage['/editor/selection.js'].lineData[292] = 0;
  _$jscoverage['/editor/selection.js'].lineData[293] = 0;
  _$jscoverage['/editor/selection.js'].lineData[294] = 0;
  _$jscoverage['/editor/selection.js'].lineData[297] = 0;
  _$jscoverage['/editor/selection.js'].lineData[300] = 0;
  _$jscoverage['/editor/selection.js'].lineData[305] = 0;
  _$jscoverage['/editor/selection.js'].lineData[306] = 0;
  _$jscoverage['/editor/selection.js'].lineData[307] = 0;
  _$jscoverage['/editor/selection.js'].lineData[313] = 0;
  _$jscoverage['/editor/selection.js'].lineData[315] = 0;
  _$jscoverage['/editor/selection.js'].lineData[316] = 0;
  _$jscoverage['/editor/selection.js'].lineData[318] = 0;
  _$jscoverage['/editor/selection.js'].lineData[319] = 0;
  _$jscoverage['/editor/selection.js'].lineData[321] = 0;
  _$jscoverage['/editor/selection.js'].lineData[322] = 0;
  _$jscoverage['/editor/selection.js'].lineData[323] = 0;
  _$jscoverage['/editor/selection.js'].lineData[326] = 0;
  _$jscoverage['/editor/selection.js'].lineData[339] = 0;
  _$jscoverage['/editor/selection.js'].lineData[340] = 0;
  _$jscoverage['/editor/selection.js'].lineData[341] = 0;
  _$jscoverage['/editor/selection.js'].lineData[343] = 0;
  _$jscoverage['/editor/selection.js'].lineData[346] = 0;
  _$jscoverage['/editor/selection.js'].lineData[348] = 0;
  _$jscoverage['/editor/selection.js'].lineData[352] = 0;
  _$jscoverage['/editor/selection.js'].lineData[354] = 0;
  _$jscoverage['/editor/selection.js'].lineData[355] = 0;
  _$jscoverage['/editor/selection.js'].lineData[356] = 0;
  _$jscoverage['/editor/selection.js'].lineData[361] = 0;
  _$jscoverage['/editor/selection.js'].lineData[362] = 0;
  _$jscoverage['/editor/selection.js'].lineData[365] = 0;
  _$jscoverage['/editor/selection.js'].lineData[368] = 0;
  _$jscoverage['/editor/selection.js'].lineData[370] = 0;
  _$jscoverage['/editor/selection.js'].lineData[374] = 0;
  _$jscoverage['/editor/selection.js'].lineData[376] = 0;
  _$jscoverage['/editor/selection.js'].lineData[377] = 0;
  _$jscoverage['/editor/selection.js'].lineData[380] = 0;
  _$jscoverage['/editor/selection.js'].lineData[382] = 0;
  _$jscoverage['/editor/selection.js'].lineData[383] = 0;
  _$jscoverage['/editor/selection.js'].lineData[386] = 0;
  _$jscoverage['/editor/selection.js'].lineData[387] = 0;
  _$jscoverage['/editor/selection.js'].lineData[388] = 0;
  _$jscoverage['/editor/selection.js'].lineData[389] = 0;
  _$jscoverage['/editor/selection.js'].lineData[391] = 0;
  _$jscoverage['/editor/selection.js'].lineData[395] = 0;
  _$jscoverage['/editor/selection.js'].lineData[396] = 0;
  _$jscoverage['/editor/selection.js'].lineData[397] = 0;
  _$jscoverage['/editor/selection.js'].lineData[398] = 0;
  _$jscoverage['/editor/selection.js'].lineData[401] = 0;
  _$jscoverage['/editor/selection.js'].lineData[402] = 0;
  _$jscoverage['/editor/selection.js'].lineData[403] = 0;
  _$jscoverage['/editor/selection.js'].lineData[405] = 0;
  _$jscoverage['/editor/selection.js'].lineData[406] = 0;
  _$jscoverage['/editor/selection.js'].lineData[411] = 0;
  _$jscoverage['/editor/selection.js'].lineData[425] = 0;
  _$jscoverage['/editor/selection.js'].lineData[429] = 0;
  _$jscoverage['/editor/selection.js'].lineData[430] = 0;
  _$jscoverage['/editor/selection.js'].lineData[434] = 0;
  _$jscoverage['/editor/selection.js'].lineData[435] = 0;
  _$jscoverage['/editor/selection.js'].lineData[436] = 0;
  _$jscoverage['/editor/selection.js'].lineData[442] = 0;
  _$jscoverage['/editor/selection.js'].lineData[443] = 0;
  _$jscoverage['/editor/selection.js'].lineData[444] = 0;
  _$jscoverage['/editor/selection.js'].lineData[452] = 0;
  _$jscoverage['/editor/selection.js'].lineData[464] = 0;
  _$jscoverage['/editor/selection.js'].lineData[467] = 0;
  _$jscoverage['/editor/selection.js'].lineData[470] = 0;
  _$jscoverage['/editor/selection.js'].lineData[473] = 0;
  _$jscoverage['/editor/selection.js'].lineData[478] = 0;
  _$jscoverage['/editor/selection.js'].lineData[482] = 0;
  _$jscoverage['/editor/selection.js'].lineData[485] = 0;
  _$jscoverage['/editor/selection.js'].lineData[489] = 0;
  _$jscoverage['/editor/selection.js'].lineData[491] = 0;
  _$jscoverage['/editor/selection.js'].lineData[492] = 0;
  _$jscoverage['/editor/selection.js'].lineData[493] = 0;
  _$jscoverage['/editor/selection.js'].lineData[496] = 0;
  _$jscoverage['/editor/selection.js'].lineData[497] = 0;
  _$jscoverage['/editor/selection.js'].lineData[498] = 0;
  _$jscoverage['/editor/selection.js'].lineData[502] = 0;
  _$jscoverage['/editor/selection.js'].lineData[505] = 0;
  _$jscoverage['/editor/selection.js'].lineData[506] = 0;
  _$jscoverage['/editor/selection.js'].lineData[508] = 0;
  _$jscoverage['/editor/selection.js'].lineData[509] = 0;
  _$jscoverage['/editor/selection.js'].lineData[510] = 0;
  _$jscoverage['/editor/selection.js'].lineData[511] = 0;
  _$jscoverage['/editor/selection.js'].lineData[516] = 0;
  _$jscoverage['/editor/selection.js'].lineData[517] = 0;
  _$jscoverage['/editor/selection.js'].lineData[518] = 0;
  _$jscoverage['/editor/selection.js'].lineData[520] = 0;
  _$jscoverage['/editor/selection.js'].lineData[521] = 0;
  _$jscoverage['/editor/selection.js'].lineData[522] = 0;
  _$jscoverage['/editor/selection.js'].lineData[527] = 0;
  _$jscoverage['/editor/selection.js'].lineData[528] = 0;
  _$jscoverage['/editor/selection.js'].lineData[530] = 0;
  _$jscoverage['/editor/selection.js'].lineData[533] = 0;
  _$jscoverage['/editor/selection.js'].lineData[534] = 0;
  _$jscoverage['/editor/selection.js'].lineData[535] = 0;
  _$jscoverage['/editor/selection.js'].lineData[537] = 0;
  _$jscoverage['/editor/selection.js'].lineData[538] = 0;
  _$jscoverage['/editor/selection.js'].lineData[539] = 0;
  _$jscoverage['/editor/selection.js'].lineData[547] = 0;
  _$jscoverage['/editor/selection.js'].lineData[551] = 0;
  _$jscoverage['/editor/selection.js'].lineData[554] = 0;
  _$jscoverage['/editor/selection.js'].lineData[555] = 0;
  _$jscoverage['/editor/selection.js'].lineData[558] = 0;
  _$jscoverage['/editor/selection.js'].lineData[559] = 0;
  _$jscoverage['/editor/selection.js'].lineData[561] = 0;
  _$jscoverage['/editor/selection.js'].lineData[563] = 0;
  _$jscoverage['/editor/selection.js'].lineData[567] = 0;
  _$jscoverage['/editor/selection.js'].lineData[570] = 0;
  _$jscoverage['/editor/selection.js'].lineData[571] = 0;
  _$jscoverage['/editor/selection.js'].lineData[573] = 0;
  _$jscoverage['/editor/selection.js'].lineData[576] = 0;
  _$jscoverage['/editor/selection.js'].lineData[580] = 0;
  _$jscoverage['/editor/selection.js'].lineData[581] = 0;
  _$jscoverage['/editor/selection.js'].lineData[582] = 0;
  _$jscoverage['/editor/selection.js'].lineData[583] = 0;
  _$jscoverage['/editor/selection.js'].lineData[584] = 0;
  _$jscoverage['/editor/selection.js'].lineData[586] = 0;
  _$jscoverage['/editor/selection.js'].lineData[590] = 0;
  _$jscoverage['/editor/selection.js'].lineData[591] = 0;
  _$jscoverage['/editor/selection.js'].lineData[595] = 0;
  _$jscoverage['/editor/selection.js'].lineData[596] = 0;
  _$jscoverage['/editor/selection.js'].lineData[597] = 0;
  _$jscoverage['/editor/selection.js'].lineData[598] = 0;
  _$jscoverage['/editor/selection.js'].lineData[602] = 0;
  _$jscoverage['/editor/selection.js'].lineData[606] = 0;
  _$jscoverage['/editor/selection.js'].lineData[607] = 0;
  _$jscoverage['/editor/selection.js'].lineData[608] = 0;
  _$jscoverage['/editor/selection.js'].lineData[609] = 0;
  _$jscoverage['/editor/selection.js'].lineData[610] = 0;
  _$jscoverage['/editor/selection.js'].lineData[612] = 0;
  _$jscoverage['/editor/selection.js'].lineData[613] = 0;
  _$jscoverage['/editor/selection.js'].lineData[617] = 0;
  _$jscoverage['/editor/selection.js'].lineData[620] = 0;
  _$jscoverage['/editor/selection.js'].lineData[627] = 0;
  _$jscoverage['/editor/selection.js'].lineData[628] = 0;
  _$jscoverage['/editor/selection.js'].lineData[635] = 0;
  _$jscoverage['/editor/selection.js'].lineData[636] = 0;
  _$jscoverage['/editor/selection.js'].lineData[637] = 0;
  _$jscoverage['/editor/selection.js'].lineData[639] = 0;
  _$jscoverage['/editor/selection.js'].lineData[645] = 0;
  _$jscoverage['/editor/selection.js'].lineData[647] = 0;
  _$jscoverage['/editor/selection.js'].lineData[650] = 0;
  _$jscoverage['/editor/selection.js'].lineData[654] = 0;
  _$jscoverage['/editor/selection.js'].lineData[656] = 0;
  _$jscoverage['/editor/selection.js'].lineData[660] = 0;
  _$jscoverage['/editor/selection.js'].lineData[661] = 0;
  _$jscoverage['/editor/selection.js'].lineData[665] = 0;
  _$jscoverage['/editor/selection.js'].lineData[666] = 0;
  _$jscoverage['/editor/selection.js'].lineData[668] = 0;
  _$jscoverage['/editor/selection.js'].lineData[669] = 0;
  _$jscoverage['/editor/selection.js'].lineData[674] = 0;
  _$jscoverage['/editor/selection.js'].lineData[675] = 0;
  _$jscoverage['/editor/selection.js'].lineData[676] = 0;
  _$jscoverage['/editor/selection.js'].lineData[679] = 0;
  _$jscoverage['/editor/selection.js'].lineData[682] = 0;
  _$jscoverage['/editor/selection.js'].lineData[683] = 0;
  _$jscoverage['/editor/selection.js'].lineData[684] = 0;
  _$jscoverage['/editor/selection.js'].lineData[688] = 0;
  _$jscoverage['/editor/selection.js'].lineData[694] = 0;
  _$jscoverage['/editor/selection.js'].lineData[699] = 0;
  _$jscoverage['/editor/selection.js'].lineData[700] = 0;
  _$jscoverage['/editor/selection.js'].lineData[701] = 0;
  _$jscoverage['/editor/selection.js'].lineData[702] = 0;
  _$jscoverage['/editor/selection.js'].lineData[707] = 0;
  _$jscoverage['/editor/selection.js'].lineData[711] = 0;
  _$jscoverage['/editor/selection.js'].lineData[714] = 0;
  _$jscoverage['/editor/selection.js'].lineData[718] = 0;
  _$jscoverage['/editor/selection.js'].lineData[719] = 0;
  _$jscoverage['/editor/selection.js'].lineData[722] = 0;
  _$jscoverage['/editor/selection.js'].lineData[725] = 0;
  _$jscoverage['/editor/selection.js'].lineData[727] = 0;
  _$jscoverage['/editor/selection.js'].lineData[729] = 0;
  _$jscoverage['/editor/selection.js'].lineData[731] = 0;
  _$jscoverage['/editor/selection.js'].lineData[733] = 0;
  _$jscoverage['/editor/selection.js'].lineData[735] = 0;
  _$jscoverage['/editor/selection.js'].lineData[736] = 0;
  _$jscoverage['/editor/selection.js'].lineData[743] = 0;
  _$jscoverage['/editor/selection.js'].lineData[744] = 0;
  _$jscoverage['/editor/selection.js'].lineData[745] = 0;
  _$jscoverage['/editor/selection.js'].lineData[747] = 0;
  _$jscoverage['/editor/selection.js'].lineData[764] = 0;
  _$jscoverage['/editor/selection.js'].lineData[765] = 0;
  _$jscoverage['/editor/selection.js'].lineData[766] = 0;
  _$jscoverage['/editor/selection.js'].lineData[767] = 0;
  _$jscoverage['/editor/selection.js'].lineData[772] = 0;
  _$jscoverage['/editor/selection.js'].lineData[777] = 0;
  _$jscoverage['/editor/selection.js'].lineData[778] = 0;
  _$jscoverage['/editor/selection.js'].lineData[780] = 0;
  _$jscoverage['/editor/selection.js'].lineData[781] = 0;
  _$jscoverage['/editor/selection.js'].lineData[783] = 0;
  _$jscoverage['/editor/selection.js'].lineData[784] = 0;
  _$jscoverage['/editor/selection.js'].lineData[786] = 0;
  _$jscoverage['/editor/selection.js'].lineData[788] = 0;
  _$jscoverage['/editor/selection.js'].lineData[789] = 0;
  _$jscoverage['/editor/selection.js'].lineData[790] = 0;
  _$jscoverage['/editor/selection.js'].lineData[791] = 0;
  _$jscoverage['/editor/selection.js'].lineData[794] = 0;
  _$jscoverage['/editor/selection.js'].lineData[795] = 0;
  _$jscoverage['/editor/selection.js'].lineData[796] = 0;
  _$jscoverage['/editor/selection.js'].lineData[801] = 0;
  _$jscoverage['/editor/selection.js'].lineData[802] = 0;
  _$jscoverage['/editor/selection.js'].lineData[803] = 0;
  _$jscoverage['/editor/selection.js'].lineData[806] = 0;
  _$jscoverage['/editor/selection.js'].lineData[808] = 0;
  _$jscoverage['/editor/selection.js'].lineData[810] = 0;
}
if (! _$jscoverage['/editor/selection.js'].functionData) {
  _$jscoverage['/editor/selection.js'].functionData = [];
  _$jscoverage['/editor/selection.js'].functionData[0] = 0;
  _$jscoverage['/editor/selection.js'].functionData[1] = 0;
  _$jscoverage['/editor/selection.js'].functionData[2] = 0;
  _$jscoverage['/editor/selection.js'].functionData[3] = 0;
  _$jscoverage['/editor/selection.js'].functionData[4] = 0;
  _$jscoverage['/editor/selection.js'].functionData[5] = 0;
  _$jscoverage['/editor/selection.js'].functionData[6] = 0;
  _$jscoverage['/editor/selection.js'].functionData[7] = 0;
  _$jscoverage['/editor/selection.js'].functionData[8] = 0;
  _$jscoverage['/editor/selection.js'].functionData[9] = 0;
  _$jscoverage['/editor/selection.js'].functionData[10] = 0;
  _$jscoverage['/editor/selection.js'].functionData[11] = 0;
  _$jscoverage['/editor/selection.js'].functionData[12] = 0;
  _$jscoverage['/editor/selection.js'].functionData[13] = 0;
  _$jscoverage['/editor/selection.js'].functionData[14] = 0;
  _$jscoverage['/editor/selection.js'].functionData[15] = 0;
  _$jscoverage['/editor/selection.js'].functionData[16] = 0;
  _$jscoverage['/editor/selection.js'].functionData[17] = 0;
  _$jscoverage['/editor/selection.js'].functionData[18] = 0;
  _$jscoverage['/editor/selection.js'].functionData[19] = 0;
  _$jscoverage['/editor/selection.js'].functionData[20] = 0;
  _$jscoverage['/editor/selection.js'].functionData[21] = 0;
  _$jscoverage['/editor/selection.js'].functionData[22] = 0;
  _$jscoverage['/editor/selection.js'].functionData[23] = 0;
  _$jscoverage['/editor/selection.js'].functionData[24] = 0;
}
if (! _$jscoverage['/editor/selection.js'].branchData) {
  _$jscoverage['/editor/selection.js'].branchData = {};
  _$jscoverage['/editor/selection.js'].branchData['51'] = [];
  _$jscoverage['/editor/selection.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'] = [];
  _$jscoverage['/editor/selection.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'] = [];
  _$jscoverage['/editor/selection.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'] = [];
  _$jscoverage['/editor/selection.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['85'] = [];
  _$jscoverage['/editor/selection.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['90'] = [];
  _$jscoverage['/editor/selection.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['114'] = [];
  _$jscoverage['/editor/selection.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['120'] = [];
  _$jscoverage['/editor/selection.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['122'] = [];
  _$jscoverage['/editor/selection.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['129'] = [];
  _$jscoverage['/editor/selection.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['130'] = [];
  _$jscoverage['/editor/selection.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['131'] = [];
  _$jscoverage['/editor/selection.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['141'] = [];
  _$jscoverage['/editor/selection.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['150'] = [];
  _$jscoverage['/editor/selection.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['153'] = [];
  _$jscoverage['/editor/selection.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['161'] = [];
  _$jscoverage['/editor/selection.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['188'] = [];
  _$jscoverage['/editor/selection.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['191'] = [];
  _$jscoverage['/editor/selection.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['201'] = [];
  _$jscoverage['/editor/selection.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['205'] = [];
  _$jscoverage['/editor/selection.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['206'] = [];
  _$jscoverage['/editor/selection.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['206'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['206'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['208'] = [];
  _$jscoverage['/editor/selection.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['215'] = [];
  _$jscoverage['/editor/selection.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['229'] = [];
  _$jscoverage['/editor/selection.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['241'] = [];
  _$jscoverage['/editor/selection.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['257'] = [];
  _$jscoverage['/editor/selection.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['265'] = [];
  _$jscoverage['/editor/selection.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['269'] = [];
  _$jscoverage['/editor/selection.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['272'] = [];
  _$jscoverage['/editor/selection.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['279'] = [];
  _$jscoverage['/editor/selection.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['282'] = [];
  _$jscoverage['/editor/selection.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['289'] = [];
  _$jscoverage['/editor/selection.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['289'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['306'] = [];
  _$jscoverage['/editor/selection.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['315'] = [];
  _$jscoverage['/editor/selection.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['318'] = [];
  _$jscoverage['/editor/selection.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['340'] = [];
  _$jscoverage['/editor/selection.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['354'] = [];
  _$jscoverage['/editor/selection.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['355'] = [];
  _$jscoverage['/editor/selection.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['365'] = [];
  _$jscoverage['/editor/selection.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['365'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['376'] = [];
  _$jscoverage['/editor/selection.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['382'] = [];
  _$jscoverage['/editor/selection.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['387'] = [];
  _$jscoverage['/editor/selection.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['387'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['395'] = [];
  _$jscoverage['/editor/selection.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['402'] = [];
  _$jscoverage['/editor/selection.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['402'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['405'] = [];
  _$jscoverage['/editor/selection.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['429'] = [];
  _$jscoverage['/editor/selection.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['434'] = [];
  _$jscoverage['/editor/selection.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['436'] = [];
  _$jscoverage['/editor/selection.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['442'] = [];
  _$jscoverage['/editor/selection.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['453'] = [];
  _$jscoverage['/editor/selection.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['453'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['454'] = [];
  _$jscoverage['/editor/selection.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['454'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['456'] = [];
  _$jscoverage['/editor/selection.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['485'] = [];
  _$jscoverage['/editor/selection.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['517'] = [];
  _$jscoverage['/editor/selection.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['518'] = [];
  _$jscoverage['/editor/selection.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['527'] = [];
  _$jscoverage['/editor/selection.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['534'] = [];
  _$jscoverage['/editor/selection.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['538'] = [];
  _$jscoverage['/editor/selection.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['547'] = [];
  _$jscoverage['/editor/selection.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['548'] = [];
  _$jscoverage['/editor/selection.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['548'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['548'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['548'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['548'][5] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['549'] = [];
  _$jscoverage['/editor/selection.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['549'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['570'] = [];
  _$jscoverage['/editor/selection.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['580'] = [];
  _$jscoverage['/editor/selection.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['582'] = [];
  _$jscoverage['/editor/selection.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['590'] = [];
  _$jscoverage['/editor/selection.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['595'] = [];
  _$jscoverage['/editor/selection.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['596'] = [];
  _$jscoverage['/editor/selection.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['597'] = [];
  _$jscoverage['/editor/selection.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['598'] = [];
  _$jscoverage['/editor/selection.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['607'] = [];
  _$jscoverage['/editor/selection.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['628'] = [];
  _$jscoverage['/editor/selection.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['636'] = [];
  _$jscoverage['/editor/selection.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['637'] = [];
  _$jscoverage['/editor/selection.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['639'] = [];
  _$jscoverage['/editor/selection.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['654'] = [];
  _$jscoverage['/editor/selection.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['655'] = [];
  _$jscoverage['/editor/selection.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['655'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['674'] = [];
  _$jscoverage['/editor/selection.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['697'] = [];
  _$jscoverage['/editor/selection.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['697'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['698'] = [];
  _$jscoverage['/editor/selection.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['700'] = [];
  _$jscoverage['/editor/selection.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['707'] = [];
  _$jscoverage['/editor/selection.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['707'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['707'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['709'] = [];
  _$jscoverage['/editor/selection.js'].branchData['709'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['709'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['718'] = [];
  _$jscoverage['/editor/selection.js'].branchData['718'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['729'] = [];
  _$jscoverage['/editor/selection.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['744'] = [];
  _$jscoverage['/editor/selection.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['748'] = [];
  _$jscoverage['/editor/selection.js'].branchData['748'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['748'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['748'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['751'] = [];
  _$jscoverage['/editor/selection.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['751'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['753'] = [];
  _$jscoverage['/editor/selection.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['754'] = [];
  _$jscoverage['/editor/selection.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['767'] = [];
  _$jscoverage['/editor/selection.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['772'] = [];
  _$jscoverage['/editor/selection.js'].branchData['772'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['780'] = [];
  _$jscoverage['/editor/selection.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['781'] = [];
  _$jscoverage['/editor/selection.js'].branchData['781'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['789'] = [];
  _$jscoverage['/editor/selection.js'].branchData['789'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['803'] = [];
  _$jscoverage['/editor/selection.js'].branchData['803'][1] = new BranchData();
}
_$jscoverage['/editor/selection.js'].branchData['803'][1].init(60, 21, '!sel || sel.isInvalid');
function visit745_803_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['803'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['789'][1].init(484, 9, 'dummySpan');
function visit744_789_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['789'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['781'][1].init(30, 18, 'isStartMarkerAlone');
function visit743_781_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['781'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['780'][1].init(5417, 9, 'collapsed');
function visit742_780_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['772'][1].init(401, 25, 'startNode[0] || startNode');
function visit741_772_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['772'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['767'][1].init(1918, 18, 'isStartMarkerAlone');
function visit740_767_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['754'][1].init(76, 50, 'Dom.nodeName(startNode[0].previousSibling) == \'br\'');
function visit739_754_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['753'][1].init(-1, 127, 'startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\'');
function visit738_753_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['751'][2].init(214, 283, '!startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\')');
function visit737_751_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['751'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['751'][1].init(199, 298, 'forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\')');
function visit736_751_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['748'][3].init(63, 55, 'next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit735_748_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['748'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['748'][2].init(55, 63, 'next && next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit734_748_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['748'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['748'][1].init(-1, 537, '!(next && next.nodeValue && next.nodeValue.match(fillerTextRegex)) && (forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) == \'br\'))');
function visit733_748_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['748'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['744'][1].init(457, 29, 'next && !notWhitespaces(next)');
function visit732_744_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['729'][1].init(2212, 7, 'endNode');
function visit731_729_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['718'][1].init(1735, 10, '!collapsed');
function visit730_718_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['718'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['709'][2].init(1265, 58, 'self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit729_709_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['709'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['709'][1].init(159, 127, 'self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit728_709_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['707'][3].init(1103, 60, 'self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit727_707_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['707'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['707'][2].init(1103, 131, 'self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells');
function visit726_707_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['707'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['707'][1].init(1103, 287, 'self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells || self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit725_707_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['700'][1].init(120, 43, 'selEl.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit724_700_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['698'][1].init(79, 38, 'self.endOffset - self.startOffset == 1');
function visit723_698_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['697'][2].init(393, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit722_697_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['697'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['697'][1].init(106, 118, 'self.startContainer[0] === self.endContainer[0] && self.endOffset - self.startOffset == 1');
function visit721_697_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['674'][1].init(296, 51, 'e.toString().indexOf(\'NS_ERROR_ILLEGAL_VALUE\') >= 0');
function visit720_674_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['655'][2].init(302, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit719_655_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['655'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['655'][1].init(38, 95, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit718_655_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['654'][1].init(261, 134, 'self.collapsed && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit717_654_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['639'][1].init(18, 18, 'sel && sel.clear()');
function visit716_639_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['637'][1].init(18, 28, 'sel && sel.removeAllRanges()');
function visit715_637_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['636'][1].init(59, 7, '!OLD_IE');
function visit714_636_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['628'][1].init(196, 184, 'start && start.scrollIntoView(undefined, {\n  alignWithTop: false, \n  allowHorizontalScroll: true, \n  onlyScrollIfNeeded: true})');
function visit713_628_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['607'][1].init(73, 20, 'i < bookmarks.length');
function visit712_607_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['598'][1].init(486, 68, 'Dom.equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++');
function visit711_598_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['597'][1].init(393, 70, 'Dom.equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++');
function visit710_597_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['596'][1].init(298, 72, 'Dom.equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++');
function visit709_596_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['595'][1].init(201, 74, 'Dom.equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++');
function visit708_595_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['590'][1].init(500, 10, 'j < length');
function visit707_590_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['582'][1].init(246, 10, 'i < length');
function visit706_582_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['580'][1].init(148, 26, 'ranges || self.getRanges()');
function visit705_580_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['570'][1].init(109, 17, 'i < ranges.length');
function visit704_570_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['549'][2].init(604, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit703_549_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['549'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['549'][1].init(88, 95, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit702_549_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['548'][5].init(549, 24, 'UA.opera || UA[\'webkit\']');
function visit701_548_5(result) {
  _$jscoverage['/editor/selection.js'].branchData['548'][5].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['548'][4].init(526, 17, 'UA.gecko < 1.0900');
function visit700_548_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['548'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['548'][3].init(514, 29, 'UA.gecko && UA.gecko < 1.0900');
function visit699_548_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['548'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['548'][2].init(514, 59, '(UA.gecko && UA.gecko < 1.0900) || UA.opera || UA[\'webkit\']');
function visit698_548_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['548'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['548'][1].init(46, 184, '((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA[\'webkit\']) && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit697_548_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['547'][1].init(465, 231, 'range.collapsed && ((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA[\'webkit\']) && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit696_547_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['538'][1].init(196, 17, 'i < ranges.length');
function visit695_538_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['534'][1].init(67, 4, '!sel');
function visit694_534_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['527'][1].init(474, 11, 'ranges[0]');
function visit693_527_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['518'][1].init(22, 17, 'ranges.length > 1');
function visit692_518_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['517'][1].init(48, 6, 'OLD_IE');
function visit691_517_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['485'][1].init(110, 6, 'OLD_IE');
function visit690_485_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['456'][1].init(130, 99, 'styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit689_456_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['454'][2].init(77, 49, 'enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit688_454_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['454'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['454'][1].init(71, 230, '(enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit687_454_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['453'][2].init(369, 302, '(enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit686_453_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['453'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['453'][1].init(41, 312, 'i && !((enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed))');
function visit685_453_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['442'][1].init(584, 5, '!node');
function visit684_442_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['436'][1].init(86, 27, 'range.item && range.item(0)');
function visit683_436_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['434'][1].init(288, 6, 'OLD_IE');
function visit682_434_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['429'][1].init(112, 35, 'cache.selectedElement !== undefined');
function visit681_429_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['405'][1].init(241, 4, 'node');
function visit680_405_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['402'][2].init(86, 42, 'node.nodeType != Dom.NodeType.ELEMENT_NODE');
function visit679_402_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['402'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['402'][1].init(78, 50, 'node && node.nodeType != Dom.NodeType.ELEMENT_NODE');
function visit678_402_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['395'][1].init(2164, 6, 'OLD_IE');
function visit677_395_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['387'][2].init(1686, 43, 'child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit676_387_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['387'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['387'][1].init(1677, 52, 'child && child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit675_387_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['382'][2].init(1436, 45, 'node[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit674_382_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['382'][1].init(1424, 57, '!node[0] || node[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit673_382_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['376'][1].init(1167, 45, 'node[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit672_376_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['365'][3].init(286, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit671_365_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['365'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['365'][2].init(269, 187, 'startOffset == (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)');
function visit670_365_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['365'][1].init(269, 265, 'startOffset == (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length) && !startContainer._4e_isBlockBoundary()');
function visit669_365_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['355'][1].init(30, 16, '!range.collapsed');
function visit668_355_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['354'][1].init(108, 5, 'range');
function visit667_354_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['340'][1].init(70, 32, 'cache.startElement !== undefined');
function visit666_340_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['318'][1].init(459, 18, 'i < sel.rangeCount');
function visit665_318_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['315'][1].init(386, 4, '!sel');
function visit664_315_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['306'][1].init(78, 22, 'cache.ranges && !force');
function visit663_306_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['289'][3].init(318, 38, 'parentElement.childNodes[j] != element');
function visit662_289_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['289'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['289'][2].init(279, 35, 'j < parentElement.childNodes.length');
function visit661_289_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['289'][1].init(279, 77, 'j < parentElement.childNodes.length && parentElement.childNodes[j] != element');
function visit660_289_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['282'][1].init(101, 22, 'i < nativeRange.length');
function visit659_282_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['279'][1].init(1184, 29, 'type == KES.SELECTION_ELEMENT');
function visit658_279_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['272'][1].init(644, 26, 'type == KES.SELECTION_TEXT');
function visit657_272_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['269'][1].init(575, 4, '!sel');
function visit656_269_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['265'][1].init(66, 24, 'sel && sel.createRange()');
function visit655_265_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['257'][1].init(86, 22, 'cache.ranges && !force');
function visit654_257_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['241'][1].init(2943, 14, 'distance === 0');
function visit653_241_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['229'][1].init(33, 12, 'distance > 0');
function visit652_229_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['215'][1].init(1742, 10, '!testRange');
function visit651_215_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['208'][1].init(958, 14, '!comparisonEnd');
function visit650_208_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['206'][3].init(21, 21, 'comparisonStart == -1');
function visit649_206_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['206'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['206'][2].init(802, 18, 'comparisonEnd == 1');
function visit648_206_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['206'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['206'][1].init(52, 43, 'comparisonEnd == 1 && comparisonStart == -1');
function visit647_206_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['205'][1].init(747, 96, '!comparisonStart || comparisonEnd == 1 && comparisonStart == -1');
function visit646_205_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['201'][1].init(455, 19, 'comparisonStart > 0');
function visit645_201_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['191'][1].init(84, 43, 'child.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit644_191_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['188'][1].init(409, 19, 'i < siblings.length');
function visit643_188_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['161'][1].init(665, 31, 'sel.createRange().parentElement');
function visit642_161_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['153'][1].init(218, 19, 'ieType == \'Control\'');
function visit641_153_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['150'][1].init(121, 16, 'ieType == \'Text\'');
function visit640_150_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['141'][1].init(78, 10, 'cache.type');
function visit639_141_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['131'][2].init(412, 48, 'Number(range.endOffset - range.startOffset) == 1');
function visit638_131_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['131'][1].init(80, 169, 'Number(range.endOffset - range.startOffset) == 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit637_131_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['130'][2].init(330, 52, 'startContainer.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit636_130_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['130'][1].init(64, 250, 'startContainer.nodeType == Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) == 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit635_130_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['129'][2].init(263, 36, 'startContainer == range.endContainer');
function visit634_129_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['129'][1].init(263, 315, 'startContainer == range.endContainer && startContainer.nodeType == Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) == 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit633_129_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['122'][1].init(329, 19, 'sel.rangeCount == 1');
function visit632_122_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['120'][1].init(248, 4, '!sel');
function visit631_120_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['114'][1].init(78, 10, 'cache.type');
function visit630_114_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['90'][1].init(81, 64, 'cache.nativeSel || (cache.nativeSel = self.document.selection)');
function visit629_90_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['85'][1].init(102, 84, 'cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection())');
function visit628_85_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][2].init(104, 47, 'range.parentElement().ownerDocument != document');
function visit627_56_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][1].init(81, 70, 'range.parentElement && range.parentElement().ownerDocument != document');
function visit626_56_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][3].init(132, 39, 'range.item(0).ownerDocument != document');
function visit625_55_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][2].init(118, 53, 'range.item && range.item(0).ownerDocument != document');
function visit624_55_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][1].init(32, 154, '(range.item && range.item(0).ownerDocument != document) || (range.parentElement && range.parentElement().ownerDocument != document)');
function visit623_55_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][1].init(83, 187, '!range || (range.item && range.item(0).ownerDocument != document) || (range.parentElement && range.parentElement().ownerDocument != document)');
function visit622_54_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['51'][1].init(301, 6, 'OLD_IE');
function visit621_51_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].lineData[10]++;
KISSY.add("editor/selection", function(S, Editor) {
  _$jscoverage['/editor/selection.js'].functionData[0]++;
  _$jscoverage['/editor/selection.js'].lineData[15]++;
  Editor.SelectionType = {
  SELECTION_NONE: 1, 
  SELECTION_TEXT: 2, 
  SELECTION_ELEMENT: 3};
  _$jscoverage['/editor/selection.js'].lineData[20]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, Node = S.Node, KES = Editor.SelectionType, KER = Editor.RangeType, OLD_IE = UA['ie'], Walker = Editor.Walker, KERange = Editor.Range;
  _$jscoverage['/editor/selection.js'].lineData[40]++;
  function KESelection(document) {
    _$jscoverage['/editor/selection.js'].functionData[1]++;
    _$jscoverage['/editor/selection.js'].lineData[41]++;
    var self = this;
    _$jscoverage['/editor/selection.js'].lineData[42]++;
    self.document = document;
    _$jscoverage['/editor/selection.js'].lineData[43]++;
    self._ = {
  cache: {}};
    _$jscoverage['/editor/selection.js'].lineData[51]++;
    if (visit621_51_1(OLD_IE)) {
      _$jscoverage['/editor/selection.js'].lineData[52]++;
      try {
        _$jscoverage['/editor/selection.js'].lineData[53]++;
        var range = self.getNative().createRange();
        _$jscoverage['/editor/selection.js'].lineData[54]++;
        if (visit622_54_1(!range || visit623_55_1((visit624_55_2(range.item && visit625_55_3(range.item(0).ownerDocument != document))) || (visit626_56_1(range.parentElement && visit627_56_2(range.parentElement().ownerDocument != document)))))) {
          _$jscoverage['/editor/selection.js'].lineData[57]++;
          self.isInvalid = TRUE;
        }
      }      catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[63]++;
  self.isInvalid = TRUE;
}
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[68]++;
  var styleObjectElements = {
  "img": 1, 
  "hr": 1, 
  "li": 1, 
  "table": 1, 
  "tr": 1, 
  "td": 1, 
  "th": 1, 
  "embed": 1, 
  "object": 1, 
  "ol": 1, 
  "ul": 1, 
  "a": 1, 
  "input": 1, 
  "form": 1, 
  "select": 1, 
  "textarea": 1, 
  "button": 1, 
  "fieldset": 1, 
  "thead": 1, 
  "tfoot": 1};
  _$jscoverage['/editor/selection.js'].lineData[73]++;
  S.augment(KESelection, {
  getNative: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[2]++;
  _$jscoverage['/editor/selection.js'].lineData[83]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[85]++;
  return visit628_85_1(cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection()));
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[3]++;
  _$jscoverage['/editor/selection.js'].lineData[89]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[90]++;
  return visit629_90_1(cache.nativeSel || (cache.nativeSel = self.document.selection));
}, 
  getType: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[4]++;
  _$jscoverage['/editor/selection.js'].lineData[113]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[114]++;
  if (visit630_114_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[115]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[117]++;
  var type = KES.SELECTION_TEXT, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[120]++;
  if (visit631_120_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[121]++;
    type = KES.SELECTION_NONE;
  } else {
    _$jscoverage['/editor/selection.js'].lineData[122]++;
    if (visit632_122_1(sel.rangeCount == 1)) {
      _$jscoverage['/editor/selection.js'].lineData[126]++;
      var range = sel.getRangeAt(0), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[129]++;
      if (visit633_129_1(visit634_129_2(startContainer == range.endContainer) && visit635_130_1(visit636_130_2(startContainer.nodeType == Dom.NodeType.ELEMENT_NODE) && visit637_131_1(visit638_131_2(Number(range.endOffset - range.startOffset) == 1) && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()])))) {
        _$jscoverage['/editor/selection.js'].lineData[133]++;
        type = KES.SELECTION_ELEMENT;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[137]++;
  return (cache.type = type);
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[5]++;
  _$jscoverage['/editor/selection.js'].lineData[140]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[141]++;
  if (visit639_141_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[142]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[144]++;
  var type = KES.SELECTION_NONE;
  _$jscoverage['/editor/selection.js'].lineData[146]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[147]++;
    var sel = self.getNative(), ieType = sel.type;
    _$jscoverage['/editor/selection.js'].lineData[150]++;
    if (visit640_150_1(ieType == 'Text')) {
      _$jscoverage['/editor/selection.js'].lineData[151]++;
      type = KES.SELECTION_TEXT;
    }
    _$jscoverage['/editor/selection.js'].lineData[153]++;
    if (visit641_153_1(ieType == 'Control')) {
      _$jscoverage['/editor/selection.js'].lineData[154]++;
      type = KES.SELECTION_ELEMENT;
    }
    _$jscoverage['/editor/selection.js'].lineData[161]++;
    if (visit642_161_1(sel.createRange().parentElement)) {
      _$jscoverage['/editor/selection.js'].lineData[162]++;
      type = KES.SELECTION_TEXT;
    }
  }  catch (e) {
}
  _$jscoverage['/editor/selection.js'].lineData[167]++;
  return (cache.type = type);
}, 
  getRanges: OLD_IE ? (function() {
  _$jscoverage['/editor/selection.js'].functionData[6]++;
  _$jscoverage['/editor/selection.js'].lineData[179]++;
  var getBoundaryInformation = function(range, start) {
  _$jscoverage['/editor/selection.js'].functionData[7]++;
  _$jscoverage['/editor/selection.js'].lineData[181]++;
  range = range.duplicate();
  _$jscoverage['/editor/selection.js'].lineData[182]++;
  range.collapse(start);
  _$jscoverage['/editor/selection.js'].lineData[185]++;
  var parent = range.parentElement(), siblings = parent.childNodes, testRange;
  _$jscoverage['/editor/selection.js'].lineData[188]++;
  for (var i = 0; visit643_188_1(i < siblings.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[189]++;
    var child = siblings[i];
    _$jscoverage['/editor/selection.js'].lineData[191]++;
    if (visit644_191_1(child.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[192]++;
      testRange = range.duplicate();
      _$jscoverage['/editor/selection.js'].lineData[194]++;
      testRange.moveToElementText(child);
      _$jscoverage['/editor/selection.js'].lineData[196]++;
      var comparisonStart = testRange.compareEndPoints('StartToStart', range), comparisonEnd = testRange.compareEndPoints('EndToStart', range);
      _$jscoverage['/editor/selection.js'].lineData[199]++;
      testRange.collapse();
      _$jscoverage['/editor/selection.js'].lineData[201]++;
      if (visit645_201_1(comparisonStart > 0)) {
        _$jscoverage['/editor/selection.js'].lineData[202]++;
        break;
      } else {
        _$jscoverage['/editor/selection.js'].lineData[205]++;
        if (visit646_205_1(!comparisonStart || visit647_206_1(visit648_206_2(comparisonEnd == 1) && visit649_206_3(comparisonStart == -1)))) {
          _$jscoverage['/editor/selection.js'].lineData[207]++;
          return {
  container: parent, 
  offset: i};
        } else {
          _$jscoverage['/editor/selection.js'].lineData[208]++;
          if (visit650_208_1(!comparisonEnd)) {
            _$jscoverage['/editor/selection.js'].lineData[209]++;
            return {
  container: parent, 
  offset: i + 1};
          }
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[211]++;
      testRange = NULL;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[215]++;
  if (visit651_215_1(!testRange)) {
    _$jscoverage['/editor/selection.js'].lineData[216]++;
    testRange = range.duplicate();
    _$jscoverage['/editor/selection.js'].lineData[217]++;
    testRange.moveToElementText(parent);
    _$jscoverage['/editor/selection.js'].lineData[218]++;
    testRange.collapse(FALSE);
  }
  _$jscoverage['/editor/selection.js'].lineData[221]++;
  testRange.setEndPoint('StartToStart', range);
  _$jscoverage['/editor/selection.js'].lineData[225]++;
  var distance = String(testRange.text).replace(/\r\n|\r/g, '\n').length;
  _$jscoverage['/editor/selection.js'].lineData[228]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[229]++;
    while (visit652_229_1(distance > 0)) {
      _$jscoverage['/editor/selection.js'].lineData[233]++;
      distance -= siblings[--i].nodeValue.length;
    }
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[237]++;
  distance = 0;
}
  _$jscoverage['/editor/selection.js'].lineData[241]++;
  if (visit653_241_1(distance === 0)) {
    _$jscoverage['/editor/selection.js'].lineData[242]++;
    return {
  container: parent, 
  offset: i};
  } else {
    _$jscoverage['/editor/selection.js'].lineData[248]++;
    return {
  container: siblings[i], 
  offset: -distance};
  }
};
  _$jscoverage['/editor/selection.js'].lineData[255]++;
  return function(force) {
  _$jscoverage['/editor/selection.js'].functionData[8]++;
  _$jscoverage['/editor/selection.js'].lineData[256]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[257]++;
  if (visit654_257_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[258]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[264]++;
  var sel = self.getNative(), nativeRange = visit655_265_1(sel && sel.createRange()), type = self.getType(), range;
  _$jscoverage['/editor/selection.js'].lineData[269]++;
  if (visit656_269_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[270]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[272]++;
  if (visit657_272_1(type == KES.SELECTION_TEXT)) {
    _$jscoverage['/editor/selection.js'].lineData[273]++;
    range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[274]++;
    var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
    _$jscoverage['/editor/selection.js'].lineData[275]++;
    range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[276]++;
    boundaryInfo = getBoundaryInformation(nativeRange);
    _$jscoverage['/editor/selection.js'].lineData[277]++;
    range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[278]++;
    return (cache.ranges = [range]);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[279]++;
    if (visit658_279_1(type == KES.SELECTION_ELEMENT)) {
      _$jscoverage['/editor/selection.js'].lineData[280]++;
      var retval = cache.ranges = [];
      _$jscoverage['/editor/selection.js'].lineData[282]++;
      for (var i = 0; visit659_282_1(i < nativeRange.length); i++) {
        _$jscoverage['/editor/selection.js'].lineData[283]++;
        var element = nativeRange.item(i), parentElement = element.parentNode, j = 0;
        _$jscoverage['/editor/selection.js'].lineData[287]++;
        range = new KERange(self.document);
        _$jscoverage['/editor/selection.js'].lineData[289]++;
        for (; visit660_289_1(visit661_289_2(j < parentElement.childNodes.length) && visit662_289_3(parentElement.childNodes[j] != element)); j++) {
        }
        _$jscoverage['/editor/selection.js'].lineData[292]++;
        range.setStart(new Node(parentElement), j);
        _$jscoverage['/editor/selection.js'].lineData[293]++;
        range.setEnd(new Node(parentElement), j + 1);
        _$jscoverage['/editor/selection.js'].lineData[294]++;
        retval.push(range);
      }
      _$jscoverage['/editor/selection.js'].lineData[297]++;
      return retval;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[300]++;
  return (cache.ranges = []);
};
})() : function(force) {
  _$jscoverage['/editor/selection.js'].functionData[9]++;
  _$jscoverage['/editor/selection.js'].lineData[305]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[306]++;
  if (visit663_306_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[307]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[313]++;
  var ranges = [], sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[315]++;
  if (visit664_315_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[316]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[318]++;
  for (var i = 0; visit665_318_1(i < sel.rangeCount); i++) {
    _$jscoverage['/editor/selection.js'].lineData[319]++;
    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[321]++;
    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
    _$jscoverage['/editor/selection.js'].lineData[322]++;
    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
    _$jscoverage['/editor/selection.js'].lineData[323]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[326]++;
  return (cache.ranges = ranges);
}, 
  getStartElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[10]++;
  _$jscoverage['/editor/selection.js'].lineData[339]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[340]++;
  if (visit666_340_1(cache.startElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[341]++;
    return cache.startElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[343]++;
  var node, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[346]++;
  switch (self.getType()) {
    case KES.SELECTION_ELEMENT:
      _$jscoverage['/editor/selection.js'].lineData[348]++;
      return this.getSelectedElement();
    case KES.SELECTION_TEXT:
      _$jscoverage['/editor/selection.js'].lineData[352]++;
      var range = self.getRanges()[0];
      _$jscoverage['/editor/selection.js'].lineData[354]++;
      if (visit667_354_1(range)) {
        _$jscoverage['/editor/selection.js'].lineData[355]++;
        if (visit668_355_1(!range.collapsed)) {
          _$jscoverage['/editor/selection.js'].lineData[356]++;
          range.optimize();
          _$jscoverage['/editor/selection.js'].lineData[361]++;
          while (TRUE) {
            _$jscoverage['/editor/selection.js'].lineData[362]++;
            var startContainer = range.startContainer, startOffset = range.startOffset;
            _$jscoverage['/editor/selection.js'].lineData[365]++;
            if (visit669_365_1(visit670_365_2(startOffset == (visit671_365_3(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)) && !startContainer._4e_isBlockBoundary())) {
              _$jscoverage['/editor/selection.js'].lineData[368]++;
              range.setStartAfter(startContainer);
            } else {
              _$jscoverage['/editor/selection.js'].lineData[370]++;
              break;
            }
          }
          _$jscoverage['/editor/selection.js'].lineData[374]++;
          node = range.startContainer;
          _$jscoverage['/editor/selection.js'].lineData[376]++;
          if (visit672_376_1(node[0].nodeType != Dom.NodeType.ELEMENT_NODE)) {
            _$jscoverage['/editor/selection.js'].lineData[377]++;
            return node.parent();
          }
          _$jscoverage['/editor/selection.js'].lineData[380]++;
          node = new Node(node[0].childNodes[range.startOffset]);
          _$jscoverage['/editor/selection.js'].lineData[382]++;
          if (visit673_382_1(!node[0] || visit674_382_2(node[0].nodeType != Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[383]++;
            return range.startContainer;
          }
          _$jscoverage['/editor/selection.js'].lineData[386]++;
          var child = node[0].firstChild;
          _$jscoverage['/editor/selection.js'].lineData[387]++;
          while (visit675_387_1(child && visit676_387_2(child.nodeType == Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[388]++;
            node = new Node(child);
            _$jscoverage['/editor/selection.js'].lineData[389]++;
            child = child.firstChild;
          }
          _$jscoverage['/editor/selection.js'].lineData[391]++;
          return node;
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[395]++;
      if (visit677_395_1(OLD_IE)) {
        _$jscoverage['/editor/selection.js'].lineData[396]++;
        range = sel.createRange();
        _$jscoverage['/editor/selection.js'].lineData[397]++;
        range.collapse(TRUE);
        _$jscoverage['/editor/selection.js'].lineData[398]++;
        node = new Node(range.parentElement());
      } else {
        _$jscoverage['/editor/selection.js'].lineData[401]++;
        node = sel.anchorNode;
        _$jscoverage['/editor/selection.js'].lineData[402]++;
        if (visit678_402_1(node && visit679_402_2(node.nodeType != Dom.NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/selection.js'].lineData[403]++;
          node = node.parentNode;
        }
        _$jscoverage['/editor/selection.js'].lineData[405]++;
        if (visit680_405_1(node)) {
          _$jscoverage['/editor/selection.js'].lineData[406]++;
          node = new Node(node);
        }
      }
  }
  _$jscoverage['/editor/selection.js'].lineData[411]++;
  return cache.startElement = node;
}, 
  getSelectedElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[11]++;
  _$jscoverage['/editor/selection.js'].lineData[425]++;
  var self = this, node, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[429]++;
  if (visit681_429_1(cache.selectedElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[430]++;
    return cache.selectedElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[434]++;
  if (visit682_434_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[435]++;
    var range = self.getNative().createRange();
    _$jscoverage['/editor/selection.js'].lineData[436]++;
    node = visit683_436_1(range.item && range.item(0));
  }
  _$jscoverage['/editor/selection.js'].lineData[442]++;
  if (visit684_442_1(!node)) {
    _$jscoverage['/editor/selection.js'].lineData[443]++;
    node = (function() {
  _$jscoverage['/editor/selection.js'].functionData[12]++;
  _$jscoverage['/editor/selection.js'].lineData[444]++;
  var range = self.getRanges()[0], enclosed, selected;
  _$jscoverage['/editor/selection.js'].lineData[452]++;
  for (var i = 2; visit685_453_1(i && !(visit686_453_2((enclosed = range.getEnclosedNode()) && visit687_454_1((visit688_454_2(enclosed[0].nodeType == Dom.NodeType.ELEMENT_NODE)) && visit689_456_1(styleObjectElements[enclosed.nodeName()] && (selected = enclosed)))))); i--) {
    _$jscoverage['/editor/selection.js'].lineData[464]++;
    range.shrink(KER.SHRINK_ELEMENT);
  }
  _$jscoverage['/editor/selection.js'].lineData[467]++;
  return selected;
})();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[470]++;
    node = new Node(node);
  }
  _$jscoverage['/editor/selection.js'].lineData[473]++;
  return cache.selectedElement = node;
}, 
  reset: function() {
  _$jscoverage['/editor/selection.js'].functionData[13]++;
  _$jscoverage['/editor/selection.js'].lineData[478]++;
  this._.cache = {};
}, 
  selectElement: function(element) {
  _$jscoverage['/editor/selection.js'].functionData[14]++;
  _$jscoverage['/editor/selection.js'].lineData[482]++;
  var range, self = this, doc = self.document;
  _$jscoverage['/editor/selection.js'].lineData[485]++;
  if (visit690_485_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[489]++;
    try {
      _$jscoverage['/editor/selection.js'].lineData[491]++;
      range = doc.body['createControlRange']();
      _$jscoverage['/editor/selection.js'].lineData[492]++;
      range['addElement'](element[0]);
      _$jscoverage['/editor/selection.js'].lineData[493]++;
      range.select();
    }    catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[496]++;
  range = doc.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[497]++;
  range.moveToElementText(element[0]);
  _$jscoverage['/editor/selection.js'].lineData[498]++;
  range.select();
}
 finally     {
    }
    _$jscoverage['/editor/selection.js'].lineData[502]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[505]++;
    range = doc.createRange();
    _$jscoverage['/editor/selection.js'].lineData[506]++;
    range.selectNode(element[0]);
    _$jscoverage['/editor/selection.js'].lineData[508]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[509]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[510]++;
    sel.addRange(range);
    _$jscoverage['/editor/selection.js'].lineData[511]++;
    self.reset();
  }
}, 
  selectRanges: function(ranges) {
  _$jscoverage['/editor/selection.js'].functionData[15]++;
  _$jscoverage['/editor/selection.js'].lineData[516]++;
  var self = this;
  _$jscoverage['/editor/selection.js'].lineData[517]++;
  if (visit691_517_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[518]++;
    if (visit692_518_1(ranges.length > 1)) {
      _$jscoverage['/editor/selection.js'].lineData[520]++;
      var last = ranges[ranges.length - 1];
      _$jscoverage['/editor/selection.js'].lineData[521]++;
      ranges[0].setEnd(last.endContainer, last.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[522]++;
      ranges.length = 1;
    }
    _$jscoverage['/editor/selection.js'].lineData[527]++;
    if (visit693_527_1(ranges[0])) {
      _$jscoverage['/editor/selection.js'].lineData[528]++;
      ranges[0].select();
    }
    _$jscoverage['/editor/selection.js'].lineData[530]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[533]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[534]++;
    if (visit694_534_1(!sel)) {
      _$jscoverage['/editor/selection.js'].lineData[535]++;
      return;
    }
    _$jscoverage['/editor/selection.js'].lineData[537]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[538]++;
    for (var i = 0; visit695_538_1(i < ranges.length); i++) {
      _$jscoverage['/editor/selection.js'].lineData[539]++;
      var range = ranges[i], nativeRange = self.document.createRange(), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[547]++;
      if (visit696_547_1(range.collapsed && visit697_548_1((visit698_548_2((visit699_548_3(UA.gecko && visit700_548_4(UA.gecko < 1.0900))) || visit701_548_5(UA.opera || UA['webkit']))) && visit702_549_1(visit703_549_2(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length)))) {
        _$jscoverage['/editor/selection.js'].lineData[551]++;
        startContainer[0].appendChild(self.document.createTextNode(UA['webkit'] ? "\u200b" : ""));
        _$jscoverage['/editor/selection.js'].lineData[554]++;
        range.startOffset++;
        _$jscoverage['/editor/selection.js'].lineData[555]++;
        range.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[558]++;
      nativeRange.setStart(startContainer[0], range.startOffset);
      _$jscoverage['/editor/selection.js'].lineData[559]++;
      nativeRange.setEnd(range.endContainer[0], range.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[561]++;
      sel.addRange(nativeRange);
    }
    _$jscoverage['/editor/selection.js'].lineData[563]++;
    self.reset();
  }
}, 
  createBookmarks2: function(normalized) {
  _$jscoverage['/editor/selection.js'].functionData[16]++;
  _$jscoverage['/editor/selection.js'].lineData[567]++;
  var bookmarks = [], ranges = this.getRanges();
  _$jscoverage['/editor/selection.js'].lineData[570]++;
  for (var i = 0; visit704_570_1(i < ranges.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[571]++;
    bookmarks.push(ranges[i].createBookmark2(normalized));
  }
  _$jscoverage['/editor/selection.js'].lineData[573]++;
  return bookmarks;
}, 
  createBookmarks: function(serializable, ranges) {
  _$jscoverage['/editor/selection.js'].functionData[17]++;
  _$jscoverage['/editor/selection.js'].lineData[576]++;
  var self = this, retval = [], doc = self.document, bookmark;
  _$jscoverage['/editor/selection.js'].lineData[580]++;
  ranges = visit705_580_1(ranges || self.getRanges());
  _$jscoverage['/editor/selection.js'].lineData[581]++;
  var length = ranges.length;
  _$jscoverage['/editor/selection.js'].lineData[582]++;
  for (var i = 0; visit706_582_1(i < length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[583]++;
    retval.push(bookmark = ranges[i].createBookmark(serializable, TRUE));
    _$jscoverage['/editor/selection.js'].lineData[584]++;
    serializable = bookmark.serializable;
    _$jscoverage['/editor/selection.js'].lineData[586]++;
    var bookmarkStart = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode, bookmarkEnd = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/selection.js'].lineData[590]++;
    for (var j = i + 1; visit707_590_1(j < length); j++) {
      _$jscoverage['/editor/selection.js'].lineData[591]++;
      var dirtyRange = ranges[j], rangeStart = dirtyRange.startContainer, rangeEnd = dirtyRange.endContainer;
      _$jscoverage['/editor/selection.js'].lineData[595]++;
      visit708_595_1(Dom.equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++);
      _$jscoverage['/editor/selection.js'].lineData[596]++;
      visit709_596_1(Dom.equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++);
      _$jscoverage['/editor/selection.js'].lineData[597]++;
      visit710_597_1(Dom.equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++);
      _$jscoverage['/editor/selection.js'].lineData[598]++;
      visit711_598_1(Dom.equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++);
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[602]++;
  return retval;
}, 
  selectBookmarks: function(bookmarks) {
  _$jscoverage['/editor/selection.js'].functionData[18]++;
  _$jscoverage['/editor/selection.js'].lineData[606]++;
  var self = this, ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[607]++;
  for (var i = 0; visit712_607_1(i < bookmarks.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[608]++;
    var range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[609]++;
    range.moveToBookmark(bookmarks[i]);
    _$jscoverage['/editor/selection.js'].lineData[610]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[612]++;
  self.selectRanges(ranges);
  _$jscoverage['/editor/selection.js'].lineData[613]++;
  return self;
}, 
  getCommonAncestor: function() {
  _$jscoverage['/editor/selection.js'].functionData[19]++;
  _$jscoverage['/editor/selection.js'].lineData[617]++;
  var ranges = this.getRanges(), startNode = ranges[0].startContainer, endNode = ranges[ranges.length - 1].endContainer;
  _$jscoverage['/editor/selection.js'].lineData[620]++;
  return startNode._4e_commonAncestor(endNode);
}, 
  scrollIntoView: function() {
  _$jscoverage['/editor/selection.js'].functionData[20]++;
  _$jscoverage['/editor/selection.js'].lineData[627]++;
  var start = this.getStartElement();
  _$jscoverage['/editor/selection.js'].lineData[628]++;
  visit713_628_1(start && start.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true}));
}, 
  removeAllRanges: function() {
  _$jscoverage['/editor/selection.js'].functionData[21]++;
  _$jscoverage['/editor/selection.js'].lineData[635]++;
  var sel = this.getNative();
  _$jscoverage['/editor/selection.js'].lineData[636]++;
  if (visit714_636_1(!OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[637]++;
    visit715_637_1(sel && sel.removeAllRanges());
  } else {
    _$jscoverage['/editor/selection.js'].lineData[639]++;
    visit716_639_1(sel && sel.clear());
  }
}});
  _$jscoverage['/editor/selection.js'].lineData[645]++;
  var nonCells = {
  "table": 1, 
  "tbody": 1, 
  "tr": 1}, notWhitespaces = Walker.whitespaces(TRUE), fillerTextRegex = /\ufeff|\u00a0/;
  _$jscoverage['/editor/selection.js'].lineData[647]++;
  KERange.prototype["select"] = KERange.prototype.select = !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[22]++;
  _$jscoverage['/editor/selection.js'].lineData[650]++;
  var self = this, startContainer = self.startContainer;
  _$jscoverage['/editor/selection.js'].lineData[654]++;
  if (visit717_654_1(self.collapsed && visit718_655_1(visit719_655_2(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length))) {
    _$jscoverage['/editor/selection.js'].lineData[656]++;
    startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
    _$jscoverage['/editor/selection.js'].lineData[660]++;
    self.startOffset++;
    _$jscoverage['/editor/selection.js'].lineData[661]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/selection.js'].lineData[665]++;
  var nativeRange = self.document.createRange();
  _$jscoverage['/editor/selection.js'].lineData[666]++;
  nativeRange.setStart(startContainer[0], self.startOffset);
  _$jscoverage['/editor/selection.js'].lineData[668]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[669]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[674]++;
  if (visit720_674_1(e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0)) {
    _$jscoverage['/editor/selection.js'].lineData[675]++;
    self.collapse(TRUE);
    _$jscoverage['/editor/selection.js'].lineData[676]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[679]++;
    throw (e);
  }
}
  _$jscoverage['/editor/selection.js'].lineData[682]++;
  var selection = getSelection(self.document).getNative();
  _$jscoverage['/editor/selection.js'].lineData[683]++;
  selection.removeAllRanges();
  _$jscoverage['/editor/selection.js'].lineData[684]++;
  selection.addRange(nativeRange);
} : function(forceExpand) {
  _$jscoverage['/editor/selection.js'].functionData[23]++;
  _$jscoverage['/editor/selection.js'].lineData[688]++;
  var self = this, collapsed = self.collapsed, isStartMarkerAlone, dummySpan;
  _$jscoverage['/editor/selection.js'].lineData[694]++;
  if (visit721_697_1(visit722_697_2(self.startContainer[0] === self.endContainer[0]) && visit723_698_1(self.endOffset - self.startOffset == 1))) {
    _$jscoverage['/editor/selection.js'].lineData[699]++;
    var selEl = self.startContainer[0].childNodes[self.startOffset];
    _$jscoverage['/editor/selection.js'].lineData[700]++;
    if (visit724_700_1(selEl.nodeType == Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[701]++;
      new KESelection(self.document).selectElement(new Node(selEl));
      _$jscoverage['/editor/selection.js'].lineData[702]++;
      return;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[707]++;
  if (visit725_707_1(visit726_707_2(visit727_707_3(self.startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && self.startContainer.nodeName() in nonCells) || visit728_709_1(visit729_709_2(self.endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && self.endContainer.nodeName() in nonCells))) {
    _$jscoverage['/editor/selection.js'].lineData[711]++;
    self.shrink(KER.SHRINK_ELEMENT, TRUE);
  }
  _$jscoverage['/editor/selection.js'].lineData[714]++;
  var bookmark = self.createBookmark(), startNode = bookmark.startNode, endNode;
  _$jscoverage['/editor/selection.js'].lineData[718]++;
  if (visit730_718_1(!collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[719]++;
    endNode = bookmark.endNode;
  }
  _$jscoverage['/editor/selection.js'].lineData[722]++;
  var ieRange = self.document.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[725]++;
  ieRange.moveToElementText(startNode[0]);
  _$jscoverage['/editor/selection.js'].lineData[727]++;
  ieRange.moveStart('character', 1);
  _$jscoverage['/editor/selection.js'].lineData[729]++;
  if (visit731_729_1(endNode)) {
    _$jscoverage['/editor/selection.js'].lineData[731]++;
    var ieRangeEnd = self.document.body.createTextRange();
    _$jscoverage['/editor/selection.js'].lineData[733]++;
    ieRangeEnd.moveToElementText(endNode[0]);
    _$jscoverage['/editor/selection.js'].lineData[735]++;
    ieRange.setEndPoint('EndToEnd', ieRangeEnd);
    _$jscoverage['/editor/selection.js'].lineData[736]++;
    ieRange.moveEnd('character', -1);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[743]++;
    var next = startNode[0].nextSibling;
    _$jscoverage['/editor/selection.js'].lineData[744]++;
    while (visit732_744_1(next && !notWhitespaces(next))) {
      _$jscoverage['/editor/selection.js'].lineData[745]++;
      next = next.nextSibling;
    }
    _$jscoverage['/editor/selection.js'].lineData[747]++;
    isStartMarkerAlone = (visit733_748_1(!(visit734_748_2(next && visit735_748_3(next.nodeValue && next.nodeValue.match(fillerTextRegex)))) && (visit736_751_1(forceExpand || visit737_751_2(!startNode[0].previousSibling || (visit738_753_1(startNode[0].previousSibling && visit739_754_1(Dom.nodeName(startNode[0].previousSibling) == 'br'))))))));
    _$jscoverage['/editor/selection.js'].lineData[764]++;
    dummySpan = new Node(self.document.createElement('span'));
    _$jscoverage['/editor/selection.js'].lineData[765]++;
    dummySpan.html('&#65279;');
    _$jscoverage['/editor/selection.js'].lineData[766]++;
    dummySpan.insertBefore(startNode);
    _$jscoverage['/editor/selection.js'].lineData[767]++;
    if (visit740_767_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[772]++;
      Dom.insertBefore(self.document.createTextNode('\ufeff'), visit741_772_1(startNode[0] || startNode));
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[777]++;
  self.setStartBefore(startNode);
  _$jscoverage['/editor/selection.js'].lineData[778]++;
  startNode._4e_remove();
  _$jscoverage['/editor/selection.js'].lineData[780]++;
  if (visit742_780_1(collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[781]++;
    if (visit743_781_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[783]++;
      ieRange.moveStart('character', -1);
      _$jscoverage['/editor/selection.js'].lineData[784]++;
      ieRange.select();
      _$jscoverage['/editor/selection.js'].lineData[786]++;
      self.document.selection.clear();
    } else {
      _$jscoverage['/editor/selection.js'].lineData[788]++;
      ieRange.select();
    }
    _$jscoverage['/editor/selection.js'].lineData[789]++;
    if (visit744_789_1(dummySpan)) {
      _$jscoverage['/editor/selection.js'].lineData[790]++;
      self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/selection.js'].lineData[791]++;
      dummySpan._4e_remove();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[794]++;
    self.setEndBefore(endNode);
    _$jscoverage['/editor/selection.js'].lineData[795]++;
    endNode._4e_remove();
    _$jscoverage['/editor/selection.js'].lineData[796]++;
    ieRange.select();
  }
};
  _$jscoverage['/editor/selection.js'].lineData[801]++;
  function getSelection(doc) {
    _$jscoverage['/editor/selection.js'].functionData[24]++;
    _$jscoverage['/editor/selection.js'].lineData[802]++;
    var sel = new KESelection(doc);
    _$jscoverage['/editor/selection.js'].lineData[803]++;
    return (visit745_803_1(!sel || sel.isInvalid)) ? NULL : sel;
  }
  _$jscoverage['/editor/selection.js'].lineData[806]++;
  KESelection.getSelection = getSelection;
  _$jscoverage['/editor/selection.js'].lineData[808]++;
  Editor.Selection = KESelection;
  _$jscoverage['/editor/selection.js'].lineData[810]++;
  return KESelection;
}, {
  requires: ['./base', './walker', './range', './dom', 'node']});
