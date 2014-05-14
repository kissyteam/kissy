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
  _$jscoverage['/editor/selection.js'].lineData[11] = 0;
  _$jscoverage['/editor/selection.js'].lineData[12] = 0;
  _$jscoverage['/editor/selection.js'].lineData[13] = 0;
  _$jscoverage['/editor/selection.js'].lineData[14] = 0;
  _$jscoverage['/editor/selection.js'].lineData[15] = 0;
  _$jscoverage['/editor/selection.js'].lineData[16] = 0;
  _$jscoverage['/editor/selection.js'].lineData[21] = 0;
  _$jscoverage['/editor/selection.js'].lineData[26] = 0;
  _$jscoverage['/editor/selection.js'].lineData[42] = 0;
  _$jscoverage['/editor/selection.js'].lineData[43] = 0;
  _$jscoverage['/editor/selection.js'].lineData[44] = 0;
  _$jscoverage['/editor/selection.js'].lineData[45] = 0;
  _$jscoverage['/editor/selection.js'].lineData[53] = 0;
  _$jscoverage['/editor/selection.js'].lineData[54] = 0;
  _$jscoverage['/editor/selection.js'].lineData[55] = 0;
  _$jscoverage['/editor/selection.js'].lineData[56] = 0;
  _$jscoverage['/editor/selection.js'].lineData[58] = 0;
  _$jscoverage['/editor/selection.js'].lineData[64] = 0;
  _$jscoverage['/editor/selection.js'].lineData[69] = 0;
  _$jscoverage['/editor/selection.js'].lineData[92] = 0;
  _$jscoverage['/editor/selection.js'].lineData[102] = 0;
  _$jscoverage['/editor/selection.js'].lineData[104] = 0;
  _$jscoverage['/editor/selection.js'].lineData[108] = 0;
  _$jscoverage['/editor/selection.js'].lineData[109] = 0;
  _$jscoverage['/editor/selection.js'].lineData[132] = 0;
  _$jscoverage['/editor/selection.js'].lineData[133] = 0;
  _$jscoverage['/editor/selection.js'].lineData[134] = 0;
  _$jscoverage['/editor/selection.js'].lineData[137] = 0;
  _$jscoverage['/editor/selection.js'].lineData[140] = 0;
  _$jscoverage['/editor/selection.js'].lineData[141] = 0;
  _$jscoverage['/editor/selection.js'].lineData[142] = 0;
  _$jscoverage['/editor/selection.js'].lineData[146] = 0;
  _$jscoverage['/editor/selection.js'].lineData[149] = 0;
  _$jscoverage['/editor/selection.js'].lineData[153] = 0;
  _$jscoverage['/editor/selection.js'].lineData[157] = 0;
  _$jscoverage['/editor/selection.js'].lineData[158] = 0;
  _$jscoverage['/editor/selection.js'].lineData[161] = 0;
  _$jscoverage['/editor/selection.js'].lineData[162] = 0;
  _$jscoverage['/editor/selection.js'].lineData[163] = 0;
  _$jscoverage['/editor/selection.js'].lineData[166] = 0;
  _$jscoverage['/editor/selection.js'].lineData[168] = 0;
  _$jscoverage['/editor/selection.js'].lineData[169] = 0;
  _$jscoverage['/editor/selection.js'].lineData[172] = 0;
  _$jscoverage['/editor/selection.js'].lineData[173] = 0;
  _$jscoverage['/editor/selection.js'].lineData[176] = 0;
  _$jscoverage['/editor/selection.js'].lineData[177] = 0;
  _$jscoverage['/editor/selection.js'].lineData[185] = 0;
  _$jscoverage['/editor/selection.js'].lineData[186] = 0;
  _$jscoverage['/editor/selection.js'].lineData[192] = 0;
  _$jscoverage['/editor/selection.js'].lineData[193] = 0;
  _$jscoverage['/editor/selection.js'].lineData[200] = 0;
  _$jscoverage['/editor/selection.js'].lineData[202] = 0;
  _$jscoverage['/editor/selection.js'].lineData[203] = 0;
  _$jscoverage['/editor/selection.js'].lineData[206] = 0;
  _$jscoverage['/editor/selection.js'].lineData[209] = 0;
  _$jscoverage['/editor/selection.js'].lineData[210] = 0;
  _$jscoverage['/editor/selection.js'].lineData[212] = 0;
  _$jscoverage['/editor/selection.js'].lineData[213] = 0;
  _$jscoverage['/editor/selection.js'].lineData[215] = 0;
  _$jscoverage['/editor/selection.js'].lineData[217] = 0;
  _$jscoverage['/editor/selection.js'].lineData[220] = 0;
  _$jscoverage['/editor/selection.js'].lineData[222] = 0;
  _$jscoverage['/editor/selection.js'].lineData[223] = 0;
  _$jscoverage['/editor/selection.js'].lineData[224] = 0;
  _$jscoverage['/editor/selection.js'].lineData[227] = 0;
  _$jscoverage['/editor/selection.js'].lineData[228] = 0;
  _$jscoverage['/editor/selection.js'].lineData[229] = 0;
  _$jscoverage['/editor/selection.js'].lineData[232] = 0;
  _$jscoverage['/editor/selection.js'].lineData[236] = 0;
  _$jscoverage['/editor/selection.js'].lineData[237] = 0;
  _$jscoverage['/editor/selection.js'].lineData[238] = 0;
  _$jscoverage['/editor/selection.js'].lineData[239] = 0;
  _$jscoverage['/editor/selection.js'].lineData[242] = 0;
  _$jscoverage['/editor/selection.js'].lineData[246] = 0;
  _$jscoverage['/editor/selection.js'].lineData[249] = 0;
  _$jscoverage['/editor/selection.js'].lineData[250] = 0;
  _$jscoverage['/editor/selection.js'].lineData[255] = 0;
  _$jscoverage['/editor/selection.js'].lineData[259] = 0;
  _$jscoverage['/editor/selection.js'].lineData[262] = 0;
  _$jscoverage['/editor/selection.js'].lineData[263] = 0;
  _$jscoverage['/editor/selection.js'].lineData[268] = 0;
  _$jscoverage['/editor/selection.js'].lineData[275] = 0;
  _$jscoverage['/editor/selection.js'].lineData[276] = 0;
  _$jscoverage['/editor/selection.js'].lineData[277] = 0;
  _$jscoverage['/editor/selection.js'].lineData[278] = 0;
  _$jscoverage['/editor/selection.js'].lineData[285] = 0;
  _$jscoverage['/editor/selection.js'].lineData[290] = 0;
  _$jscoverage['/editor/selection.js'].lineData[291] = 0;
  _$jscoverage['/editor/selection.js'].lineData[294] = 0;
  _$jscoverage['/editor/selection.js'].lineData[295] = 0;
  _$jscoverage['/editor/selection.js'].lineData[296] = 0;
  _$jscoverage['/editor/selection.js'].lineData[297] = 0;
  _$jscoverage['/editor/selection.js'].lineData[298] = 0;
  _$jscoverage['/editor/selection.js'].lineData[299] = 0;
  _$jscoverage['/editor/selection.js'].lineData[300] = 0;
  _$jscoverage['/editor/selection.js'].lineData[301] = 0;
  _$jscoverage['/editor/selection.js'].lineData[302] = 0;
  _$jscoverage['/editor/selection.js'].lineData[303] = 0;
  _$jscoverage['/editor/selection.js'].lineData[305] = 0;
  _$jscoverage['/editor/selection.js'].lineData[306] = 0;
  _$jscoverage['/editor/selection.js'].lineData[310] = 0;
  _$jscoverage['/editor/selection.js'].lineData[313] = 0;
  _$jscoverage['/editor/selection.js'].lineData[316] = 0;
  _$jscoverage['/editor/selection.js'].lineData[317] = 0;
  _$jscoverage['/editor/selection.js'].lineData[318] = 0;
  _$jscoverage['/editor/selection.js'].lineData[321] = 0;
  _$jscoverage['/editor/selection.js'].lineData[324] = 0;
  _$jscoverage['/editor/selection.js'].lineData[325] = 0;
  _$jscoverage['/editor/selection.js'].lineData[330] = 0;
  _$jscoverage['/editor/selection.js'].lineData[331] = 0;
  _$jscoverage['/editor/selection.js'].lineData[332] = 0;
  _$jscoverage['/editor/selection.js'].lineData[339] = 0;
  _$jscoverage['/editor/selection.js'].lineData[341] = 0;
  _$jscoverage['/editor/selection.js'].lineData[342] = 0;
  _$jscoverage['/editor/selection.js'].lineData[345] = 0;
  _$jscoverage['/editor/selection.js'].lineData[346] = 0;
  _$jscoverage['/editor/selection.js'].lineData[348] = 0;
  _$jscoverage['/editor/selection.js'].lineData[349] = 0;
  _$jscoverage['/editor/selection.js'].lineData[350] = 0;
  _$jscoverage['/editor/selection.js'].lineData[353] = 0;
  _$jscoverage['/editor/selection.js'].lineData[354] = 0;
  _$jscoverage['/editor/selection.js'].lineData[367] = 0;
  _$jscoverage['/editor/selection.js'].lineData[368] = 0;
  _$jscoverage['/editor/selection.js'].lineData[369] = 0;
  _$jscoverage['/editor/selection.js'].lineData[372] = 0;
  _$jscoverage['/editor/selection.js'].lineData[375] = 0;
  _$jscoverage['/editor/selection.js'].lineData[377] = 0;
  _$jscoverage['/editor/selection.js'].lineData[381] = 0;
  _$jscoverage['/editor/selection.js'].lineData[383] = 0;
  _$jscoverage['/editor/selection.js'].lineData[384] = 0;
  _$jscoverage['/editor/selection.js'].lineData[385] = 0;
  _$jscoverage['/editor/selection.js'].lineData[390] = 0;
  _$jscoverage['/editor/selection.js'].lineData[391] = 0;
  _$jscoverage['/editor/selection.js'].lineData[394] = 0;
  _$jscoverage['/editor/selection.js'].lineData[396] = 0;
  _$jscoverage['/editor/selection.js'].lineData[398] = 0;
  _$jscoverage['/editor/selection.js'].lineData[402] = 0;
  _$jscoverage['/editor/selection.js'].lineData[404] = 0;
  _$jscoverage['/editor/selection.js'].lineData[405] = 0;
  _$jscoverage['/editor/selection.js'].lineData[408] = 0;
  _$jscoverage['/editor/selection.js'].lineData[410] = 0;
  _$jscoverage['/editor/selection.js'].lineData[411] = 0;
  _$jscoverage['/editor/selection.js'].lineData[414] = 0;
  _$jscoverage['/editor/selection.js'].lineData[415] = 0;
  _$jscoverage['/editor/selection.js'].lineData[416] = 0;
  _$jscoverage['/editor/selection.js'].lineData[417] = 0;
  _$jscoverage['/editor/selection.js'].lineData[419] = 0;
  _$jscoverage['/editor/selection.js'].lineData[423] = 0;
  _$jscoverage['/editor/selection.js'].lineData[424] = 0;
  _$jscoverage['/editor/selection.js'].lineData[425] = 0;
  _$jscoverage['/editor/selection.js'].lineData[426] = 0;
  _$jscoverage['/editor/selection.js'].lineData[428] = 0;
  _$jscoverage['/editor/selection.js'].lineData[429] = 0;
  _$jscoverage['/editor/selection.js'].lineData[430] = 0;
  _$jscoverage['/editor/selection.js'].lineData[432] = 0;
  _$jscoverage['/editor/selection.js'].lineData[433] = 0;
  _$jscoverage['/editor/selection.js'].lineData[438] = 0;
  _$jscoverage['/editor/selection.js'].lineData[439] = 0;
  _$jscoverage['/editor/selection.js'].lineData[453] = 0;
  _$jscoverage['/editor/selection.js'].lineData[457] = 0;
  _$jscoverage['/editor/selection.js'].lineData[458] = 0;
  _$jscoverage['/editor/selection.js'].lineData[462] = 0;
  _$jscoverage['/editor/selection.js'].lineData[463] = 0;
  _$jscoverage['/editor/selection.js'].lineData[464] = 0;
  _$jscoverage['/editor/selection.js'].lineData[470] = 0;
  _$jscoverage['/editor/selection.js'].lineData[471] = 0;
  _$jscoverage['/editor/selection.js'].lineData[472] = 0;
  _$jscoverage['/editor/selection.js'].lineData[480] = 0;
  _$jscoverage['/editor/selection.js'].lineData[492] = 0;
  _$jscoverage['/editor/selection.js'].lineData[495] = 0;
  _$jscoverage['/editor/selection.js'].lineData[498] = 0;
  _$jscoverage['/editor/selection.js'].lineData[501] = 0;
  _$jscoverage['/editor/selection.js'].lineData[502] = 0;
  _$jscoverage['/editor/selection.js'].lineData[506] = 0;
  _$jscoverage['/editor/selection.js'].lineData[510] = 0;
  _$jscoverage['/editor/selection.js'].lineData[513] = 0;
  _$jscoverage['/editor/selection.js'].lineData[517] = 0;
  _$jscoverage['/editor/selection.js'].lineData[519] = 0;
  _$jscoverage['/editor/selection.js'].lineData[520] = 0;
  _$jscoverage['/editor/selection.js'].lineData[521] = 0;
  _$jscoverage['/editor/selection.js'].lineData[524] = 0;
  _$jscoverage['/editor/selection.js'].lineData[525] = 0;
  _$jscoverage['/editor/selection.js'].lineData[526] = 0;
  _$jscoverage['/editor/selection.js'].lineData[530] = 0;
  _$jscoverage['/editor/selection.js'].lineData[533] = 0;
  _$jscoverage['/editor/selection.js'].lineData[534] = 0;
  _$jscoverage['/editor/selection.js'].lineData[536] = 0;
  _$jscoverage['/editor/selection.js'].lineData[537] = 0;
  _$jscoverage['/editor/selection.js'].lineData[538] = 0;
  _$jscoverage['/editor/selection.js'].lineData[539] = 0;
  _$jscoverage['/editor/selection.js'].lineData[544] = 0;
  _$jscoverage['/editor/selection.js'].lineData[545] = 0;
  _$jscoverage['/editor/selection.js'].lineData[546] = 0;
  _$jscoverage['/editor/selection.js'].lineData[548] = 0;
  _$jscoverage['/editor/selection.js'].lineData[549] = 0;
  _$jscoverage['/editor/selection.js'].lineData[550] = 0;
  _$jscoverage['/editor/selection.js'].lineData[555] = 0;
  _$jscoverage['/editor/selection.js'].lineData[556] = 0;
  _$jscoverage['/editor/selection.js'].lineData[559] = 0;
  _$jscoverage['/editor/selection.js'].lineData[561] = 0;
  _$jscoverage['/editor/selection.js'].lineData[562] = 0;
  _$jscoverage['/editor/selection.js'].lineData[563] = 0;
  _$jscoverage['/editor/selection.js'].lineData[565] = 0;
  _$jscoverage['/editor/selection.js'].lineData[566] = 0;
  _$jscoverage['/editor/selection.js'].lineData[567] = 0;
  _$jscoverage['/editor/selection.js'].lineData[575] = 0;
  _$jscoverage['/editor/selection.js'].lineData[579] = 0;
  _$jscoverage['/editor/selection.js'].lineData[582] = 0;
  _$jscoverage['/editor/selection.js'].lineData[583] = 0;
  _$jscoverage['/editor/selection.js'].lineData[586] = 0;
  _$jscoverage['/editor/selection.js'].lineData[587] = 0;
  _$jscoverage['/editor/selection.js'].lineData[589] = 0;
  _$jscoverage['/editor/selection.js'].lineData[591] = 0;
  _$jscoverage['/editor/selection.js'].lineData[595] = 0;
  _$jscoverage['/editor/selection.js'].lineData[598] = 0;
  _$jscoverage['/editor/selection.js'].lineData[599] = 0;
  _$jscoverage['/editor/selection.js'].lineData[602] = 0;
  _$jscoverage['/editor/selection.js'].lineData[605] = 0;
  _$jscoverage['/editor/selection.js'].lineData[609] = 0;
  _$jscoverage['/editor/selection.js'].lineData[610] = 0;
  _$jscoverage['/editor/selection.js'].lineData[611] = 0;
  _$jscoverage['/editor/selection.js'].lineData[612] = 0;
  _$jscoverage['/editor/selection.js'].lineData[613] = 0;
  _$jscoverage['/editor/selection.js'].lineData[615] = 0;
  _$jscoverage['/editor/selection.js'].lineData[619] = 0;
  _$jscoverage['/editor/selection.js'].lineData[620] = 0;
  _$jscoverage['/editor/selection.js'].lineData[624] = 0;
  _$jscoverage['/editor/selection.js'].lineData[625] = 0;
  _$jscoverage['/editor/selection.js'].lineData[627] = 0;
  _$jscoverage['/editor/selection.js'].lineData[628] = 0;
  _$jscoverage['/editor/selection.js'].lineData[630] = 0;
  _$jscoverage['/editor/selection.js'].lineData[631] = 0;
  _$jscoverage['/editor/selection.js'].lineData[633] = 0;
  _$jscoverage['/editor/selection.js'].lineData[634] = 0;
  _$jscoverage['/editor/selection.js'].lineData[639] = 0;
  _$jscoverage['/editor/selection.js'].lineData[643] = 0;
  _$jscoverage['/editor/selection.js'].lineData[644] = 0;
  _$jscoverage['/editor/selection.js'].lineData[645] = 0;
  _$jscoverage['/editor/selection.js'].lineData[646] = 0;
  _$jscoverage['/editor/selection.js'].lineData[647] = 0;
  _$jscoverage['/editor/selection.js'].lineData[649] = 0;
  _$jscoverage['/editor/selection.js'].lineData[650] = 0;
  _$jscoverage['/editor/selection.js'].lineData[654] = 0;
  _$jscoverage['/editor/selection.js'].lineData[657] = 0;
  _$jscoverage['/editor/selection.js'].lineData[664] = 0;
  _$jscoverage['/editor/selection.js'].lineData[665] = 0;
  _$jscoverage['/editor/selection.js'].lineData[666] = 0;
  _$jscoverage['/editor/selection.js'].lineData[674] = 0;
  _$jscoverage['/editor/selection.js'].lineData[675] = 0;
  _$jscoverage['/editor/selection.js'].lineData[676] = 0;
  _$jscoverage['/editor/selection.js'].lineData[677] = 0;
  _$jscoverage['/editor/selection.js'].lineData[680] = 0;
  _$jscoverage['/editor/selection.js'].lineData[681] = 0;
  _$jscoverage['/editor/selection.js'].lineData[687] = 0;
  _$jscoverage['/editor/selection.js'].lineData[694] = 0;
  _$jscoverage['/editor/selection.js'].lineData[696] = 0;
  _$jscoverage['/editor/selection.js'].lineData[700] = 0;
  _$jscoverage['/editor/selection.js'].lineData[702] = 0;
  _$jscoverage['/editor/selection.js'].lineData[706] = 0;
  _$jscoverage['/editor/selection.js'].lineData[707] = 0;
  _$jscoverage['/editor/selection.js'].lineData[710] = 0;
  _$jscoverage['/editor/selection.js'].lineData[711] = 0;
  _$jscoverage['/editor/selection.js'].lineData[713] = 0;
  _$jscoverage['/editor/selection.js'].lineData[714] = 0;
  _$jscoverage['/editor/selection.js'].lineData[719] = 0;
  _$jscoverage['/editor/selection.js'].lineData[720] = 0;
  _$jscoverage['/editor/selection.js'].lineData[721] = 0;
  _$jscoverage['/editor/selection.js'].lineData[723] = 0;
  _$jscoverage['/editor/selection.js'].lineData[727] = 0;
  _$jscoverage['/editor/selection.js'].lineData[728] = 0;
  _$jscoverage['/editor/selection.js'].lineData[729] = 0;
  _$jscoverage['/editor/selection.js'].lineData[733] = 0;
  _$jscoverage['/editor/selection.js'].lineData[739] = 0;
  _$jscoverage['/editor/selection.js'].lineData[743] = 0;
  _$jscoverage['/editor/selection.js'].lineData[744] = 0;
  _$jscoverage['/editor/selection.js'].lineData[745] = 0;
  _$jscoverage['/editor/selection.js'].lineData[746] = 0;
  _$jscoverage['/editor/selection.js'].lineData[751] = 0;
  _$jscoverage['/editor/selection.js'].lineData[755] = 0;
  _$jscoverage['/editor/selection.js'].lineData[758] = 0;
  _$jscoverage['/editor/selection.js'].lineData[762] = 0;
  _$jscoverage['/editor/selection.js'].lineData[763] = 0;
  _$jscoverage['/editor/selection.js'].lineData[767] = 0;
  _$jscoverage['/editor/selection.js'].lineData[770] = 0;
  _$jscoverage['/editor/selection.js'].lineData[772] = 0;
  _$jscoverage['/editor/selection.js'].lineData[774] = 0;
  _$jscoverage['/editor/selection.js'].lineData[776] = 0;
  _$jscoverage['/editor/selection.js'].lineData[778] = 0;
  _$jscoverage['/editor/selection.js'].lineData[780] = 0;
  _$jscoverage['/editor/selection.js'].lineData[781] = 0;
  _$jscoverage['/editor/selection.js'].lineData[787] = 0;
  _$jscoverage['/editor/selection.js'].lineData[788] = 0;
  _$jscoverage['/editor/selection.js'].lineData[789] = 0;
  _$jscoverage['/editor/selection.js'].lineData[791] = 0;
  _$jscoverage['/editor/selection.js'].lineData[807] = 0;
  _$jscoverage['/editor/selection.js'].lineData[808] = 0;
  _$jscoverage['/editor/selection.js'].lineData[809] = 0;
  _$jscoverage['/editor/selection.js'].lineData[810] = 0;
  _$jscoverage['/editor/selection.js'].lineData[815] = 0;
  _$jscoverage['/editor/selection.js'].lineData[820] = 0;
  _$jscoverage['/editor/selection.js'].lineData[821] = 0;
  _$jscoverage['/editor/selection.js'].lineData[823] = 0;
  _$jscoverage['/editor/selection.js'].lineData[824] = 0;
  _$jscoverage['/editor/selection.js'].lineData[826] = 0;
  _$jscoverage['/editor/selection.js'].lineData[827] = 0;
  _$jscoverage['/editor/selection.js'].lineData[829] = 0;
  _$jscoverage['/editor/selection.js'].lineData[831] = 0;
  _$jscoverage['/editor/selection.js'].lineData[833] = 0;
  _$jscoverage['/editor/selection.js'].lineData[834] = 0;
  _$jscoverage['/editor/selection.js'].lineData[835] = 0;
  _$jscoverage['/editor/selection.js'].lineData[838] = 0;
  _$jscoverage['/editor/selection.js'].lineData[839] = 0;
  _$jscoverage['/editor/selection.js'].lineData[840] = 0;
  _$jscoverage['/editor/selection.js'].lineData[844] = 0;
  _$jscoverage['/editor/selection.js'].lineData[845] = 0;
  _$jscoverage['/editor/selection.js'].lineData[846] = 0;
  _$jscoverage['/editor/selection.js'].lineData[849] = 0;
  _$jscoverage['/editor/selection.js'].lineData[851] = 0;
  _$jscoverage['/editor/selection.js'].lineData[853] = 0;
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
  _$jscoverage['/editor/selection.js'].branchData['53'] = [];
  _$jscoverage['/editor/selection.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'] = [];
  _$jscoverage['/editor/selection.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['56'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['57'] = [];
  _$jscoverage['/editor/selection.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['104'] = [];
  _$jscoverage['/editor/selection.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['109'] = [];
  _$jscoverage['/editor/selection.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['133'] = [];
  _$jscoverage['/editor/selection.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['140'] = [];
  _$jscoverage['/editor/selection.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['142'] = [];
  _$jscoverage['/editor/selection.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['149'] = [];
  _$jscoverage['/editor/selection.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['150'] = [];
  _$jscoverage['/editor/selection.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['151'] = [];
  _$jscoverage['/editor/selection.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['162'] = [];
  _$jscoverage['/editor/selection.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['172'] = [];
  _$jscoverage['/editor/selection.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['176'] = [];
  _$jscoverage['/editor/selection.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['185'] = [];
  _$jscoverage['/editor/selection.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['209'] = [];
  _$jscoverage['/editor/selection.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['212'] = [];
  _$jscoverage['/editor/selection.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['222'] = [];
  _$jscoverage['/editor/selection.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['224'] = [];
  _$jscoverage['/editor/selection.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['224'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['224'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['228'] = [];
  _$jscoverage['/editor/selection.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['236'] = [];
  _$jscoverage['/editor/selection.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['250'] = [];
  _$jscoverage['/editor/selection.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['262'] = [];
  _$jscoverage['/editor/selection.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['277'] = [];
  _$jscoverage['/editor/selection.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['286'] = [];
  _$jscoverage['/editor/selection.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['290'] = [];
  _$jscoverage['/editor/selection.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['294'] = [];
  _$jscoverage['/editor/selection.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['302'] = [];
  _$jscoverage['/editor/selection.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['305'] = [];
  _$jscoverage['/editor/selection.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['313'] = [];
  _$jscoverage['/editor/selection.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['313'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['313'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['331'] = [];
  _$jscoverage['/editor/selection.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['341'] = [];
  _$jscoverage['/editor/selection.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['345'] = [];
  _$jscoverage['/editor/selection.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['368'] = [];
  _$jscoverage['/editor/selection.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['383'] = [];
  _$jscoverage['/editor/selection.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['384'] = [];
  _$jscoverage['/editor/selection.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['394'] = [];
  _$jscoverage['/editor/selection.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['394'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['394'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['404'] = [];
  _$jscoverage['/editor/selection.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['410'] = [];
  _$jscoverage['/editor/selection.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['410'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['415'] = [];
  _$jscoverage['/editor/selection.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['415'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['423'] = [];
  _$jscoverage['/editor/selection.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['429'] = [];
  _$jscoverage['/editor/selection.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['429'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['432'] = [];
  _$jscoverage['/editor/selection.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['457'] = [];
  _$jscoverage['/editor/selection.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['462'] = [];
  _$jscoverage['/editor/selection.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['464'] = [];
  _$jscoverage['/editor/selection.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['470'] = [];
  _$jscoverage['/editor/selection.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['481'] = [];
  _$jscoverage['/editor/selection.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['481'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['482'] = [];
  _$jscoverage['/editor/selection.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['482'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['484'] = [];
  _$jscoverage['/editor/selection.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['513'] = [];
  _$jscoverage['/editor/selection.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['545'] = [];
  _$jscoverage['/editor/selection.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['546'] = [];
  _$jscoverage['/editor/selection.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['555'] = [];
  _$jscoverage['/editor/selection.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['562'] = [];
  _$jscoverage['/editor/selection.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['566'] = [];
  _$jscoverage['/editor/selection.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['575'] = [];
  _$jscoverage['/editor/selection.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['576'] = [];
  _$jscoverage['/editor/selection.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['576'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['576'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['576'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['577'] = [];
  _$jscoverage['/editor/selection.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['577'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['598'] = [];
  _$jscoverage['/editor/selection.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['609'] = [];
  _$jscoverage['/editor/selection.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['611'] = [];
  _$jscoverage['/editor/selection.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['619'] = [];
  _$jscoverage['/editor/selection.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['624'] = [];
  _$jscoverage['/editor/selection.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['627'] = [];
  _$jscoverage['/editor/selection.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['630'] = [];
  _$jscoverage['/editor/selection.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['633'] = [];
  _$jscoverage['/editor/selection.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['644'] = [];
  _$jscoverage['/editor/selection.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['665'] = [];
  _$jscoverage['/editor/selection.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['675'] = [];
  _$jscoverage['/editor/selection.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['676'] = [];
  _$jscoverage['/editor/selection.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['680'] = [];
  _$jscoverage['/editor/selection.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['700'] = [];
  _$jscoverage['/editor/selection.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['701'] = [];
  _$jscoverage['/editor/selection.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['701'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['719'] = [];
  _$jscoverage['/editor/selection.js'].branchData['719'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['742'] = [];
  _$jscoverage['/editor/selection.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['742'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['742'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['744'] = [];
  _$jscoverage['/editor/selection.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['751'] = [];
  _$jscoverage['/editor/selection.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['751'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['751'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['753'] = [];
  _$jscoverage['/editor/selection.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['753'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['762'] = [];
  _$jscoverage['/editor/selection.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['774'] = [];
  _$jscoverage['/editor/selection.js'].branchData['774'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['788'] = [];
  _$jscoverage['/editor/selection.js'].branchData['788'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['792'] = [];
  _$jscoverage['/editor/selection.js'].branchData['792'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['792'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['792'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['794'] = [];
  _$jscoverage['/editor/selection.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['794'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['796'] = [];
  _$jscoverage['/editor/selection.js'].branchData['796'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['797'] = [];
  _$jscoverage['/editor/selection.js'].branchData['797'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['810'] = [];
  _$jscoverage['/editor/selection.js'].branchData['810'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['815'] = [];
  _$jscoverage['/editor/selection.js'].branchData['815'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['823'] = [];
  _$jscoverage['/editor/selection.js'].branchData['823'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['824'] = [];
  _$jscoverage['/editor/selection.js'].branchData['824'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['833'] = [];
  _$jscoverage['/editor/selection.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['846'] = [];
  _$jscoverage['/editor/selection.js'].branchData['846'][1] = new BranchData();
}
_$jscoverage['/editor/selection.js'].branchData['846'][1].init(59, 21, '!sel || sel.isInvalid');
function visit828_846_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['846'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['833'][1].init(473, 9, 'dummySpan');
function visit827_833_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['824'][1].init(26, 18, 'isStartMarkerAlone');
function visit826_824_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['824'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['823'][1].init(4989, 9, 'collapsed');
function visit825_823_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['823'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['815'][1].init(381, 25, 'startNode[0] || startNode');
function visit824_815_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['815'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['810'][1].init(1743, 18, 'isStartMarkerAlone');
function visit823_810_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['810'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['797'][1].init(64, 51, 'Dom.nodeName(startNode[0].previousSibling) === \'br\'');
function visit822_797_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['797'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['796'][1].init(-1, 116, 'startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\'');
function visit821_796_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['796'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['794'][2].init(162, 248, '!startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\')');
function visit820_794_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['794'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['794'][1].init(147, 263, 'forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\')');
function visit819_794_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['792'][3].init(58, 55, 'next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit818_792_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['792'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['792'][2].init(50, 63, 'next && next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit817_792_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['792'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['792'][1].init(-1, 442, '!(next && next.nodeValue && next.nodeValue.match(fillerTextRegex)) && (forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\'))');
function visit816_792_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['792'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['788'][1].init(433, 29, 'next && !notWhitespaces(next)');
function visit815_788_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['788'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['774'][1].init(2057, 7, 'endNode');
function visit814_774_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['774'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['762'][1].init(1591, 10, '!collapsed');
function visit813_762_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['753'][2].init(1152, 59, 'self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit812_753_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['753'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['753'][1].init(152, 124, 'self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit811_753_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['751'][3].init(997, 61, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit810_751_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['751'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['751'][2].init(997, 128, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells');
function visit809_751_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['751'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['751'][1].init(997, 277, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells || self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit808_751_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['744'][1].init(112, 44, 'selEl.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit807_744_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['742'][3].init(50, 39, 'self.endOffset - self.startOffset === 1');
function visit806_742_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['742'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['742'][2].init(350, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit805_742_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['742'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['742'][1].init(91, 90, 'self.startContainer[0] === self.endContainer[0] && self.endOffset - self.startOffset === 1');
function visit804_742_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['719'][1].init(280, 51, 'e.toString().indexOf(\'NS_ERROR_ILLEGAL_VALUE\') >= 0');
function visit803_719_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['719'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['701'][2].init(282, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit802_701_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['701'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['701'][1].init(34, 96, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit801_701_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['700'][1].init(245, 131, 'self.collapsed && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit800_700_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['680'][1].init(22, 3, 'sel');
function visit799_680_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['676'][1].init(22, 3, 'sel');
function visit798_676_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['675'][1].init(59, 7, '!OLD_IE');
function visit797_675_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['665'][1].init(200, 5, 'start');
function visit796_665_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['644'][1].init(73, 20, 'i < bookmarks.length');
function visit795_644_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['633'][1].init(646, 42, 'Dom.equals(rangeEnd, bookmarkEnd.parent())');
function visit794_633_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['630'][1].init(501, 44, 'Dom.equals(rangeEnd, bookmarkStart.parent())');
function visit793_630_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['627'][1].init(354, 44, 'Dom.equals(rangeStart, bookmarkEnd.parent())');
function visit792_627_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['624'][1].init(205, 46, 'Dom.equals(rangeStart, bookmarkStart.parent())');
function visit791_624_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['619'][1].init(492, 10, 'j < length');
function visit790_619_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['611'][1].init(246, 10, 'i < length');
function visit789_611_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['609'][1].init(148, 26, 'ranges || self.getRanges()');
function visit788_609_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['598'][1].init(109, 17, 'i < ranges.length');
function visit787_598_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['577'][2].init(587, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit786_577_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['577'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['577'][1].init(72, 96, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit785_577_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['576'][4].init(525, 17, 'UA.gecko < 1.0900');
function visit784_576_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['576'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['576'][3].init(513, 29, 'UA.gecko && UA.gecko < 1.0900');
function visit783_576_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['576'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['576'][2].init(513, 43, '(UA.gecko && UA.gecko < 1.0900) || UA.webkit');
function visit782_576_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['576'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['576'][1].init(45, 169, '((UA.gecko && UA.gecko < 1.0900) || UA.webkit) && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit781_576_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['575'][1].init(465, 215, 'range.collapsed && ((UA.gecko && UA.gecko < 1.0900) || UA.webkit) && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit780_575_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['566'][1].init(196, 17, 'i < ranges.length');
function visit779_566_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['562'][1].init(67, 4, '!sel');
function visit778_562_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['555'][1].init(474, 11, 'ranges[0]');
function visit777_555_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['546'][1].init(22, 17, 'ranges.length > 1');
function visit776_546_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['545'][1].init(48, 6, 'OLD_IE');
function visit775_545_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['513'][1].init(110, 6, 'OLD_IE');
function visit774_513_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['484'][1].init(130, 97, 'styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit773_484_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['482'][2].init(74, 50, 'enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit772_482_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['482'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['482'][1].init(69, 228, '(enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit771_482_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['481'][2].init(368, 298, '(enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit770_481_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['481'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['481'][1].init(41, 307, 'i && !((enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed))');
function visit769_481_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['470'][1].init(584, 5, '!node');
function visit768_470_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['464'][1].init(86, 27, 'range.item && range.item(0)');
function visit767_464_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['462'][1].init(288, 6, 'OLD_IE');
function visit766_462_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['457'][1].init(112, 35, 'cache.selectedElement !== undefined');
function visit765_457_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['432'][1].init(242, 4, 'node');
function visit764_432_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['429'][2].init(86, 43, 'node.nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit763_429_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['429'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['429'][1].init(78, 51, 'node && node.nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit762_429_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['423'][1].init(2118, 6, 'OLD_IE');
function visit761_423_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['415'][2].init(1639, 44, 'child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit760_415_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['415'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['415'][1].init(1630, 53, 'child && child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit759_415_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['410'][2].init(1388, 46, 'node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit758_410_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['410'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['410'][1].init(1376, 58, '!node[0] || node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit757_410_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['404'][1].init(1118, 46, 'node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit756_404_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['394'][3].init(286, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit755_394_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['394'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['394'][2].init(269, 186, 'startOffset === (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)');
function visit754_394_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['394'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['394'][1].init(269, 226, 'startOffset === (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length) && !startContainer._4eIsBlockBoundary()');
function visit753_394_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['384'][1].init(30, 16, '!range.collapsed');
function visit752_384_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['383'][1].init(108, 5, 'range');
function visit751_383_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['368'][1].init(70, 32, 'cache.startElement !== undefined');
function visit750_368_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['345'][1].init(501, 18, 'i < sel.rangeCount');
function visit749_345_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['341'][1].init(407, 4, '!sel');
function visit748_341_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['331'][1].init(78, 22, 'cache.ranges && !force');
function visit747_331_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['313'][3].init(372, 39, 'parentElement.childNodes[j] !== element');
function visit746_313_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['313'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['313'][2].init(333, 35, 'j < parentElement.childNodes.length');
function visit745_313_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['313'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['313'][1].init(333, 78, 'j < parentElement.childNodes.length && parentElement.childNodes[j] !== element');
function visit744_313_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['305'][1].init(101, 22, 'i < nativeRange.length');
function visit743_305_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['302'][1].init(1263, 30, 'type === KES.SELECTION_ELEMENT');
function visit742_302_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['294'][1].init(694, 27, 'type === KES.SELECTION_TEXT');
function visit741_294_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['290'][1].init(600, 4, '!sel');
function visit740_290_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['286'][1].init(66, 24, 'sel && sel.createRange()');
function visit739_286_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['277'][1].init(86, 22, 'cache.ranges && !force');
function visit738_277_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['262'][1].init(2989, 14, 'distance === 0');
function visit737_262_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['250'][1].init(33, 12, 'distance > 0');
function visit736_250_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['236'][1].init(1757, 10, '!testRange');
function visit735_236_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['228'][1].init(941, 14, '!comparisonEnd');
function visit734_228_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['224'][4].init(602, 22, 'comparisonStart === -1');
function visit733_224_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['224'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['224'][3].init(579, 19, 'comparisonEnd === 1');
function visit732_224_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['224'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['224'][2].init(579, 45, 'comparisonEnd === 1 && comparisonStart === -1');
function visit731_224_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['224'][1].init(559, 65, '!comparisonStart || comparisonEnd === 1 && comparisonStart === -1');
function visit730_224_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['222'][1].init(455, 19, 'comparisonStart > 0');
function visit729_222_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['212'][1].init(84, 44, 'child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit728_212_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['209'][1].init(409, 19, 'i < siblings.length');
function visit727_209_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['185'][1].init(718, 31, 'sel.createRange().parentElement');
function visit726_185_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['176'][1].init(244, 20, 'ieType === \'Control\'');
function visit725_176_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['172'][1].init(121, 17, 'ieType === \'Text\'');
function visit724_172_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['162'][1].init(78, 10, 'cache.type');
function visit723_162_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['151'][2].init(414, 49, 'Number(range.endOffset - range.startOffset) === 1');
function visit722_151_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['151'][1].init(81, 170, 'Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit721_151_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['150'][2].init(331, 53, 'startContainer.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit720_150_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['150'][1].init(65, 252, 'startContainer.nodeType === Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit719_150_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['149'][2].init(263, 37, 'startContainer === range.endContainer');
function visit718_149_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['149'][1].init(263, 318, 'startContainer === range.endContainer && startContainer.nodeType === Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit717_149_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['142'][1].init(354, 20, 'sel.rangeCount === 1');
function visit716_142_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['140'][1].init(269, 4, '!sel');
function visit715_140_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['133'][1].init(78, 10, 'cache.type');
function visit714_133_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['109'][1].init(81, 62, 'cache.nativeSel || (cache.nativeSel = self.document.selection)');
function visit713_109_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['104'][1].init(102, 82, 'cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection())');
function visit712_104_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['57'][2].init(103, 48, 'range.parentElement().ownerDocument !== document');
function visit711_57_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['57'][1].init(80, 71, 'range.parentElement && range.parentElement().ownerDocument !== document');
function visit710_57_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][4].init(108, 40, 'range.item(0).ownerDocument !== document');
function visit709_56_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][3].init(94, 54, 'range.item && range.item(0).ownerDocument !== document');
function visit708_56_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][2].init(94, 153, '(range.item && range.item(0).ownerDocument !== document) || (range.parentElement && range.parentElement().ownerDocument !== document)');
function visit707_56_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['56'][1].init(83, 164, '!range || (range.item && range.item(0).ownerDocument !== document) || (range.parentElement && range.parentElement().ownerDocument !== document)');
function visit706_56_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['53'][1].init(296, 6, 'OLD_IE');
function visit705_53_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/selection.js'].functionData[0]++;
  _$jscoverage['/editor/selection.js'].lineData[11]++;
  var util = require('util');
  _$jscoverage['/editor/selection.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/selection.js'].lineData[13]++;
  var $ = Node.all;
  _$jscoverage['/editor/selection.js'].lineData[14]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/selection.js'].lineData[15]++;
  var KERange = require('./range');
  _$jscoverage['/editor/selection.js'].lineData[16]++;
  var Editor = require('./base');
  _$jscoverage['/editor/selection.js'].lineData[21]++;
  Editor.SelectionType = {
  SELECTION_NONE: 1, 
  SELECTION_TEXT: 2, 
  SELECTION_ELEMENT: 3};
  _$jscoverage['/editor/selection.js'].lineData[26]++;
  var TRUE = true, FALSE = false, NULL = null, UA = require('ua'), Dom = require('dom'), KES = Editor.SelectionType, KER = Editor.RangeType, OLD_IE = document.selection;
  _$jscoverage['/editor/selection.js'].lineData[42]++;
  function KESelection(document) {
    _$jscoverage['/editor/selection.js'].functionData[1]++;
    _$jscoverage['/editor/selection.js'].lineData[43]++;
    var self = this;
    _$jscoverage['/editor/selection.js'].lineData[44]++;
    self.document = document;
    _$jscoverage['/editor/selection.js'].lineData[45]++;
    self._ = {
  cache: {}};
    _$jscoverage['/editor/selection.js'].lineData[53]++;
    if (visit705_53_1(OLD_IE)) {
      _$jscoverage['/editor/selection.js'].lineData[54]++;
      try {
        _$jscoverage['/editor/selection.js'].lineData[55]++;
        var range = self.getNative().createRange();
        _$jscoverage['/editor/selection.js'].lineData[56]++;
        if (visit706_56_1(!range || visit707_56_2((visit708_56_3(range.item && visit709_56_4(range.item(0).ownerDocument !== document))) || (visit710_57_1(range.parentElement && visit711_57_2(range.parentElement().ownerDocument !== document)))))) {
          _$jscoverage['/editor/selection.js'].lineData[58]++;
          self.isInvalid = TRUE;
        }
      }      catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[64]++;
  self.isInvalid = TRUE;
}
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[69]++;
  var styleObjectElements = {
  img: 1, 
  hr: 1, 
  li: 1, 
  table: 1, 
  tr: 1, 
  td: 1, 
  th: 1, 
  embed: 1, 
  object: 1, 
  ol: 1, 
  ul: 1, 
  a: 1, 
  input: 1, 
  form: 1, 
  select: 1, 
  textarea: 1, 
  button: 1, 
  fieldset: 1, 
  thead: 1, 
  tfoot: 1};
  _$jscoverage['/editor/selection.js'].lineData[92]++;
  util.augment(KESelection, {
  getNative: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[2]++;
  _$jscoverage['/editor/selection.js'].lineData[102]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[104]++;
  return visit712_104_1(cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection()));
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[3]++;
  _$jscoverage['/editor/selection.js'].lineData[108]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[109]++;
  return visit713_109_1(cache.nativeSel || (cache.nativeSel = self.document.selection));
}, 
  getType: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[4]++;
  _$jscoverage['/editor/selection.js'].lineData[132]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[133]++;
  if (visit714_133_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[134]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[137]++;
  var type = KES.SELECTION_TEXT, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[140]++;
  if (visit715_140_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[141]++;
    type = KES.SELECTION_NONE;
  } else {
    _$jscoverage['/editor/selection.js'].lineData[142]++;
    if (visit716_142_1(sel.rangeCount === 1)) {
      _$jscoverage['/editor/selection.js'].lineData[146]++;
      var range = sel.getRangeAt(0), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[149]++;
      if (visit717_149_1(visit718_149_2(startContainer === range.endContainer) && visit719_150_1(visit720_150_2(startContainer.nodeType === Dom.NodeType.ELEMENT_NODE) && visit721_151_1(visit722_151_2(Number(range.endOffset - range.startOffset) === 1) && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()])))) {
        _$jscoverage['/editor/selection.js'].lineData[153]++;
        type = KES.SELECTION_ELEMENT;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[157]++;
  cache.type = type;
  _$jscoverage['/editor/selection.js'].lineData[158]++;
  return type;
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[5]++;
  _$jscoverage['/editor/selection.js'].lineData[161]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[162]++;
  if (visit723_162_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[163]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[166]++;
  var type = KES.SELECTION_NONE;
  _$jscoverage['/editor/selection.js'].lineData[168]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[169]++;
    var sel = self.getNative(), ieType = sel.type;
    _$jscoverage['/editor/selection.js'].lineData[172]++;
    if (visit724_172_1(ieType === 'Text')) {
      _$jscoverage['/editor/selection.js'].lineData[173]++;
      type = KES.SELECTION_TEXT;
    }
    _$jscoverage['/editor/selection.js'].lineData[176]++;
    if (visit725_176_1(ieType === 'Control')) {
      _$jscoverage['/editor/selection.js'].lineData[177]++;
      type = KES.SELECTION_ELEMENT;
    }
    _$jscoverage['/editor/selection.js'].lineData[185]++;
    if (visit726_185_1(sel.createRange().parentElement)) {
      _$jscoverage['/editor/selection.js'].lineData[186]++;
      type = KES.SELECTION_TEXT;
    }
  }  catch (e) {
}
  _$jscoverage['/editor/selection.js'].lineData[192]++;
  cache.type = type;
  _$jscoverage['/editor/selection.js'].lineData[193]++;
  return type;
}, 
  getRanges: OLD_IE ? (function() {
  _$jscoverage['/editor/selection.js'].functionData[6]++;
  _$jscoverage['/editor/selection.js'].lineData[200]++;
  var getBoundaryInformation = function(range, start) {
  _$jscoverage['/editor/selection.js'].functionData[7]++;
  _$jscoverage['/editor/selection.js'].lineData[202]++;
  range = range.duplicate();
  _$jscoverage['/editor/selection.js'].lineData[203]++;
  range.collapse(start);
  _$jscoverage['/editor/selection.js'].lineData[206]++;
  var parent = range.parentElement(), siblings = parent.childNodes, testRange;
  _$jscoverage['/editor/selection.js'].lineData[209]++;
  for (var i = 0; visit727_209_1(i < siblings.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[210]++;
    var child = siblings[i];
    _$jscoverage['/editor/selection.js'].lineData[212]++;
    if (visit728_212_1(child.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[213]++;
      testRange = range.duplicate();
      _$jscoverage['/editor/selection.js'].lineData[215]++;
      testRange.moveToElementText(child);
      _$jscoverage['/editor/selection.js'].lineData[217]++;
      var comparisonStart = testRange.compareEndPoints('StartToStart', range), comparisonEnd = testRange.compareEndPoints('EndToStart', range);
      _$jscoverage['/editor/selection.js'].lineData[220]++;
      testRange.collapse();
      _$jscoverage['/editor/selection.js'].lineData[222]++;
      if (visit729_222_1(comparisonStart > 0)) {
        _$jscoverage['/editor/selection.js'].lineData[223]++;
        break;
      } else {
        _$jscoverage['/editor/selection.js'].lineData[224]++;
        if (visit730_224_1(!comparisonStart || visit731_224_2(visit732_224_3(comparisonEnd === 1) && visit733_224_4(comparisonStart === -1)))) {
          _$jscoverage['/editor/selection.js'].lineData[227]++;
          return {
  container: parent, 
  offset: i};
        } else {
          _$jscoverage['/editor/selection.js'].lineData[228]++;
          if (visit734_228_1(!comparisonEnd)) {
            _$jscoverage['/editor/selection.js'].lineData[229]++;
            return {
  container: parent, 
  offset: i + 1};
          }
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[232]++;
      testRange = NULL;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[236]++;
  if (visit735_236_1(!testRange)) {
    _$jscoverage['/editor/selection.js'].lineData[237]++;
    testRange = range.duplicate();
    _$jscoverage['/editor/selection.js'].lineData[238]++;
    testRange.moveToElementText(parent);
    _$jscoverage['/editor/selection.js'].lineData[239]++;
    testRange.collapse(FALSE);
  }
  _$jscoverage['/editor/selection.js'].lineData[242]++;
  testRange.setEndPoint('StartToStart', range);
  _$jscoverage['/editor/selection.js'].lineData[246]++;
  var distance = String(testRange.text).replace(/\r\n|\r/g, '\n').length;
  _$jscoverage['/editor/selection.js'].lineData[249]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[250]++;
    while (visit736_250_1(distance > 0)) {
      _$jscoverage['/editor/selection.js'].lineData[255]++;
      distance -= siblings[--i].nodeValue.length;
    }
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[259]++;
  distance = 0;
}
  _$jscoverage['/editor/selection.js'].lineData[262]++;
  if (visit737_262_1(distance === 0)) {
    _$jscoverage['/editor/selection.js'].lineData[263]++;
    return {
  container: parent, 
  offset: i};
  } else {
    _$jscoverage['/editor/selection.js'].lineData[268]++;
    return {
  container: siblings[i], 
  offset: -distance};
  }
};
  _$jscoverage['/editor/selection.js'].lineData[275]++;
  return function(force) {
  _$jscoverage['/editor/selection.js'].functionData[8]++;
  _$jscoverage['/editor/selection.js'].lineData[276]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[277]++;
  if (visit738_277_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[278]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[285]++;
  var sel = self.getNative(), nativeRange = visit739_286_1(sel && sel.createRange()), type = self.getType(), range;
  _$jscoverage['/editor/selection.js'].lineData[290]++;
  if (visit740_290_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[291]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[294]++;
  if (visit741_294_1(type === KES.SELECTION_TEXT)) {
    _$jscoverage['/editor/selection.js'].lineData[295]++;
    range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[296]++;
    var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
    _$jscoverage['/editor/selection.js'].lineData[297]++;
    range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[298]++;
    boundaryInfo = getBoundaryInformation(nativeRange);
    _$jscoverage['/editor/selection.js'].lineData[299]++;
    range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[300]++;
    cache.ranges = [range];
    _$jscoverage['/editor/selection.js'].lineData[301]++;
    return [range];
  } else {
    _$jscoverage['/editor/selection.js'].lineData[302]++;
    if (visit742_302_1(type === KES.SELECTION_ELEMENT)) {
      _$jscoverage['/editor/selection.js'].lineData[303]++;
      var retval = cache.ranges = [];
      _$jscoverage['/editor/selection.js'].lineData[305]++;
      for (var i = 0; visit743_305_1(i < nativeRange.length); i++) {
        _$jscoverage['/editor/selection.js'].lineData[306]++;
        var element = nativeRange.item(i), parentElement = element.parentNode, j = 0;
        _$jscoverage['/editor/selection.js'].lineData[310]++;
        range = new KERange(self.document);
        _$jscoverage['/editor/selection.js'].lineData[313]++;
        for (; visit744_313_1(visit745_313_2(j < parentElement.childNodes.length) && visit746_313_3(parentElement.childNodes[j] !== element)); j++) {
        }
        _$jscoverage['/editor/selection.js'].lineData[316]++;
        range.setStart(new Node(parentElement), j);
        _$jscoverage['/editor/selection.js'].lineData[317]++;
        range.setEnd(new Node(parentElement), j + 1);
        _$jscoverage['/editor/selection.js'].lineData[318]++;
        retval.push(range);
      }
      _$jscoverage['/editor/selection.js'].lineData[321]++;
      return retval;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[324]++;
  cache.ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[325]++;
  return [];
};
})() : function(force) {
  _$jscoverage['/editor/selection.js'].functionData[9]++;
  _$jscoverage['/editor/selection.js'].lineData[330]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[331]++;
  if (visit747_331_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[332]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[339]++;
  var ranges = [], sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[341]++;
  if (visit748_341_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[342]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[345]++;
  for (var i = 0; visit749_345_1(i < sel.rangeCount); i++) {
    _$jscoverage['/editor/selection.js'].lineData[346]++;
    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[348]++;
    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
    _$jscoverage['/editor/selection.js'].lineData[349]++;
    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
    _$jscoverage['/editor/selection.js'].lineData[350]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[353]++;
  cache.ranges = ranges;
  _$jscoverage['/editor/selection.js'].lineData[354]++;
  return ranges;
}, 
  getStartElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[10]++;
  _$jscoverage['/editor/selection.js'].lineData[367]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[368]++;
  if (visit750_368_1(cache.startElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[369]++;
    return cache.startElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[372]++;
  var node, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[375]++;
  switch (self.getType()) {
    case KES.SELECTION_ELEMENT:
      _$jscoverage['/editor/selection.js'].lineData[377]++;
      return this.getSelectedElement();
    case KES.SELECTION_TEXT:
      _$jscoverage['/editor/selection.js'].lineData[381]++;
      var range = self.getRanges()[0];
      _$jscoverage['/editor/selection.js'].lineData[383]++;
      if (visit751_383_1(range)) {
        _$jscoverage['/editor/selection.js'].lineData[384]++;
        if (visit752_384_1(!range.collapsed)) {
          _$jscoverage['/editor/selection.js'].lineData[385]++;
          range.optimize();
          _$jscoverage['/editor/selection.js'].lineData[390]++;
          while (TRUE) {
            _$jscoverage['/editor/selection.js'].lineData[391]++;
            var startContainer = range.startContainer, startOffset = range.startOffset;
            _$jscoverage['/editor/selection.js'].lineData[394]++;
            if (visit753_394_1(visit754_394_2(startOffset === (visit755_394_3(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)) && !startContainer._4eIsBlockBoundary())) {
              _$jscoverage['/editor/selection.js'].lineData[396]++;
              range.setStartAfter(startContainer);
            } else {
              _$jscoverage['/editor/selection.js'].lineData[398]++;
              break;
            }
          }
          _$jscoverage['/editor/selection.js'].lineData[402]++;
          node = range.startContainer;
          _$jscoverage['/editor/selection.js'].lineData[404]++;
          if (visit756_404_1(node[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
            _$jscoverage['/editor/selection.js'].lineData[405]++;
            return node.parent();
          }
          _$jscoverage['/editor/selection.js'].lineData[408]++;
          node = new Node(node[0].childNodes[range.startOffset]);
          _$jscoverage['/editor/selection.js'].lineData[410]++;
          if (visit757_410_1(!node[0] || visit758_410_2(node[0].nodeType !== Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[411]++;
            return range.startContainer;
          }
          _$jscoverage['/editor/selection.js'].lineData[414]++;
          var child = node[0].firstChild;
          _$jscoverage['/editor/selection.js'].lineData[415]++;
          while (visit759_415_1(child && visit760_415_2(child.nodeType === Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[416]++;
            node = new Node(child);
            _$jscoverage['/editor/selection.js'].lineData[417]++;
            child = child.firstChild;
          }
          _$jscoverage['/editor/selection.js'].lineData[419]++;
          return node;
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[423]++;
      if (visit761_423_1(OLD_IE)) {
        _$jscoverage['/editor/selection.js'].lineData[424]++;
        range = sel.createRange();
        _$jscoverage['/editor/selection.js'].lineData[425]++;
        range.collapse(TRUE);
        _$jscoverage['/editor/selection.js'].lineData[426]++;
        node = new Node(range.parentElement());
      } else {
        _$jscoverage['/editor/selection.js'].lineData[428]++;
        node = sel.anchorNode;
        _$jscoverage['/editor/selection.js'].lineData[429]++;
        if (visit762_429_1(node && visit763_429_2(node.nodeType !== Dom.NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/selection.js'].lineData[430]++;
          node = node.parentNode;
        }
        _$jscoverage['/editor/selection.js'].lineData[432]++;
        if (visit764_432_1(node)) {
          _$jscoverage['/editor/selection.js'].lineData[433]++;
          node = new Node(node);
        }
      }
  }
  _$jscoverage['/editor/selection.js'].lineData[438]++;
  cache.startElement = node;
  _$jscoverage['/editor/selection.js'].lineData[439]++;
  return node;
}, 
  getSelectedElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[11]++;
  _$jscoverage['/editor/selection.js'].lineData[453]++;
  var self = this, node, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[457]++;
  if (visit765_457_1(cache.selectedElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[458]++;
    return cache.selectedElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[462]++;
  if (visit766_462_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[463]++;
    var range = self.getNative().createRange();
    _$jscoverage['/editor/selection.js'].lineData[464]++;
    node = visit767_464_1(range.item && range.item(0));
  }
  _$jscoverage['/editor/selection.js'].lineData[470]++;
  if (visit768_470_1(!node)) {
    _$jscoverage['/editor/selection.js'].lineData[471]++;
    node = (function() {
  _$jscoverage['/editor/selection.js'].functionData[12]++;
  _$jscoverage['/editor/selection.js'].lineData[472]++;
  var range = self.getRanges()[0], enclosed, selected;
  _$jscoverage['/editor/selection.js'].lineData[480]++;
  for (var i = 2; visit769_481_1(i && !(visit770_481_2((enclosed = range.getEnclosedNode()) && visit771_482_1((visit772_482_2(enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE)) && visit773_484_1(styleObjectElements[enclosed.nodeName()] && (selected = enclosed)))))); i--) {
    _$jscoverage['/editor/selection.js'].lineData[492]++;
    range.shrink(KER.SHRINK_ELEMENT);
  }
  _$jscoverage['/editor/selection.js'].lineData[495]++;
  return selected;
})();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[498]++;
    node = new Node(node);
  }
  _$jscoverage['/editor/selection.js'].lineData[501]++;
  cache.selectedElement = node;
  _$jscoverage['/editor/selection.js'].lineData[502]++;
  return node;
}, 
  reset: function() {
  _$jscoverage['/editor/selection.js'].functionData[13]++;
  _$jscoverage['/editor/selection.js'].lineData[506]++;
  this._.cache = {};
}, 
  selectElement: function(element) {
  _$jscoverage['/editor/selection.js'].functionData[14]++;
  _$jscoverage['/editor/selection.js'].lineData[510]++;
  var range, self = this, doc = self.document;
  _$jscoverage['/editor/selection.js'].lineData[513]++;
  if (visit774_513_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[517]++;
    try {
      _$jscoverage['/editor/selection.js'].lineData[519]++;
      range = doc.body.createControlRange();
      _$jscoverage['/editor/selection.js'].lineData[520]++;
      range.addElement(element[0]);
      _$jscoverage['/editor/selection.js'].lineData[521]++;
      range.select();
    }    catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[524]++;
  range = doc.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[525]++;
  range.moveToElementText(element[0]);
  _$jscoverage['/editor/selection.js'].lineData[526]++;
  range.select();
}
 finally     {
    }
    _$jscoverage['/editor/selection.js'].lineData[530]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[533]++;
    range = doc.createRange();
    _$jscoverage['/editor/selection.js'].lineData[534]++;
    range.selectNode(element[0]);
    _$jscoverage['/editor/selection.js'].lineData[536]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[537]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[538]++;
    sel.addRange(range);
    _$jscoverage['/editor/selection.js'].lineData[539]++;
    self.reset();
  }
}, 
  selectRanges: function(ranges) {
  _$jscoverage['/editor/selection.js'].functionData[15]++;
  _$jscoverage['/editor/selection.js'].lineData[544]++;
  var self = this;
  _$jscoverage['/editor/selection.js'].lineData[545]++;
  if (visit775_545_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[546]++;
    if (visit776_546_1(ranges.length > 1)) {
      _$jscoverage['/editor/selection.js'].lineData[548]++;
      var last = ranges[ranges.length - 1];
      _$jscoverage['/editor/selection.js'].lineData[549]++;
      ranges[0].setEnd(last.endContainer, last.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[550]++;
      ranges.length = 1;
    }
    _$jscoverage['/editor/selection.js'].lineData[555]++;
    if (visit777_555_1(ranges[0])) {
      _$jscoverage['/editor/selection.js'].lineData[556]++;
      ranges[0].select();
    }
    _$jscoverage['/editor/selection.js'].lineData[559]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[561]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[562]++;
    if (visit778_562_1(!sel)) {
      _$jscoverage['/editor/selection.js'].lineData[563]++;
      return;
    }
    _$jscoverage['/editor/selection.js'].lineData[565]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[566]++;
    for (var i = 0; visit779_566_1(i < ranges.length); i++) {
      _$jscoverage['/editor/selection.js'].lineData[567]++;
      var range = ranges[i], nativeRange = self.document.createRange(), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[575]++;
      if (visit780_575_1(range.collapsed && visit781_576_1((visit782_576_2((visit783_576_3(UA.gecko && visit784_576_4(UA.gecko < 1.0900))) || UA.webkit)) && visit785_577_1(visit786_577_2(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length)))) {
        _$jscoverage['/editor/selection.js'].lineData[579]++;
        startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
        _$jscoverage['/editor/selection.js'].lineData[582]++;
        range.startOffset++;
        _$jscoverage['/editor/selection.js'].lineData[583]++;
        range.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[586]++;
      nativeRange.setStart(startContainer[0], range.startOffset);
      _$jscoverage['/editor/selection.js'].lineData[587]++;
      nativeRange.setEnd(range.endContainer[0], range.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[589]++;
      sel.addRange(nativeRange);
    }
    _$jscoverage['/editor/selection.js'].lineData[591]++;
    self.reset();
  }
}, 
  createBookmarks2: function(normalized) {
  _$jscoverage['/editor/selection.js'].functionData[16]++;
  _$jscoverage['/editor/selection.js'].lineData[595]++;
  var bookmarks = [], ranges = this.getRanges();
  _$jscoverage['/editor/selection.js'].lineData[598]++;
  for (var i = 0; visit787_598_1(i < ranges.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[599]++;
    bookmarks.push(ranges[i].createBookmark2(normalized));
  }
  _$jscoverage['/editor/selection.js'].lineData[602]++;
  return bookmarks;
}, 
  createBookmarks: function(serializable, ranges) {
  _$jscoverage['/editor/selection.js'].functionData[17]++;
  _$jscoverage['/editor/selection.js'].lineData[605]++;
  var self = this, retval = [], doc = self.document, bookmark;
  _$jscoverage['/editor/selection.js'].lineData[609]++;
  ranges = visit788_609_1(ranges || self.getRanges());
  _$jscoverage['/editor/selection.js'].lineData[610]++;
  var length = ranges.length;
  _$jscoverage['/editor/selection.js'].lineData[611]++;
  for (var i = 0; visit789_611_1(i < length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[612]++;
    retval.push(bookmark = ranges[i].createBookmark(serializable, TRUE));
    _$jscoverage['/editor/selection.js'].lineData[613]++;
    serializable = bookmark.serializable;
    _$jscoverage['/editor/selection.js'].lineData[615]++;
    var bookmarkStart = serializable ? $('#' + bookmark.startNode, doc) : bookmark.startNode, bookmarkEnd = serializable ? $('#' + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/selection.js'].lineData[619]++;
    for (var j = i + 1; visit790_619_1(j < length); j++) {
      _$jscoverage['/editor/selection.js'].lineData[620]++;
      var dirtyRange = ranges[j], rangeStart = dirtyRange.startContainer, rangeEnd = dirtyRange.endContainer;
      _$jscoverage['/editor/selection.js'].lineData[624]++;
      if (visit791_624_1(Dom.equals(rangeStart, bookmarkStart.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[625]++;
        dirtyRange.startOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[627]++;
      if (visit792_627_1(Dom.equals(rangeStart, bookmarkEnd.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[628]++;
        dirtyRange.startOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[630]++;
      if (visit793_630_1(Dom.equals(rangeEnd, bookmarkStart.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[631]++;
        dirtyRange.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[633]++;
      if (visit794_633_1(Dom.equals(rangeEnd, bookmarkEnd.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[634]++;
        dirtyRange.endOffset++;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[639]++;
  return retval;
}, 
  selectBookmarks: function(bookmarks) {
  _$jscoverage['/editor/selection.js'].functionData[18]++;
  _$jscoverage['/editor/selection.js'].lineData[643]++;
  var self = this, ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[644]++;
  for (var i = 0; visit795_644_1(i < bookmarks.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[645]++;
    var range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[646]++;
    range.moveToBookmark(bookmarks[i]);
    _$jscoverage['/editor/selection.js'].lineData[647]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[649]++;
  self.selectRanges(ranges);
  _$jscoverage['/editor/selection.js'].lineData[650]++;
  return self;
}, 
  getCommonAncestor: function() {
  _$jscoverage['/editor/selection.js'].functionData[19]++;
  _$jscoverage['/editor/selection.js'].lineData[654]++;
  var ranges = this.getRanges(), startNode = ranges[0].startContainer, endNode = ranges[ranges.length - 1].endContainer;
  _$jscoverage['/editor/selection.js'].lineData[657]++;
  return startNode._4eCommonAncestor(endNode);
}, 
  scrollIntoView: function() {
  _$jscoverage['/editor/selection.js'].functionData[20]++;
  _$jscoverage['/editor/selection.js'].lineData[664]++;
  var start = this.getStartElement();
  _$jscoverage['/editor/selection.js'].lineData[665]++;
  if (visit796_665_1(start)) {
    _$jscoverage['/editor/selection.js'].lineData[666]++;
    start.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
}, 
  removeAllRanges: function() {
  _$jscoverage['/editor/selection.js'].functionData[21]++;
  _$jscoverage['/editor/selection.js'].lineData[674]++;
  var sel = this.getNative();
  _$jscoverage['/editor/selection.js'].lineData[675]++;
  if (visit797_675_1(!OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[676]++;
    if (visit798_676_1(sel)) {
      _$jscoverage['/editor/selection.js'].lineData[677]++;
      sel.removeAllRanges();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[680]++;
    if (visit799_680_1(sel)) {
      _$jscoverage['/editor/selection.js'].lineData[681]++;
      sel.clear();
    }
  }
}});
  _$jscoverage['/editor/selection.js'].lineData[687]++;
  var nonCells = {
  table: 1, 
  tbody: 1, 
  tr: 1}, notWhitespaces = Walker.whitespaces(TRUE), fillerTextRegex = /\ufeff|\u00a0/;
  _$jscoverage['/editor/selection.js'].lineData[694]++;
  KERange.prototype.select = !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[22]++;
  _$jscoverage['/editor/selection.js'].lineData[696]++;
  var self = this, startContainer = self.startContainer;
  _$jscoverage['/editor/selection.js'].lineData[700]++;
  if (visit800_700_1(self.collapsed && visit801_701_1(visit802_701_2(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length))) {
    _$jscoverage['/editor/selection.js'].lineData[702]++;
    startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
    _$jscoverage['/editor/selection.js'].lineData[706]++;
    self.startOffset++;
    _$jscoverage['/editor/selection.js'].lineData[707]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/selection.js'].lineData[710]++;
  var nativeRange = self.document.createRange();
  _$jscoverage['/editor/selection.js'].lineData[711]++;
  nativeRange.setStart(startContainer[0], self.startOffset);
  _$jscoverage['/editor/selection.js'].lineData[713]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[714]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[719]++;
  if (visit803_719_1(e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0)) {
    _$jscoverage['/editor/selection.js'].lineData[720]++;
    self.collapse(TRUE);
    _$jscoverage['/editor/selection.js'].lineData[721]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[723]++;
    throw (e);
  }
}
  _$jscoverage['/editor/selection.js'].lineData[727]++;
  var selection = getSelection(self.document).getNative();
  _$jscoverage['/editor/selection.js'].lineData[728]++;
  selection.removeAllRanges();
  _$jscoverage['/editor/selection.js'].lineData[729]++;
  selection.addRange(nativeRange);
} : function(forceExpand) {
  _$jscoverage['/editor/selection.js'].functionData[23]++;
  _$jscoverage['/editor/selection.js'].lineData[733]++;
  var self = this, collapsed = self.collapsed, isStartMarkerAlone, dummySpan;
  _$jscoverage['/editor/selection.js'].lineData[739]++;
  if (visit804_742_1(visit805_742_2(self.startContainer[0] === self.endContainer[0]) && visit806_742_3(self.endOffset - self.startOffset === 1))) {
    _$jscoverage['/editor/selection.js'].lineData[743]++;
    var selEl = self.startContainer[0].childNodes[self.startOffset];
    _$jscoverage['/editor/selection.js'].lineData[744]++;
    if (visit807_744_1(selEl.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[745]++;
      new KESelection(self.document).selectElement(new Node(selEl));
      _$jscoverage['/editor/selection.js'].lineData[746]++;
      return;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[751]++;
  if (visit808_751_1(visit809_751_2(visit810_751_3(self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && self.startContainer.nodeName() in nonCells) || visit811_753_1(visit812_753_2(self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && self.endContainer.nodeName() in nonCells))) {
    _$jscoverage['/editor/selection.js'].lineData[755]++;
    self.shrink(KER.SHRINK_ELEMENT, TRUE);
  }
  _$jscoverage['/editor/selection.js'].lineData[758]++;
  var bookmark = self.createBookmark(), startNode = bookmark.startNode, endNode;
  _$jscoverage['/editor/selection.js'].lineData[762]++;
  if (visit813_762_1(!collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[763]++;
    endNode = bookmark.endNode;
  }
  _$jscoverage['/editor/selection.js'].lineData[767]++;
  var ieRange = self.document.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[770]++;
  ieRange.moveToElementText(startNode[0]);
  _$jscoverage['/editor/selection.js'].lineData[772]++;
  ieRange.moveStart('character', 1);
  _$jscoverage['/editor/selection.js'].lineData[774]++;
  if (visit814_774_1(endNode)) {
    _$jscoverage['/editor/selection.js'].lineData[776]++;
    var ieRangeEnd = self.document.body.createTextRange();
    _$jscoverage['/editor/selection.js'].lineData[778]++;
    ieRangeEnd.moveToElementText(endNode[0]);
    _$jscoverage['/editor/selection.js'].lineData[780]++;
    ieRange.setEndPoint('EndToEnd', ieRangeEnd);
    _$jscoverage['/editor/selection.js'].lineData[781]++;
    ieRange.moveEnd('character', -1);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[787]++;
    var next = startNode[0].nextSibling;
    _$jscoverage['/editor/selection.js'].lineData[788]++;
    while (visit815_788_1(next && !notWhitespaces(next))) {
      _$jscoverage['/editor/selection.js'].lineData[789]++;
      next = next.nextSibling;
    }
    _$jscoverage['/editor/selection.js'].lineData[791]++;
    isStartMarkerAlone = (visit816_792_1(!(visit817_792_2(next && visit818_792_3(next.nodeValue && next.nodeValue.match(fillerTextRegex)))) && (visit819_794_1(forceExpand || visit820_794_2(!startNode[0].previousSibling || (visit821_796_1(startNode[0].previousSibling && visit822_797_1(Dom.nodeName(startNode[0].previousSibling) === 'br'))))))));
    _$jscoverage['/editor/selection.js'].lineData[807]++;
    dummySpan = new Node(self.document.createElement('span'));
    _$jscoverage['/editor/selection.js'].lineData[808]++;
    dummySpan.html('&#65279;');
    _$jscoverage['/editor/selection.js'].lineData[809]++;
    dummySpan.insertBefore(startNode);
    _$jscoverage['/editor/selection.js'].lineData[810]++;
    if (visit823_810_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[815]++;
      Dom.insertBefore(self.document.createTextNode('\ufeff'), visit824_815_1(startNode[0] || startNode));
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[820]++;
  self.setStartBefore(startNode);
  _$jscoverage['/editor/selection.js'].lineData[821]++;
  startNode._4eRemove();
  _$jscoverage['/editor/selection.js'].lineData[823]++;
  if (visit825_823_1(collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[824]++;
    if (visit826_824_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[826]++;
      ieRange.moveStart('character', -1);
      _$jscoverage['/editor/selection.js'].lineData[827]++;
      ieRange.select();
      _$jscoverage['/editor/selection.js'].lineData[829]++;
      self.document.selection.clear();
    } else {
      _$jscoverage['/editor/selection.js'].lineData[831]++;
      ieRange.select();
    }
    _$jscoverage['/editor/selection.js'].lineData[833]++;
    if (visit827_833_1(dummySpan)) {
      _$jscoverage['/editor/selection.js'].lineData[834]++;
      self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/selection.js'].lineData[835]++;
      dummySpan._4eRemove();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[838]++;
    self.setEndBefore(endNode);
    _$jscoverage['/editor/selection.js'].lineData[839]++;
    endNode._4eRemove();
    _$jscoverage['/editor/selection.js'].lineData[840]++;
    ieRange.select();
  }
};
  _$jscoverage['/editor/selection.js'].lineData[844]++;
  function getSelection(doc) {
    _$jscoverage['/editor/selection.js'].functionData[24]++;
    _$jscoverage['/editor/selection.js'].lineData[845]++;
    var sel = new KESelection(doc);
    _$jscoverage['/editor/selection.js'].lineData[846]++;
    return (visit828_846_1(!sel || sel.isInvalid)) ? NULL : sel;
  }
  _$jscoverage['/editor/selection.js'].lineData[849]++;
  KESelection.getSelection = getSelection;
  _$jscoverage['/editor/selection.js'].lineData[851]++;
  Editor.Selection = KESelection;
  _$jscoverage['/editor/selection.js'].lineData[853]++;
  return KESelection;
});
