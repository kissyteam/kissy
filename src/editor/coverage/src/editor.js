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
  _$jscoverage['/editor.js'].lineData[8] = 0;
  _$jscoverage['/editor.js'].lineData[9] = 0;
  _$jscoverage['/editor.js'].lineData[10] = 0;
  _$jscoverage['/editor.js'].lineData[11] = 0;
  _$jscoverage['/editor.js'].lineData[12] = 0;
  _$jscoverage['/editor.js'].lineData[13] = 0;
  _$jscoverage['/editor.js'].lineData[14] = 0;
  _$jscoverage['/editor.js'].lineData[15] = 0;
  _$jscoverage['/editor.js'].lineData[16] = 0;
  _$jscoverage['/editor.js'].lineData[17] = 0;
  _$jscoverage['/editor.js'].lineData[18] = 0;
  _$jscoverage['/editor.js'].lineData[19] = 0;
  _$jscoverage['/editor.js'].lineData[20] = 0;
  _$jscoverage['/editor.js'].lineData[21] = 0;
  _$jscoverage['/editor.js'].lineData[43] = 0;
  _$jscoverage['/editor.js'].lineData[48] = 0;
  _$jscoverage['/editor.js'].lineData[50] = 0;
  _$jscoverage['/editor.js'].lineData[51] = 0;
  _$jscoverage['/editor.js'].lineData[54] = 0;
  _$jscoverage['/editor.js'].lineData[56] = 0;
  _$jscoverage['/editor.js'].lineData[58] = 0;
  _$jscoverage['/editor.js'].lineData[59] = 0;
  _$jscoverage['/editor.js'].lineData[62] = 0;
  _$jscoverage['/editor.js'].lineData[64] = 0;
  _$jscoverage['/editor.js'].lineData[65] = 0;
  _$jscoverage['/editor.js'].lineData[66] = 0;
  _$jscoverage['/editor.js'].lineData[68] = 0;
  _$jscoverage['/editor.js'].lineData[73] = 0;
  _$jscoverage['/editor.js'].lineData[74] = 0;
  _$jscoverage['/editor.js'].lineData[75] = 0;
  _$jscoverage['/editor.js'].lineData[76] = 0;
  _$jscoverage['/editor.js'].lineData[77] = 0;
  _$jscoverage['/editor.js'].lineData[81] = 0;
  _$jscoverage['/editor.js'].lineData[86] = 0;
  _$jscoverage['/editor.js'].lineData[89] = 0;
  _$jscoverage['/editor.js'].lineData[92] = 0;
  _$jscoverage['/editor.js'].lineData[93] = 0;
  _$jscoverage['/editor.js'].lineData[95] = 0;
  _$jscoverage['/editor.js'].lineData[96] = 0;
  _$jscoverage['/editor.js'].lineData[99] = 0;
  _$jscoverage['/editor.js'].lineData[100] = 0;
  _$jscoverage['/editor.js'].lineData[101] = 0;
  _$jscoverage['/editor.js'].lineData[106] = 0;
  _$jscoverage['/editor.js'].lineData[108] = 0;
  _$jscoverage['/editor.js'].lineData[109] = 0;
  _$jscoverage['/editor.js'].lineData[112] = 0;
  _$jscoverage['/editor.js'].lineData[113] = 0;
  _$jscoverage['/editor.js'].lineData[118] = 0;
  _$jscoverage['/editor.js'].lineData[125] = 0;
  _$jscoverage['/editor.js'].lineData[126] = 0;
  _$jscoverage['/editor.js'].lineData[134] = 0;
  _$jscoverage['/editor.js'].lineData[142] = 0;
  _$jscoverage['/editor.js'].lineData[151] = 0;
  _$jscoverage['/editor.js'].lineData[161] = 0;
  _$jscoverage['/editor.js'].lineData[162] = 0;
  _$jscoverage['/editor.js'].lineData[164] = 0;
  _$jscoverage['/editor.js'].lineData[165] = 0;
  _$jscoverage['/editor.js'].lineData[179] = 0;
  _$jscoverage['/editor.js'].lineData[188] = 0;
  _$jscoverage['/editor.js'].lineData[198] = 0;
  _$jscoverage['/editor.js'].lineData[201] = 0;
  _$jscoverage['/editor.js'].lineData[202] = 0;
  _$jscoverage['/editor.js'].lineData[203] = 0;
  _$jscoverage['/editor.js'].lineData[204] = 0;
  _$jscoverage['/editor.js'].lineData[206] = 0;
  _$jscoverage['/editor.js'].lineData[207] = 0;
  _$jscoverage['/editor.js'].lineData[217] = 0;
  _$jscoverage['/editor.js'].lineData[221] = 0;
  _$jscoverage['/editor.js'].lineData[224] = 0;
  _$jscoverage['/editor.js'].lineData[226] = 0;
  _$jscoverage['/editor.js'].lineData[227] = 0;
  _$jscoverage['/editor.js'].lineData[229] = 0;
  _$jscoverage['/editor.js'].lineData[230] = 0;
  _$jscoverage['/editor.js'].lineData[233] = 0;
  _$jscoverage['/editor.js'].lineData[234] = 0;
  _$jscoverage['/editor.js'].lineData[245] = 0;
  _$jscoverage['/editor.js'].lineData[248] = 0;
  _$jscoverage['/editor.js'].lineData[249] = 0;
  _$jscoverage['/editor.js'].lineData[251] = 0;
  _$jscoverage['/editor.js'].lineData[252] = 0;
  _$jscoverage['/editor.js'].lineData[254] = 0;
  _$jscoverage['/editor.js'].lineData[257] = 0;
  _$jscoverage['/editor.js'].lineData[258] = 0;
  _$jscoverage['/editor.js'].lineData[260] = 0;
  _$jscoverage['/editor.js'].lineData[262] = 0;
  _$jscoverage['/editor.js'].lineData[266] = 0;
  _$jscoverage['/editor.js'].lineData[267] = 0;
  _$jscoverage['/editor.js'].lineData[269] = 0;
  _$jscoverage['/editor.js'].lineData[279] = 0;
  _$jscoverage['/editor.js'].lineData[287] = 0;
  _$jscoverage['/editor.js'].lineData[288] = 0;
  _$jscoverage['/editor.js'].lineData[297] = 0;
  _$jscoverage['/editor.js'].lineData[306] = 0;
  _$jscoverage['/editor.js'].lineData[310] = 0;
  _$jscoverage['/editor.js'].lineData[311] = 0;
  _$jscoverage['/editor.js'].lineData[312] = 0;
  _$jscoverage['/editor.js'].lineData[313] = 0;
  _$jscoverage['/editor.js'].lineData[314] = 0;
  _$jscoverage['/editor.js'].lineData[316] = 0;
  _$jscoverage['/editor.js'].lineData[324] = 0;
  _$jscoverage['/editor.js'].lineData[327] = 0;
  _$jscoverage['/editor.js'].lineData[328] = 0;
  _$jscoverage['/editor.js'].lineData[330] = 0;
  _$jscoverage['/editor.js'].lineData[331] = 0;
  _$jscoverage['/editor.js'].lineData[333] = 0;
  _$jscoverage['/editor.js'].lineData[336] = 0;
  _$jscoverage['/editor.js'].lineData[337] = 0;
  _$jscoverage['/editor.js'].lineData[342] = 0;
  _$jscoverage['/editor.js'].lineData[343] = 0;
  _$jscoverage['/editor.js'].lineData[346] = 0;
  _$jscoverage['/editor.js'].lineData[347] = 0;
  _$jscoverage['/editor.js'].lineData[351] = 0;
  _$jscoverage['/editor.js'].lineData[359] = 0;
  _$jscoverage['/editor.js'].lineData[361] = 0;
  _$jscoverage['/editor.js'].lineData[362] = 0;
  _$jscoverage['/editor.js'].lineData[372] = 0;
  _$jscoverage['/editor.js'].lineData[375] = 0;
  _$jscoverage['/editor.js'].lineData[376] = 0;
  _$jscoverage['/editor.js'].lineData[377] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[388] = 0;
  _$jscoverage['/editor.js'].lineData[397] = 0;
  _$jscoverage['/editor.js'].lineData[400] = 0;
  _$jscoverage['/editor.js'].lineData[401] = 0;
  _$jscoverage['/editor.js'].lineData[402] = 0;
  _$jscoverage['/editor.js'].lineData[403] = 0;
  _$jscoverage['/editor.js'].lineData[404] = 0;
  _$jscoverage['/editor.js'].lineData[405] = 0;
  _$jscoverage['/editor.js'].lineData[414] = 0;
  _$jscoverage['/editor.js'].lineData[417] = 0;
  _$jscoverage['/editor.js'].lineData[418] = 0;
  _$jscoverage['/editor.js'].lineData[419] = 0;
  _$jscoverage['/editor.js'].lineData[422] = 0;
  _$jscoverage['/editor.js'].lineData[424] = 0;
  _$jscoverage['/editor.js'].lineData[425] = 0;
  _$jscoverage['/editor.js'].lineData[436] = 0;
  _$jscoverage['/editor.js'].lineData[437] = 0;
  _$jscoverage['/editor.js'].lineData[438] = 0;
  _$jscoverage['/editor.js'].lineData[439] = 0;
  _$jscoverage['/editor.js'].lineData[449] = 0;
  _$jscoverage['/editor.js'].lineData[458] = 0;
  _$jscoverage['/editor.js'].lineData[459] = 0;
  _$jscoverage['/editor.js'].lineData[460] = 0;
  _$jscoverage['/editor.js'].lineData[463] = 0;
  _$jscoverage['/editor.js'].lineData[464] = 0;
  _$jscoverage['/editor.js'].lineData[465] = 0;
  _$jscoverage['/editor.js'].lineData[466] = 0;
  _$jscoverage['/editor.js'].lineData[468] = 0;
  _$jscoverage['/editor.js'].lineData[469] = 0;
  _$jscoverage['/editor.js'].lineData[470] = 0;
  _$jscoverage['/editor.js'].lineData[486] = 0;
  _$jscoverage['/editor.js'].lineData[487] = 0;
  _$jscoverage['/editor.js'].lineData[488] = 0;
  _$jscoverage['/editor.js'].lineData[497] = 0;
  _$jscoverage['/editor.js'].lineData[499] = 0;
  _$jscoverage['/editor.js'].lineData[500] = 0;
  _$jscoverage['/editor.js'].lineData[503] = 0;
  _$jscoverage['/editor.js'].lineData[505] = 0;
  _$jscoverage['/editor.js'].lineData[519] = 0;
  _$jscoverage['/editor.js'].lineData[520] = 0;
  _$jscoverage['/editor.js'].lineData[523] = 0;
  _$jscoverage['/editor.js'].lineData[525] = 0;
  _$jscoverage['/editor.js'].lineData[526] = 0;
  _$jscoverage['/editor.js'].lineData[529] = 0;
  _$jscoverage['/editor.js'].lineData[530] = 0;
  _$jscoverage['/editor.js'].lineData[533] = 0;
  _$jscoverage['/editor.js'].lineData[534] = 0;
  _$jscoverage['/editor.js'].lineData[538] = 0;
  _$jscoverage['/editor.js'].lineData[539] = 0;
  _$jscoverage['/editor.js'].lineData[542] = 0;
  _$jscoverage['/editor.js'].lineData[545] = 0;
  _$jscoverage['/editor.js'].lineData[546] = 0;
  _$jscoverage['/editor.js'].lineData[547] = 0;
  _$jscoverage['/editor.js'].lineData[548] = 0;
  _$jscoverage['/editor.js'].lineData[551] = 0;
  _$jscoverage['/editor.js'].lineData[554] = 0;
  _$jscoverage['/editor.js'].lineData[557] = 0;
  _$jscoverage['/editor.js'].lineData[558] = 0;
  _$jscoverage['/editor.js'].lineData[561] = 0;
  _$jscoverage['/editor.js'].lineData[562] = 0;
  _$jscoverage['/editor.js'].lineData[568] = 0;
  _$jscoverage['/editor.js'].lineData[569] = 0;
  _$jscoverage['/editor.js'].lineData[579] = 0;
  _$jscoverage['/editor.js'].lineData[583] = 0;
  _$jscoverage['/editor.js'].lineData[584] = 0;
  _$jscoverage['/editor.js'].lineData[587] = 0;
  _$jscoverage['/editor.js'].lineData[588] = 0;
  _$jscoverage['/editor.js'].lineData[591] = 0;
  _$jscoverage['/editor.js'].lineData[592] = 0;
  _$jscoverage['/editor.js'].lineData[596] = 0;
  _$jscoverage['/editor.js'].lineData[597] = 0;
  _$jscoverage['/editor.js'].lineData[598] = 0;
  _$jscoverage['/editor.js'].lineData[599] = 0;
  _$jscoverage['/editor.js'].lineData[601] = 0;
  _$jscoverage['/editor.js'].lineData[602] = 0;
  _$jscoverage['/editor.js'].lineData[604] = 0;
  _$jscoverage['/editor.js'].lineData[611] = 0;
  _$jscoverage['/editor.js'].lineData[614] = 0;
  _$jscoverage['/editor.js'].lineData[619] = 0;
  _$jscoverage['/editor.js'].lineData[620] = 0;
  _$jscoverage['/editor.js'].lineData[621] = 0;
  _$jscoverage['/editor.js'].lineData[622] = 0;
  _$jscoverage['/editor.js'].lineData[623] = 0;
  _$jscoverage['/editor.js'].lineData[625] = 0;
  _$jscoverage['/editor.js'].lineData[628] = 0;
  _$jscoverage['/editor.js'].lineData[629] = 0;
  _$jscoverage['/editor.js'].lineData[630] = 0;
  _$jscoverage['/editor.js'].lineData[631] = 0;
  _$jscoverage['/editor.js'].lineData[632] = 0;
  _$jscoverage['/editor.js'].lineData[633] = 0;
  _$jscoverage['/editor.js'].lineData[638] = 0;
  _$jscoverage['/editor.js'].lineData[639] = 0;
  _$jscoverage['/editor.js'].lineData[641] = 0;
  _$jscoverage['/editor.js'].lineData[646] = 0;
  _$jscoverage['/editor.js'].lineData[650] = 0;
  _$jscoverage['/editor.js'].lineData[653] = 0;
  _$jscoverage['/editor.js'].lineData[654] = 0;
  _$jscoverage['/editor.js'].lineData[655] = 0;
  _$jscoverage['/editor.js'].lineData[656] = 0;
  _$jscoverage['/editor.js'].lineData[659] = 0;
  _$jscoverage['/editor.js'].lineData[660] = 0;
  _$jscoverage['/editor.js'].lineData[661] = 0;
  _$jscoverage['/editor.js'].lineData[663] = 0;
  _$jscoverage['/editor.js'].lineData[664] = 0;
  _$jscoverage['/editor.js'].lineData[670] = 0;
  _$jscoverage['/editor.js'].lineData[672] = 0;
  _$jscoverage['/editor.js'].lineData[673] = 0;
  _$jscoverage['/editor.js'].lineData[678] = 0;
  _$jscoverage['/editor.js'].lineData[683] = 0;
  _$jscoverage['/editor.js'].lineData[686] = 0;
  _$jscoverage['/editor.js'].lineData[689] = 0;
  _$jscoverage['/editor.js'].lineData[690] = 0;
  _$jscoverage['/editor.js'].lineData[694] = 0;
  _$jscoverage['/editor.js'].lineData[696] = 0;
  _$jscoverage['/editor.js'].lineData[698] = 0;
  _$jscoverage['/editor.js'].lineData[700] = 0;
  _$jscoverage['/editor.js'].lineData[702] = 0;
  _$jscoverage['/editor.js'].lineData[705] = 0;
  _$jscoverage['/editor.js'].lineData[706] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[711] = 0;
  _$jscoverage['/editor.js'].lineData[712] = 0;
  _$jscoverage['/editor.js'].lineData[724] = 0;
  _$jscoverage['/editor.js'].lineData[725] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[727] = 0;
  _$jscoverage['/editor.js'].lineData[728] = 0;
  _$jscoverage['/editor.js'].lineData[729] = 0;
  _$jscoverage['/editor.js'].lineData[730] = 0;
  _$jscoverage['/editor.js'].lineData[731] = 0;
  _$jscoverage['/editor.js'].lineData[732] = 0;
  _$jscoverage['/editor.js'].lineData[734] = 0;
  _$jscoverage['/editor.js'].lineData[735] = 0;
  _$jscoverage['/editor.js'].lineData[737] = 0;
  _$jscoverage['/editor.js'].lineData[738] = 0;
  _$jscoverage['/editor.js'].lineData[740] = 0;
  _$jscoverage['/editor.js'].lineData[741] = 0;
  _$jscoverage['/editor.js'].lineData[742] = 0;
  _$jscoverage['/editor.js'].lineData[743] = 0;
  _$jscoverage['/editor.js'].lineData[744] = 0;
  _$jscoverage['/editor.js'].lineData[751] = 0;
  _$jscoverage['/editor.js'].lineData[752] = 0;
  _$jscoverage['/editor.js'].lineData[758] = 0;
  _$jscoverage['/editor.js'].lineData[760] = 0;
  _$jscoverage['/editor.js'].lineData[762] = 0;
  _$jscoverage['/editor.js'].lineData[764] = 0;
  _$jscoverage['/editor.js'].lineData[786] = 0;
  _$jscoverage['/editor.js'].lineData[788] = 0;
  _$jscoverage['/editor.js'].lineData[791] = 0;
  _$jscoverage['/editor.js'].lineData[792] = 0;
  _$jscoverage['/editor.js'].lineData[793] = 0;
  _$jscoverage['/editor.js'].lineData[797] = 0;
  _$jscoverage['/editor.js'].lineData[799] = 0;
  _$jscoverage['/editor.js'].lineData[800] = 0;
  _$jscoverage['/editor.js'].lineData[801] = 0;
  _$jscoverage['/editor.js'].lineData[802] = 0;
  _$jscoverage['/editor.js'].lineData[804] = 0;
  _$jscoverage['/editor.js'].lineData[812] = 0;
  _$jscoverage['/editor.js'].lineData[823] = 0;
  _$jscoverage['/editor.js'].lineData[824] = 0;
  _$jscoverage['/editor.js'].lineData[831] = 0;
  _$jscoverage['/editor.js'].lineData[832] = 0;
  _$jscoverage['/editor.js'].lineData[833] = 0;
  _$jscoverage['/editor.js'].lineData[834] = 0;
  _$jscoverage['/editor.js'].lineData[841] = 0;
  _$jscoverage['/editor.js'].lineData[847] = 0;
  _$jscoverage['/editor.js'].lineData[856] = 0;
  _$jscoverage['/editor.js'].lineData[857] = 0;
  _$jscoverage['/editor.js'].lineData[858] = 0;
  _$jscoverage['/editor.js'].lineData[859] = 0;
  _$jscoverage['/editor.js'].lineData[860] = 0;
  _$jscoverage['/editor.js'].lineData[866] = 0;
  _$jscoverage['/editor.js'].lineData[867] = 0;
  _$jscoverage['/editor.js'].lineData[868] = 0;
  _$jscoverage['/editor.js'].lineData[872] = 0;
  _$jscoverage['/editor.js'].lineData[874] = 0;
  _$jscoverage['/editor.js'].lineData[876] = 0;
  _$jscoverage['/editor.js'].lineData[877] = 0;
  _$jscoverage['/editor.js'].lineData[878] = 0;
  _$jscoverage['/editor.js'].lineData[883] = 0;
  _$jscoverage['/editor.js'].lineData[884] = 0;
  _$jscoverage['/editor.js'].lineData[885] = 0;
  _$jscoverage['/editor.js'].lineData[888] = 0;
  _$jscoverage['/editor.js'].lineData[898] = 0;
  _$jscoverage['/editor.js'].lineData[899] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[902] = 0;
  _$jscoverage['/editor.js'].lineData[904] = 0;
  _$jscoverage['/editor.js'].lineData[905] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[908] = 0;
  _$jscoverage['/editor.js'].lineData[909] = 0;
  _$jscoverage['/editor.js'].lineData[915] = 0;
  _$jscoverage['/editor.js'].lineData[916] = 0;
  _$jscoverage['/editor.js'].lineData[917] = 0;
  _$jscoverage['/editor.js'].lineData[919] = 0;
  _$jscoverage['/editor.js'].lineData[920] = 0;
  _$jscoverage['/editor.js'].lineData[926] = 0;
  _$jscoverage['/editor.js'].lineData[927] = 0;
  _$jscoverage['/editor.js'].lineData[936] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[938] = 0;
  _$jscoverage['/editor.js'].lineData[939] = 0;
  _$jscoverage['/editor.js'].lineData[940] = 0;
  _$jscoverage['/editor.js'].lineData[944] = 0;
  _$jscoverage['/editor.js'].lineData[945] = 0;
  _$jscoverage['/editor.js'].lineData[946] = 0;
  _$jscoverage['/editor.js'].lineData[947] = 0;
  _$jscoverage['/editor.js'].lineData[953] = 0;
  _$jscoverage['/editor.js'].lineData[954] = 0;
  _$jscoverage['/editor.js'].lineData[955] = 0;
  _$jscoverage['/editor.js'].lineData[962] = 0;
  _$jscoverage['/editor.js'].lineData[963] = 0;
  _$jscoverage['/editor.js'].lineData[965] = 0;
  _$jscoverage['/editor.js'].lineData[966] = 0;
  _$jscoverage['/editor.js'].lineData[967] = 0;
  _$jscoverage['/editor.js'].lineData[970] = 0;
  _$jscoverage['/editor.js'].lineData[971] = 0;
  _$jscoverage['/editor.js'].lineData[972] = 0;
  _$jscoverage['/editor.js'].lineData[976] = 0;
  _$jscoverage['/editor.js'].lineData[982] = 0;
  _$jscoverage['/editor.js'].lineData[983] = 0;
  _$jscoverage['/editor.js'].lineData[984] = 0;
  _$jscoverage['/editor.js'].lineData[985] = 0;
  _$jscoverage['/editor.js'].lineData[988] = 0;
  _$jscoverage['/editor.js'].lineData[991] = 0;
  _$jscoverage['/editor.js'].lineData[995] = 0;
  _$jscoverage['/editor.js'].lineData[996] = 0;
  _$jscoverage['/editor.js'].lineData[997] = 0;
  _$jscoverage['/editor.js'].lineData[1002] = 0;
  _$jscoverage['/editor.js'].lineData[1008] = 0;
  _$jscoverage['/editor.js'].lineData[1009] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1012] = 0;
  _$jscoverage['/editor.js'].lineData[1014] = 0;
  _$jscoverage['/editor.js'].lineData[1016] = 0;
  _$jscoverage['/editor.js'].lineData[1019] = 0;
  _$jscoverage['/editor.js'].lineData[1021] = 0;
  _$jscoverage['/editor.js'].lineData[1022] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1024] = 0;
  _$jscoverage['/editor.js'].lineData[1032] = 0;
  _$jscoverage['/editor.js'].lineData[1033] = 0;
  _$jscoverage['/editor.js'].lineData[1034] = 0;
  _$jscoverage['/editor.js'].lineData[1035] = 0;
  _$jscoverage['/editor.js'].lineData[1036] = 0;
  _$jscoverage['/editor.js'].lineData[1037] = 0;
  _$jscoverage['/editor.js'].lineData[1045] = 0;
  _$jscoverage['/editor.js'].lineData[1046] = 0;
  _$jscoverage['/editor.js'].lineData[1047] = 0;
  _$jscoverage['/editor.js'].lineData[1048] = 0;
  _$jscoverage['/editor.js'].lineData[1049] = 0;
  _$jscoverage['/editor.js'].lineData[1054] = 0;
  _$jscoverage['/editor.js'].lineData[1055] = 0;
  _$jscoverage['/editor.js'].lineData[1056] = 0;
  _$jscoverage['/editor.js'].lineData[1057] = 0;
  _$jscoverage['/editor.js'].lineData[1059] = 0;
  _$jscoverage['/editor.js'].lineData[1065] = 0;
  _$jscoverage['/editor.js'].lineData[1068] = 0;
  _$jscoverage['/editor.js'].lineData[1069] = 0;
  _$jscoverage['/editor.js'].lineData[1071] = 0;
  _$jscoverage['/editor.js'].lineData[1072] = 0;
  _$jscoverage['/editor.js'].lineData[1073] = 0;
  _$jscoverage['/editor.js'].lineData[1074] = 0;
  _$jscoverage['/editor.js'].lineData[1075] = 0;
  _$jscoverage['/editor.js'].lineData[1079] = 0;
  _$jscoverage['/editor.js'].lineData[1106] = 0;
  _$jscoverage['/editor.js'].lineData[1107] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1111] = 0;
  _$jscoverage['/editor.js'].lineData[1118] = 0;
  _$jscoverage['/editor.js'].lineData[1119] = 0;
  _$jscoverage['/editor.js'].lineData[1127] = 0;
  _$jscoverage['/editor.js'].lineData[1132] = 0;
  _$jscoverage['/editor.js'].lineData[1135] = 0;
  _$jscoverage['/editor.js'].lineData[1136] = 0;
  _$jscoverage['/editor.js'].lineData[1137] = 0;
  _$jscoverage['/editor.js'].lineData[1140] = 0;
  _$jscoverage['/editor.js'].lineData[1141] = 0;
  _$jscoverage['/editor.js'].lineData[1142] = 0;
  _$jscoverage['/editor.js'].lineData[1143] = 0;
  _$jscoverage['/editor.js'].lineData[1144] = 0;
  _$jscoverage['/editor.js'].lineData[1145] = 0;
  _$jscoverage['/editor.js'].lineData[1147] = 0;
  _$jscoverage['/editor.js'].lineData[1148] = 0;
  _$jscoverage['/editor.js'].lineData[1149] = 0;
  _$jscoverage['/editor.js'].lineData[1153] = 0;
  _$jscoverage['/editor.js'].lineData[1157] = 0;
  _$jscoverage['/editor.js'].lineData[1158] = 0;
  _$jscoverage['/editor.js'].lineData[1159] = 0;
  _$jscoverage['/editor.js'].lineData[1161] = 0;
  _$jscoverage['/editor.js'].lineData[1166] = 0;
  _$jscoverage['/editor.js'].lineData[1167] = 0;
  _$jscoverage['/editor.js'].lineData[1169] = 0;
  _$jscoverage['/editor.js'].lineData[1170] = 0;
  _$jscoverage['/editor.js'].lineData[1171] = 0;
  _$jscoverage['/editor.js'].lineData[1173] = 0;
  _$jscoverage['/editor.js'].lineData[1174] = 0;
  _$jscoverage['/editor.js'].lineData[1175] = 0;
  _$jscoverage['/editor.js'].lineData[1179] = 0;
  _$jscoverage['/editor.js'].lineData[1183] = 0;
  _$jscoverage['/editor.js'].lineData[1184] = 0;
  _$jscoverage['/editor.js'].lineData[1185] = 0;
  _$jscoverage['/editor.js'].lineData[1187] = 0;
  _$jscoverage['/editor.js'].lineData[1193] = 0;
  _$jscoverage['/editor.js'].lineData[1194] = 0;
  _$jscoverage['/editor.js'].lineData[1196] = 0;
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
  _$jscoverage['/editor.js'].functionData[76] = 0;
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['27'] = [];
  _$jscoverage['/editor.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['56'] = [];
  _$jscoverage['/editor.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['57'] = [];
  _$jscoverage['/editor.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['86'] = [];
  _$jscoverage['/editor.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['87'] = [];
  _$jscoverage['/editor.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['95'] = [];
  _$jscoverage['/editor.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['100'] = [];
  _$jscoverage['/editor.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['203'] = [];
  _$jscoverage['/editor.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['224'] = [];
  _$jscoverage['/editor.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['248'] = [];
  _$jscoverage['/editor.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['251'] = [];
  _$jscoverage['/editor.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['257'] = [];
  _$jscoverage['/editor.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['266'] = [];
  _$jscoverage['/editor.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['310'] = [];
  _$jscoverage['/editor.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['327'] = [];
  _$jscoverage['/editor.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['333'] = [];
  _$jscoverage['/editor.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['336'] = [];
  _$jscoverage['/editor.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['342'] = [];
  _$jscoverage['/editor.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['374'] = [];
  _$jscoverage['/editor.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['377'] = [];
  _$jscoverage['/editor.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['418'] = [];
  _$jscoverage['/editor.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['424'] = [];
  _$jscoverage['/editor.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['438'] = [];
  _$jscoverage['/editor.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['459'] = [];
  _$jscoverage['/editor.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['465'] = [];
  _$jscoverage['/editor.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['468'] = [];
  _$jscoverage['/editor.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['499'] = [];
  _$jscoverage['/editor.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['511'] = [];
  _$jscoverage['/editor.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['519'] = [];
  _$jscoverage['/editor.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['519'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['525'] = [];
  _$jscoverage['/editor.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['529'] = [];
  _$jscoverage['/editor.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['529'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['533'] = [];
  _$jscoverage['/editor.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['538'] = [];
  _$jscoverage['/editor.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['545'] = [];
  _$jscoverage['/editor.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['548'] = [];
  _$jscoverage['/editor.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['548'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['548'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['551'] = [];
  _$jscoverage['/editor.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['552'] = [];
  _$jscoverage['/editor.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['561'] = [];
  _$jscoverage['/editor.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['561'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['583'] = [];
  _$jscoverage['/editor.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['597'] = [];
  _$jscoverage['/editor.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['598'] = [];
  _$jscoverage['/editor.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['628'] = [];
  _$jscoverage['/editor.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['653'] = [];
  _$jscoverage['/editor.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['659'] = [];
  _$jscoverage['/editor.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['672'] = [];
  _$jscoverage['/editor.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['683'] = [];
  _$jscoverage['/editor.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['684'] = [];
  _$jscoverage['/editor.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['689'] = [];
  _$jscoverage['/editor.js'].branchData['689'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['706'] = [];
  _$jscoverage['/editor.js'].branchData['706'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['725'] = [];
  _$jscoverage['/editor.js'].branchData['725'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['727'] = [];
  _$jscoverage['/editor.js'].branchData['727'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['731'] = [];
  _$jscoverage['/editor.js'].branchData['731'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['732'] = [];
  _$jscoverage['/editor.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['734'] = [];
  _$jscoverage['/editor.js'].branchData['734'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['735'] = [];
  _$jscoverage['/editor.js'].branchData['735'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['737'] = [];
  _$jscoverage['/editor.js'].branchData['737'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['740'] = [];
  _$jscoverage['/editor.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['786'] = [];
  _$jscoverage['/editor.js'].branchData['786'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['799'] = [];
  _$jscoverage['/editor.js'].branchData['799'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['801'] = [];
  _$jscoverage['/editor.js'].branchData['801'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['821'] = [];
  _$jscoverage['/editor.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['832'] = [];
  _$jscoverage['/editor.js'].branchData['832'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['833'] = [];
  _$jscoverage['/editor.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['856'] = [];
  _$jscoverage['/editor.js'].branchData['856'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['858'] = [];
  _$jscoverage['/editor.js'].branchData['858'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['874'] = [];
  _$jscoverage['/editor.js'].branchData['874'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['885'] = [];
  _$jscoverage['/editor.js'].branchData['885'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['886'] = [];
  _$jscoverage['/editor.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['886'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['908'] = [];
  _$jscoverage['/editor.js'].branchData['908'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['919'] = [];
  _$jscoverage['/editor.js'].branchData['919'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['936'] = [];
  _$jscoverage['/editor.js'].branchData['936'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['939'] = [];
  _$jscoverage['/editor.js'].branchData['939'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['946'] = [];
  _$jscoverage['/editor.js'].branchData['946'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['953'] = [];
  _$jscoverage['/editor.js'].branchData['953'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['953'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['966'] = [];
  _$jscoverage['/editor.js'].branchData['966'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['982'] = [];
  _$jscoverage['/editor.js'].branchData['982'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['984'] = [];
  _$jscoverage['/editor.js'].branchData['984'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['991'] = [];
  _$jscoverage['/editor.js'].branchData['991'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['996'] = [];
  _$jscoverage['/editor.js'].branchData['996'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1002'] = [];
  _$jscoverage['/editor.js'].branchData['1002'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1011'] = [];
  _$jscoverage['/editor.js'].branchData['1011'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1014'] = [];
  _$jscoverage['/editor.js'].branchData['1014'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1032'] = [];
  _$jscoverage['/editor.js'].branchData['1032'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1035'] = [];
  _$jscoverage['/editor.js'].branchData['1035'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1045'] = [];
  _$jscoverage['/editor.js'].branchData['1045'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1048'] = [];
  _$jscoverage['/editor.js'].branchData['1048'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1054'] = [];
  _$jscoverage['/editor.js'].branchData['1054'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1057'] = [];
  _$jscoverage['/editor.js'].branchData['1057'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1057'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1074'] = [];
  _$jscoverage['/editor.js'].branchData['1074'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1083'] = [];
  _$jscoverage['/editor.js'].branchData['1083'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1090'] = [];
  _$jscoverage['/editor.js'].branchData['1090'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1135'] = [];
  _$jscoverage['/editor.js'].branchData['1135'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1157'] = [];
  _$jscoverage['/editor.js'].branchData['1157'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1158'] = [];
  _$jscoverage['/editor.js'].branchData['1158'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1166'] = [];
  _$jscoverage['/editor.js'].branchData['1166'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1173'] = [];
  _$jscoverage['/editor.js'].branchData['1173'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1184'] = [];
  _$jscoverage['/editor.js'].branchData['1184'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1184'][1].init(14, 19, '!self.get(\'iframe\')');
function visit1247_1184_1(result) {
  _$jscoverage['/editor.js'].branchData['1184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1173'][1].init(897, 28, 'UA.gecko && !iframe.__loaded');
function visit1246_1173_1(result) {
  _$jscoverage['/editor.js'].branchData['1173'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1166'][1].init(568, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1245_1166_1(result) {
  _$jscoverage['/editor.js'].branchData['1166'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1158'][1].init(266, 9, 'iframeSrc');
function visit1244_1158_1(result) {
  _$jscoverage['/editor.js'].branchData['1158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1157'][1].init(216, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1243_1157_1(result) {
  _$jscoverage['/editor.js'].branchData['1157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1135'][1].init(378, 9, 'IS_IE < 7');
function visit1242_1135_1(result) {
  _$jscoverage['/editor.js'].branchData['1135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1090'][1].init(529, 10, 'data || \'\'');
function visit1241_1090_1(result) {
  _$jscoverage['/editor.js'].branchData['1090'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1083'][1].init(236, 17, 'S.UA.ieMode === 8');
function visit1240_1083_1(result) {
  _$jscoverage['/editor.js'].branchData['1083'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1074'][1].init(215, 21, 'i < customLink.length');
function visit1239_1074_1(result) {
  _$jscoverage['/editor.js'].branchData['1074'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1057'][2].init(74, 28, 'control.nodeName() === \'img\'');
function visit1238_1057_2(result) {
  _$jscoverage['/editor.js'].branchData['1057'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1057'][1].init(74, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1237_1057_1(result) {
  _$jscoverage['/editor.js'].branchData['1057'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1054'][1].init(4904, 8, 'UA.gecko');
function visit1236_1054_1(result) {
  _$jscoverage['/editor.js'].branchData['1054'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1048'][1].init(74, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1235_1048_1(result) {
  _$jscoverage['/editor.js'].branchData['1048'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1045'][1].init(4562, 9, 'UA.webkit');
function visit1234_1045_1(result) {
  _$jscoverage['/editor.js'].branchData['1045'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1035'][1].init(26, 29, 'evt.keyCode in pageUpDownKeys');
function visit1233_1035_1(result) {
  _$jscoverage['/editor.js'].branchData['1035'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1032'][1].init(1361, 31, 'doc.compatMode === \'CSS1Compat\'');
function visit1232_1032_1(result) {
  _$jscoverage['/editor.js'].branchData['1032'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1014'][1].init(139, 7, 'control');
function visit1231_1014_1(result) {
  _$jscoverage['/editor.js'].branchData['1014'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1011'][1].init(107, 24, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1230_1011_1(result) {
  _$jscoverage['/editor.js'].branchData['1011'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1002'][1].init(2673, 5, 'IS_IE');
function visit1229_1002_1(result) {
  _$jscoverage['/editor.js'].branchData['1002'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['996'][1].init(22, 19, '!self.__iframeFocus');
function visit1228_996_1(result) {
  _$jscoverage['/editor.js'].branchData['996'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['991'][1].init(2380, 8, 'UA.gecko');
function visit1227_991_1(result) {
  _$jscoverage['/editor.js'].branchData['991'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['984'][1].init(233, 8, 'UA.opera');
function visit1226_984_1(result) {
  _$jscoverage['/editor.js'].branchData['984'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['982'][1].init(154, 8, 'UA.gecko');
function visit1225_982_1(result) {
  _$jscoverage['/editor.js'].branchData['982'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['966'][1].init(23, 31, '(UA.gecko) && self.__iframeFocus');
function visit1224_966_1(result) {
  _$jscoverage['/editor.js'].branchData['966'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['953'][2].init(1072, 17, 'UA.ie || UA.opera');
function visit1223_953_2(result) {
  _$jscoverage['/editor.js'].branchData['953'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['953'][1].init(1060, 29, 'UA.gecko || UA.ie || UA.opera');
function visit1222_953_1(result) {
  _$jscoverage['/editor.js'].branchData['953'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['946'][1].init(74, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1221_946_1(result) {
  _$jscoverage['/editor.js'].branchData['946'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['939'][1].init(74, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1220_939_1(result) {
  _$jscoverage['/editor.js'].branchData['939'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['936'][1].init(397, 9, 'UA.webkit');
function visit1219_936_1(result) {
  _$jscoverage['/editor.js'].branchData['936'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['919'][1].init(226, 6, '!retry');
function visit1218_919_1(result) {
  _$jscoverage['/editor.js'].branchData['919'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['908'][1].init(150, 9, '!go.retry');
function visit1217_908_1(result) {
  _$jscoverage['/editor.js'].branchData['908'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['886'][2].init(54, 24, 't.nodeName() === \'table\'');
function visit1216_886_2(result) {
  _$jscoverage['/editor.js'].branchData['886'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['886'][1].init(54, 86, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1215_886_1(result) {
  _$jscoverage['/editor.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['885'][1].init(85, 142, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1214_885_1(result) {
  _$jscoverage['/editor.js'].branchData['885'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['874'][1].init(326, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1213_874_1(result) {
  _$jscoverage['/editor.js'].branchData['874'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['858'][1].init(26, 3, 'doc');
function visit1212_858_1(result) {
  _$jscoverage['/editor.js'].branchData['858'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['856'][1].init(381, 5, 'IS_IE');
function visit1211_856_1(result) {
  _$jscoverage['/editor.js'].branchData['856'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['833'][1].init(26, 8, 'UA.gecko');
function visit1210_833_1(result) {
  _$jscoverage['/editor.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['832'][1].init(327, 17, 't === htmlElement');
function visit1209_832_1(result) {
  _$jscoverage['/editor.js'].branchData['832'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['821'][1].init(373, 20, 'UA.gecko || UA.opera');
function visit1208_821_1(result) {
  _$jscoverage['/editor.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['801'][1].init(203, 9, 'UA.webkit');
function visit1207_801_1(result) {
  _$jscoverage['/editor.js'].branchData['801'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['799'][1].init(100, 20, 'UA.gecko || UA.opera');
function visit1206_799_1(result) {
  _$jscoverage['/editor.js'].branchData['799'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['786'][1].init(1316, 5, 'IS_IE');
function visit1205_786_1(result) {
  _$jscoverage['/editor.js'].branchData['786'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['740'][1].init(523, 26, 'cfg.data || textarea.val()');
function visit1204_740_1(result) {
  _$jscoverage['/editor.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['737'][1].init(444, 4, 'name');
function visit1203_737_1(result) {
  _$jscoverage['/editor.js'].branchData['737'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['735'][1].init(27, 20, 'cfg.height || height');
function visit1202_735_1(result) {
  _$jscoverage['/editor.js'].branchData['735'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['734'][1].init(362, 6, 'height');
function visit1201_734_1(result) {
  _$jscoverage['/editor.js'].branchData['734'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['732'][1].init(26, 18, 'cfg.width || width');
function visit1200_732_1(result) {
  _$jscoverage['/editor.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['731'][1].init(284, 5, 'width');
function visit1199_731_1(result) {
  _$jscoverage['/editor.js'].branchData['731'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['727'][1].init(109, 23, 'cfg.textareaAttrs || {}');
function visit1198_727_1(result) {
  _$jscoverage['/editor.js'].branchData['727'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['725'][1].init(16, 9, 'cfg || {}');
function visit1197_725_1(result) {
  _$jscoverage['/editor.js'].branchData['725'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['706'][1].init(22, 15, 'control.destroy');
function visit1196_706_1(result) {
  _$jscoverage['/editor.js'].branchData['706'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['689'][1].init(368, 3, 'doc');
function visit1195_689_1(result) {
  _$jscoverage['/editor.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['684'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1194_684_1(result) {
  _$jscoverage['/editor.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['683'][1].init(168, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1193_683_1(result) {
  _$jscoverage['/editor.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['672'][1].init(79, 20, 'v && self.__docReady');
function visit1192_672_1(result) {
  _$jscoverage['/editor.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['659'][1].init(67, 6, 'iframe');
function visit1191_659_1(result) {
  _$jscoverage['/editor.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['653'][1].init(144, 18, 'v === WYSIWYG_MODE');
function visit1190_653_1(result) {
  _$jscoverage['/editor.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['628'][1].init(1102, 8, 'lastNode');
function visit1189_628_1(result) {
  _$jscoverage['/editor.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['598'][1].init(22, 23, '$sel.type === \'Control\'');
function visit1188_598_1(result) {
  _$jscoverage['/editor.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['597'][1].init(588, 4, '$sel');
function visit1187_597_1(result) {
  _$jscoverage['/editor.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['583'][1].init(140, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1186_583_1(result) {
  _$jscoverage['/editor.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['561'][2].init(2401, 23, 'clone[0].nodeType === 1');
function visit1185_561_2(result) {
  _$jscoverage['/editor.js'].branchData['561'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['561'][1].init(2392, 32, 'clone && clone[0].nodeType === 1');
function visit1184_561_1(result) {
  _$jscoverage['/editor.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['552'][1].init(32, 77, 'xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1183_552_1(result) {
  _$jscoverage['/editor.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['551'][1].init(345, 110, 'nextName && xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1182_551_1(result) {
  _$jscoverage['/editor.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['548'][3].init(171, 42, 'next[0].nodeType === NodeType.ELEMENT_NODE');
function visit1181_548_3(result) {
  _$jscoverage['/editor.js'].branchData['548'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['548'][2].init(171, 82, 'next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1180_548_2(result) {
  _$jscoverage['/editor.js'].branchData['548'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['548'][1].init(163, 90, 'next && next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1179_548_1(result) {
  _$jscoverage['/editor.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['545'][1].init(1615, 7, 'isBlock');
function visit1178_545_1(result) {
  _$jscoverage['/editor.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['538'][1].init(1299, 12, '!lastElement');
function visit1177_538_1(result) {
  _$jscoverage['/editor.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['533'][1].init(328, 12, '!lastElement');
function visit1176_533_1(result) {
  _$jscoverage['/editor.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['529'][2].init(114, 13, '!i && element');
function visit1175_529_2(result) {
  _$jscoverage['/editor.js'].branchData['529'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['529'][1].init(114, 36, '!i && element || element.clone(TRUE)');
function visit1174_529_1(result) {
  _$jscoverage['/editor.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['525'][1].init(846, 6, 'i >= 0');
function visit1173_525_1(result) {
  _$jscoverage['/editor.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['519'][2].init(689, 19, 'ranges.length === 0');
function visit1172_519_2(result) {
  _$jscoverage['/editor.js'].branchData['519'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['519'][1].init(678, 30, '!ranges || ranges.length === 0');
function visit1171_519_1(result) {
  _$jscoverage['/editor.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['511'][1].init(281, 34, 'selection && selection.getRanges()');
function visit1170_511_1(result) {
  _$jscoverage['/editor.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['499'][1].init(50, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1169_499_1(result) {
  _$jscoverage['/editor.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['468'][1].init(172, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1168_468_1(result) {
  _$jscoverage['/editor.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['465'][1].init(76, 33, 'selection && !selection.isInvalid');
function visit1167_465_1(result) {
  _$jscoverage['/editor.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['459'][1].init(48, 29, 'self.__checkSelectionChangeId');
function visit1166_459_1(result) {
  _$jscoverage['/editor.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['438'][1].init(88, 15, 'self.__docReady');
function visit1165_438_1(result) {
  _$jscoverage['/editor.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['424'][1].init(383, 10, 'ind !== -1');
function visit1164_424_1(result) {
  _$jscoverage['/editor.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['418'][1].init(22, 23, 'l.attr(\'href\') === link');
function visit1163_418_1(result) {
  _$jscoverage['/editor.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['377'][1].init(248, 3, 'win');
function visit1162_377_1(result) {
  _$jscoverage['/editor.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['374'][1].init(90, 29, 'self.get(\'customStyle\') || \'\'');
function visit1161_374_1(result) {
  _$jscoverage['/editor.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['342'][1].init(659, 3, 'win');
function visit1160_342_1(result) {
  _$jscoverage['/editor.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['336'][1].init(140, 17, 'win && win.parent');
function visit1159_336_1(result) {
  _$jscoverage['/editor.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['333'][1].init(307, 6, '!UA.ie');
function visit1158_333_1(result) {
  _$jscoverage['/editor.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['327'][1].init(132, 4, '!win');
function visit1157_327_1(result) {
  _$jscoverage['/editor.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['310'][1].init(164, 5, 'range');
function visit1156_310_1(result) {
  _$jscoverage['/editor.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['266'][1].init(796, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1155_266_1(result) {
  _$jscoverage['/editor.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['257'][1].init(512, 6, 'format');
function visit1154_257_1(result) {
  _$jscoverage['/editor.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['251'][2].init(228, 21, 'mode === WYSIWYG_MODE');
function visit1153_251_2(result) {
  _$jscoverage['/editor.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['251'][1].init(228, 42, 'mode === WYSIWYG_MODE && self.isDocReady()');
function visit1152_251_1(result) {
  _$jscoverage['/editor.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['248'][1].init(132, 18, 'mode === undefined');
function visit1151_248_1(result) {
  _$jscoverage['/editor.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['224'][1].init(119, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1150_224_1(result) {
  _$jscoverage['/editor.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['203'][1].init(202, 3, 'cmd');
function visit1149_203_1(result) {
  _$jscoverage['/editor.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['100'][1].init(110, 3, 'sel');
function visit1148_100_1(result) {
  _$jscoverage['/editor.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['95'][1].init(104, 19, 'self.get(\'focused\')');
function visit1147_95_1(result) {
  _$jscoverage['/editor.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['87'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1146_87_1(result) {
  _$jscoverage['/editor.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['86'][1].init(175, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1145_86_1(result) {
  _$jscoverage['/editor.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['57'][2].init(58, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1144_57_2(result) {
  _$jscoverage['/editor.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['57'][1].init(58, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1143_57_1(result) {
  _$jscoverage['/editor.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['56'][2].init(234, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1142_56_2(result) {
  _$jscoverage['/editor.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['56'][1].init(234, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1141_56_1(result) {
  _$jscoverage['/editor.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['27'][1].init(166, 14, 'UA.ieMode < 11');
function visit1140_27_1(result) {
  _$jscoverage['/editor.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor.js'].lineData[8]++;
  var iframeContentTpl = require('editor/iframe-content-tpl');
  _$jscoverage['/editor.js'].lineData[9]++;
  var Editor = require('editor/base');
  _$jscoverage['/editor.js'].lineData[10]++;
  var Utils = require('editor/utils');
  _$jscoverage['/editor.js'].lineData[11]++;
  var focusManager = require('editor/focus-manager');
  _$jscoverage['/editor.js'].lineData[12]++;
  var clipboard = require('editor/clipboard');
  _$jscoverage['/editor.js'].lineData[13]++;
  var enterKey = require('editor/enter-key');
  _$jscoverage['/editor.js'].lineData[14]++;
  var htmlDataProcessor = require('editor/html-data-processor');
  _$jscoverage['/editor.js'].lineData[15]++;
  var selectionFix = require('editor/selection-fix');
  _$jscoverage['/editor.js'].lineData[16]++;
  require('editor/styles');
  _$jscoverage['/editor.js'].lineData[17]++;
  require('editor/dom-iterator');
  _$jscoverage['/editor.js'].lineData[18]++;
  require('editor/z-index-manager');
  _$jscoverage['/editor.js'].lineData[19]++;
  module.exports = Editor;
  _$jscoverage['/editor.js'].lineData[20]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor.js'].lineData[21]++;
  var TRUE = true, FALSE = false, NULL = null, window = S.Env.host, document = window.document, UA = S.UA, IS_IE = visit1140_27_1(UA.ieMode < 11), NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[43]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[48]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[50]++;
  function adjustHeight(self, height) {
    _$jscoverage['/editor.js'].functionData[1]++;
    _$jscoverage['/editor.js'].lineData[51]++;
    var textareaEl = self.get('textarea'), toolBarEl = self.get('toolBarEl'), statusBarEl = self.get('statusBarEl');
    _$jscoverage['/editor.js'].lineData[54]++;
    height = parseInt(height, 10);
    _$jscoverage['/editor.js'].lineData[56]++;
    height -= (visit1141_56_1(visit1142_56_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1143_57_1(visit1144_57_2(statusBarEl && statusBarEl.outerHeight()) || 0));
    _$jscoverage['/editor.js'].lineData[58]++;
    textareaEl.parent().css(HEIGHT, height);
    _$jscoverage['/editor.js'].lineData[59]++;
    textareaEl.css(HEIGHT, height);
  }
  _$jscoverage['/editor.js'].lineData[62]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[65]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[66]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[68]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[73]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[74]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[75]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[76]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[77]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[4]++;
  _$jscoverage['/editor.js'].lineData[81]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[86]++;
  if (visit1145_86_1(self.get('attachForm') && visit1146_87_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[89]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[92]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[5]++;
    _$jscoverage['/editor.js'].lineData[93]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[95]++;
    if (visit1147_95_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[96]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[99]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[100]++;
      if (visit1148_100_1(sel)) {
        _$jscoverage['/editor.js'].lineData[101]++;
        sel.removeAllRanges();
      }
    }
  }
  _$jscoverage['/editor.js'].lineData[106]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[108]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[109]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[112]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[113]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  syncUI: function() {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[118]++;
  adjustHeight(this, this.get('height'));
}, 
  sync: function() {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[125]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[126]++;
  self.get('textarea').val(self.getData());
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[134]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[142]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[151]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[161]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[162]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[164]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[165]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  pluginDialog: d, 
  dialogName: name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[179]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[188]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[198]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[201]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[202]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[203]++;
  if (visit1149_203_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[204]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[206]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[207]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[217]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  setData: function(data) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[221]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[224]++;
  if (visit1150_224_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[226]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[227]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[229]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[230]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[233]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[234]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[245]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[248]++;
  if (visit1151_248_1(mode === undefined)) {
    _$jscoverage['/editor.js'].lineData[249]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[251]++;
  if (visit1152_251_1(visit1153_251_2(mode === WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[252]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[254]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[257]++;
  if (visit1154_257_1(format)) {
    _$jscoverage['/editor.js'].lineData[258]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[260]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[262]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[266]++;
  if (visit1155_266_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[267]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[269]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[279]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[287]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[288]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[297]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  getSelectedHtml: function() {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[306]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[310]++;
  if (visit1156_310_1(range)) {
    _$jscoverage['/editor.js'].lineData[311]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[312]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[313]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[314]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[316]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[324]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[327]++;
  if (visit1157_327_1(!win)) {
    _$jscoverage['/editor.js'].lineData[328]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[330]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[331]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[333]++;
  if (visit1158_333_1(!UA.ie)) {
    _$jscoverage['/editor.js'].lineData[336]++;
    if (visit1159_336_1(win && win.parent)) {
      _$jscoverage['/editor.js'].lineData[337]++;
      win.parent.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[342]++;
  if (visit1160_342_1(win)) {
    _$jscoverage['/editor.js'].lineData[343]++;
    win.focus();
  }
  _$jscoverage['/editor.js'].lineData[346]++;
  try {
    _$jscoverage['/editor.js'].lineData[347]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[351]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[359]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[361]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[362]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[372]++;
  var self = this, win = self.get('window'), customStyle = visit1161_374_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[375]++;
  customStyle += '\n' + cssText;
  _$jscoverage['/editor.js'].lineData[376]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[377]++;
  if (visit1162_377_1(win)) {
    _$jscoverage['/editor.js'].lineData[378]++;
    win.addStyleSheet(cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[388]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[397]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[400]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[401]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[402]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[403]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[404]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[405]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[414]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[417]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[418]++;
  if (visit1163_418_1(l.attr('href') === link)) {
    _$jscoverage['/editor.js'].lineData[419]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[422]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[424]++;
  if (visit1164_424_1(ind !== -1)) {
    _$jscoverage['/editor.js'].lineData[425]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[436]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[437]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[438]++;
  if (visit1165_438_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[439]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[449]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[458]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[459]++;
  if (visit1166_459_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[460]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[463]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[464]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[465]++;
  if (visit1167_465_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[466]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[468]++;
    if (visit1168_468_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[469]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[470]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[486]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[487]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[488]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[497]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[499]++;
  if (visit1169_499_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[500]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[503]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[505]++;
  var clone, elementName = element.nodeName(), xhtmlDtd = Editor.XHTML_DTD, isBlock = xhtmlDtd.$block[elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1170_511_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[519]++;
  if (visit1171_519_1(!ranges || visit1172_519_2(ranges.length === 0))) {
    _$jscoverage['/editor.js'].lineData[520]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[523]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[525]++;
  for (i = ranges.length - 1; visit1173_525_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[526]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[529]++;
    clone = visit1174_529_1(visit1175_529_2(!i && element) || element.clone(TRUE));
    _$jscoverage['/editor.js'].lineData[530]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[533]++;
    if (visit1176_533_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[534]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[538]++;
  if (visit1177_538_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[539]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[542]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[545]++;
  if (visit1178_545_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[546]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[547]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[548]++;
    nextName = visit1179_548_1(next && visit1180_548_2(visit1181_548_3(next[0].nodeType === NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[551]++;
    if (visit1182_551_1(nextName && visit1183_552_1(xhtmlDtd.$block[nextName] && xhtmlDtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[554]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[557]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[558]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[561]++;
  if (visit1184_561_1(clone && visit1185_561_2(clone[0].nodeType === 1))) {
    _$jscoverage['/editor.js'].lineData[562]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[568]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[569]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[579]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[583]++;
  if (visit1186_583_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[584]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[587]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[588]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[591]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[592]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[596]++;
  var $sel = editorDoc.selection;
  _$jscoverage['/editor.js'].lineData[597]++;
  if (visit1187_597_1($sel)) {
    _$jscoverage['/editor.js'].lineData[598]++;
    if (visit1188_598_1($sel.type === 'Control')) {
      _$jscoverage['/editor.js'].lineData[599]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[601]++;
    try {
      _$jscoverage['/editor.js'].lineData[602]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[604]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[611]++;
    var sel = self.get('iframe')[0].contentWindow.getSelection(), range = sel.getRangeAt(0);
    _$jscoverage['/editor.js'].lineData[614]++;
    range.deleteContents();
    _$jscoverage['/editor.js'].lineData[619]++;
    var el = editorDoc.createElement('div');
    _$jscoverage['/editor.js'].lineData[620]++;
    el.innerHTML = data;
    _$jscoverage['/editor.js'].lineData[621]++;
    var frag = editorDoc.createDocumentFragment(), node, lastNode;
    _$jscoverage['/editor.js'].lineData[622]++;
    while ((node = el.firstChild)) {
      _$jscoverage['/editor.js'].lineData[623]++;
      lastNode = frag.appendChild(node);
    }
    _$jscoverage['/editor.js'].lineData[625]++;
    range.insertNode(frag);
    _$jscoverage['/editor.js'].lineData[628]++;
    if (visit1189_628_1(lastNode)) {
      _$jscoverage['/editor.js'].lineData[629]++;
      range = range.cloneRange();
      _$jscoverage['/editor.js'].lineData[630]++;
      range.setStartAfter(lastNode);
      _$jscoverage['/editor.js'].lineData[631]++;
      range.collapse(true);
      _$jscoverage['/editor.js'].lineData[632]++;
      sel.removeAllRanges();
      _$jscoverage['/editor.js'].lineData[633]++;
      sel.addRange(range);
    }
  }
  _$jscoverage['/editor.js'].lineData[638]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[639]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[641]++;
  saveLater.call(self);
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[646]++;
  adjustHeight(this, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[650]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[653]++;
  if (visit1190_653_1(v === WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[654]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[655]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[656]++;
    self.fire('wysiwygMode');
  } else {
    _$jscoverage['/editor.js'].lineData[659]++;
    if (visit1191_659_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[660]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[661]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[663]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[664]++;
    self.fire('sourceMode');
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[670]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[672]++;
  if (visit1192_672_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[673]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[678]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[683]++;
  if (visit1193_683_1(self.get('attachForm') && visit1194_684_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[686]++;
    form.detach('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[689]++;
  if (visit1195_689_1(doc)) {
    _$jscoverage['/editor.js'].lineData[690]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[694]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[696]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[698]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[700]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[702]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[705]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[706]++;
  if (visit1196_706_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[707]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[711]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[712]++;
  self.__controls = {};
}});
  _$jscoverage['/editor.js'].lineData[724]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[725]++;
  cfg = visit1197_725_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[726]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[727]++;
  var textareaAttrs = cfg.textareaAttrs = visit1198_727_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[728]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[729]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[730]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[731]++;
  if (visit1199_731_1(width)) {
    _$jscoverage['/editor.js'].lineData[732]++;
    cfg.width = visit1200_732_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[734]++;
  if (visit1201_734_1(height)) {
    _$jscoverage['/editor.js'].lineData[735]++;
    cfg.height = visit1202_735_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[737]++;
  if (visit1203_737_1(name)) {
    _$jscoverage['/editor.js'].lineData[738]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[740]++;
  cfg.data = visit1204_740_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[741]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[742]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[743]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[744]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[751]++;
  Editor._initIframe = function(id) {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[752]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[758]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[760]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[762]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[764]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[786]++;
  if (visit1205_786_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[788]++;
    body.hideFocus = TRUE;
    _$jscoverage['/editor.js'].lineData[791]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[792]++;
    body.contentEditable = TRUE;
    _$jscoverage['/editor.js'].lineData[793]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[797]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[799]++;
  if (visit1206_799_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[800]++;
    body.contentEditable = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[801]++;
    if (visit1207_801_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[802]++;
      body.parentNode.contentEditable = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[804]++;
      doc.designMode = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[812]++;
  if (visit1208_821_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[823]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[824]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[831]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[832]++;
  if (visit1209_832_1(t === htmlElement)) {
    _$jscoverage['/editor.js'].lineData[833]++;
    if (visit1210_833_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[834]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[841]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[847]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[856]++;
  if (visit1211_856_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[857]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[858]++;
  if (visit1212_858_1(doc)) {
    _$jscoverage['/editor.js'].lineData[859]++;
    body.runtimeStyle.marginBottom = '0px';
    _$jscoverage['/editor.js'].lineData[860]++;
    body.runtimeStyle.marginBottom = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[866]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[867]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[868]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[872]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[874]++;
  if (visit1213_874_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[876]++;
    try {
      _$jscoverage['/editor.js'].lineData[877]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[878]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[883]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[51]++;
  _$jscoverage['/editor.js'].lineData[884]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[885]++;
  if (visit1214_885_1(disableObjectResizing || (visit1215_886_1(visit1216_886_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[888]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[898]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[52]++;
    _$jscoverage['/editor.js'].lineData[899]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[900]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[902]++;
  doc.designMode = 'on';
  _$jscoverage['/editor.js'].lineData[904]++;
  setTimeout(function go() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[905]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[906]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[908]++;
  if (visit1217_908_1(!go.retry)) {
    _$jscoverage['/editor.js'].lineData[909]++;
    go.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[55]++;
  _$jscoverage['/editor.js'].lineData[915]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[916]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[917]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[919]++;
  if (visit1218_919_1(!retry)) {
    _$jscoverage['/editor.js'].lineData[920]++;
    blinkCursor(doc, 1);
  }
});
  }
  _$jscoverage['/editor.js'].lineData[926]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[56]++;
    _$jscoverage['/editor.js'].lineData[927]++;
    var textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[936]++;
    if (visit1219_936_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[937]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[938]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[939]++;
  if (visit1220_939_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[940]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[944]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[945]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[946]++;
  if (visit1221_946_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[947]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[953]++;
    if (visit1222_953_1(UA.gecko || visit1223_953_2(UA.ie || UA.opera))) {
      _$jscoverage['/editor.js'].lineData[954]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[955]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[962]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[963]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[965]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[966]++;
  if (visit1224_966_1((UA.gecko) && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[967]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[970]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[971]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[972]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[976]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[982]++;
  if (visit1225_982_1(UA.gecko)) {
    _$jscoverage['/editor.js'].lineData[983]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[984]++;
    if (visit1226_984_1(UA.opera)) {
      _$jscoverage['/editor.js'].lineData[985]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[988]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[991]++;
    if (visit1227_991_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[995]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[996]++;
  if (visit1228_996_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[997]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1002]++;
    if (visit1229_1002_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[1008]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[1009]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[1011]++;
  if (visit1230_1011_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[1012]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[1014]++;
    if (visit1231_1014_1(control)) {
      _$jscoverage['/editor.js'].lineData[1016]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1019]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[1021]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[1022]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[1023]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1024]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[1032]++;
      if (visit1232_1032_1(doc.compatMode === 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1033]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1034]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1035]++;
  if (visit1233_1035_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1036]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1037]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1045]++;
    if (visit1234_1045_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[1046]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[1047]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1048]++;
  if (visit1235_1048_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1049]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1054]++;
    if (visit1236_1054_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[1055]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[68]++;
  _$jscoverage['/editor.js'].lineData[1056]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1057]++;
  if (visit1237_1057_1(visit1238_1057_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1059]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1065]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1068]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[69]++;
    _$jscoverage['/editor.js'].lineData[1069]++;
    var links = '', i;
    _$jscoverage['/editor.js'].lineData[1071]++;
    var innerCssFile = Utils.debugUrl('theme/iframe.css');
    _$jscoverage['/editor.js'].lineData[1072]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1073]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1074]++;
    for (i = 0; visit1239_1074_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1075]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1079]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1240_1083_1(S.UA.ieMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1241_1090_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require(\'editor\')._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1106]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[70]++;
  _$jscoverage['/editor.js'].lineData[1107]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1110]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[71]++;
    _$jscoverage['/editor.js'].lineData[1111]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1118]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1119]++;
    try {
      _$jscoverage['/editor.js'].lineData[1127]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1132]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1135]++;
  if (visit1242_1135_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1136]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1137]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1140]++;
    run();
    _$jscoverage['/editor.js'].lineData[1141]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[72]++;
      _$jscoverage['/editor.js'].lineData[1142]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1143]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1144]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1145]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1147]++;
      doc.open('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1148]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1149]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1153]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[73]++;
    _$jscoverage['/editor.js'].lineData[1157]++;
    var iframeSrc = visit1243_1157_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1158]++;
    if (visit1244_1158_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1159]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1161]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1166]++;
    if (visit1245_1166_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1167]++;
      iframe.attr('tabindex', UA.webkit ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1169]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1170]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1171]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1173]++;
    if (visit1246_1173_1(UA.gecko && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1174]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[74]++;
  _$jscoverage['/editor.js'].lineData[1175]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1179]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1183]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[75]++;
    _$jscoverage['/editor.js'].lineData[1184]++;
    if (visit1247_1184_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1185]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1187]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1193]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[76]++;
  _$jscoverage['/editor.js'].lineData[1194]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1196]++;
    iframe.remove();
  }
});
