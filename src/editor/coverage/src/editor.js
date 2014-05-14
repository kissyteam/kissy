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
  _$jscoverage['/editor.js'].lineData[22] = 0;
  _$jscoverage['/editor.js'].lineData[44] = 0;
  _$jscoverage['/editor.js'].lineData[49] = 0;
  _$jscoverage['/editor.js'].lineData[51] = 0;
  _$jscoverage['/editor.js'].lineData[52] = 0;
  _$jscoverage['/editor.js'].lineData[55] = 0;
  _$jscoverage['/editor.js'].lineData[57] = 0;
  _$jscoverage['/editor.js'].lineData[59] = 0;
  _$jscoverage['/editor.js'].lineData[60] = 0;
  _$jscoverage['/editor.js'].lineData[63] = 0;
  _$jscoverage['/editor.js'].lineData[65] = 0;
  _$jscoverage['/editor.js'].lineData[66] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[69] = 0;
  _$jscoverage['/editor.js'].lineData[74] = 0;
  _$jscoverage['/editor.js'].lineData[75] = 0;
  _$jscoverage['/editor.js'].lineData[76] = 0;
  _$jscoverage['/editor.js'].lineData[77] = 0;
  _$jscoverage['/editor.js'].lineData[78] = 0;
  _$jscoverage['/editor.js'].lineData[82] = 0;
  _$jscoverage['/editor.js'].lineData[87] = 0;
  _$jscoverage['/editor.js'].lineData[90] = 0;
  _$jscoverage['/editor.js'].lineData[93] = 0;
  _$jscoverage['/editor.js'].lineData[94] = 0;
  _$jscoverage['/editor.js'].lineData[96] = 0;
  _$jscoverage['/editor.js'].lineData[97] = 0;
  _$jscoverage['/editor.js'].lineData[100] = 0;
  _$jscoverage['/editor.js'].lineData[101] = 0;
  _$jscoverage['/editor.js'].lineData[102] = 0;
  _$jscoverage['/editor.js'].lineData[107] = 0;
  _$jscoverage['/editor.js'].lineData[109] = 0;
  _$jscoverage['/editor.js'].lineData[110] = 0;
  _$jscoverage['/editor.js'].lineData[113] = 0;
  _$jscoverage['/editor.js'].lineData[114] = 0;
  _$jscoverage['/editor.js'].lineData[119] = 0;
  _$jscoverage['/editor.js'].lineData[126] = 0;
  _$jscoverage['/editor.js'].lineData[127] = 0;
  _$jscoverage['/editor.js'].lineData[135] = 0;
  _$jscoverage['/editor.js'].lineData[143] = 0;
  _$jscoverage['/editor.js'].lineData[152] = 0;
  _$jscoverage['/editor.js'].lineData[162] = 0;
  _$jscoverage['/editor.js'].lineData[163] = 0;
  _$jscoverage['/editor.js'].lineData[165] = 0;
  _$jscoverage['/editor.js'].lineData[166] = 0;
  _$jscoverage['/editor.js'].lineData[180] = 0;
  _$jscoverage['/editor.js'].lineData[189] = 0;
  _$jscoverage['/editor.js'].lineData[199] = 0;
  _$jscoverage['/editor.js'].lineData[202] = 0;
  _$jscoverage['/editor.js'].lineData[203] = 0;
  _$jscoverage['/editor.js'].lineData[204] = 0;
  _$jscoverage['/editor.js'].lineData[205] = 0;
  _$jscoverage['/editor.js'].lineData[207] = 0;
  _$jscoverage['/editor.js'].lineData[208] = 0;
  _$jscoverage['/editor.js'].lineData[218] = 0;
  _$jscoverage['/editor.js'].lineData[222] = 0;
  _$jscoverage['/editor.js'].lineData[225] = 0;
  _$jscoverage['/editor.js'].lineData[227] = 0;
  _$jscoverage['/editor.js'].lineData[228] = 0;
  _$jscoverage['/editor.js'].lineData[230] = 0;
  _$jscoverage['/editor.js'].lineData[231] = 0;
  _$jscoverage['/editor.js'].lineData[234] = 0;
  _$jscoverage['/editor.js'].lineData[235] = 0;
  _$jscoverage['/editor.js'].lineData[246] = 0;
  _$jscoverage['/editor.js'].lineData[249] = 0;
  _$jscoverage['/editor.js'].lineData[250] = 0;
  _$jscoverage['/editor.js'].lineData[252] = 0;
  _$jscoverage['/editor.js'].lineData[253] = 0;
  _$jscoverage['/editor.js'].lineData[255] = 0;
  _$jscoverage['/editor.js'].lineData[258] = 0;
  _$jscoverage['/editor.js'].lineData[259] = 0;
  _$jscoverage['/editor.js'].lineData[261] = 0;
  _$jscoverage['/editor.js'].lineData[263] = 0;
  _$jscoverage['/editor.js'].lineData[267] = 0;
  _$jscoverage['/editor.js'].lineData[268] = 0;
  _$jscoverage['/editor.js'].lineData[270] = 0;
  _$jscoverage['/editor.js'].lineData[280] = 0;
  _$jscoverage['/editor.js'].lineData[288] = 0;
  _$jscoverage['/editor.js'].lineData[289] = 0;
  _$jscoverage['/editor.js'].lineData[298] = 0;
  _$jscoverage['/editor.js'].lineData[307] = 0;
  _$jscoverage['/editor.js'].lineData[311] = 0;
  _$jscoverage['/editor.js'].lineData[312] = 0;
  _$jscoverage['/editor.js'].lineData[313] = 0;
  _$jscoverage['/editor.js'].lineData[314] = 0;
  _$jscoverage['/editor.js'].lineData[315] = 0;
  _$jscoverage['/editor.js'].lineData[317] = 0;
  _$jscoverage['/editor.js'].lineData[325] = 0;
  _$jscoverage['/editor.js'].lineData[328] = 0;
  _$jscoverage['/editor.js'].lineData[329] = 0;
  _$jscoverage['/editor.js'].lineData[331] = 0;
  _$jscoverage['/editor.js'].lineData[332] = 0;
  _$jscoverage['/editor.js'].lineData[334] = 0;
  _$jscoverage['/editor.js'].lineData[337] = 0;
  _$jscoverage['/editor.js'].lineData[338] = 0;
  _$jscoverage['/editor.js'].lineData[343] = 0;
  _$jscoverage['/editor.js'].lineData[344] = 0;
  _$jscoverage['/editor.js'].lineData[347] = 0;
  _$jscoverage['/editor.js'].lineData[348] = 0;
  _$jscoverage['/editor.js'].lineData[352] = 0;
  _$jscoverage['/editor.js'].lineData[360] = 0;
  _$jscoverage['/editor.js'].lineData[362] = 0;
  _$jscoverage['/editor.js'].lineData[363] = 0;
  _$jscoverage['/editor.js'].lineData[373] = 0;
  _$jscoverage['/editor.js'].lineData[376] = 0;
  _$jscoverage['/editor.js'].lineData[377] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[379] = 0;
  _$jscoverage['/editor.js'].lineData[389] = 0;
  _$jscoverage['/editor.js'].lineData[398] = 0;
  _$jscoverage['/editor.js'].lineData[401] = 0;
  _$jscoverage['/editor.js'].lineData[402] = 0;
  _$jscoverage['/editor.js'].lineData[403] = 0;
  _$jscoverage['/editor.js'].lineData[404] = 0;
  _$jscoverage['/editor.js'].lineData[405] = 0;
  _$jscoverage['/editor.js'].lineData[406] = 0;
  _$jscoverage['/editor.js'].lineData[415] = 0;
  _$jscoverage['/editor.js'].lineData[418] = 0;
  _$jscoverage['/editor.js'].lineData[419] = 0;
  _$jscoverage['/editor.js'].lineData[420] = 0;
  _$jscoverage['/editor.js'].lineData[423] = 0;
  _$jscoverage['/editor.js'].lineData[425] = 0;
  _$jscoverage['/editor.js'].lineData[426] = 0;
  _$jscoverage['/editor.js'].lineData[437] = 0;
  _$jscoverage['/editor.js'].lineData[438] = 0;
  _$jscoverage['/editor.js'].lineData[439] = 0;
  _$jscoverage['/editor.js'].lineData[440] = 0;
  _$jscoverage['/editor.js'].lineData[450] = 0;
  _$jscoverage['/editor.js'].lineData[459] = 0;
  _$jscoverage['/editor.js'].lineData[460] = 0;
  _$jscoverage['/editor.js'].lineData[461] = 0;
  _$jscoverage['/editor.js'].lineData[464] = 0;
  _$jscoverage['/editor.js'].lineData[465] = 0;
  _$jscoverage['/editor.js'].lineData[466] = 0;
  _$jscoverage['/editor.js'].lineData[467] = 0;
  _$jscoverage['/editor.js'].lineData[469] = 0;
  _$jscoverage['/editor.js'].lineData[470] = 0;
  _$jscoverage['/editor.js'].lineData[471] = 0;
  _$jscoverage['/editor.js'].lineData[487] = 0;
  _$jscoverage['/editor.js'].lineData[488] = 0;
  _$jscoverage['/editor.js'].lineData[489] = 0;
  _$jscoverage['/editor.js'].lineData[498] = 0;
  _$jscoverage['/editor.js'].lineData[500] = 0;
  _$jscoverage['/editor.js'].lineData[501] = 0;
  _$jscoverage['/editor.js'].lineData[504] = 0;
  _$jscoverage['/editor.js'].lineData[506] = 0;
  _$jscoverage['/editor.js'].lineData[520] = 0;
  _$jscoverage['/editor.js'].lineData[521] = 0;
  _$jscoverage['/editor.js'].lineData[524] = 0;
  _$jscoverage['/editor.js'].lineData[526] = 0;
  _$jscoverage['/editor.js'].lineData[527] = 0;
  _$jscoverage['/editor.js'].lineData[530] = 0;
  _$jscoverage['/editor.js'].lineData[531] = 0;
  _$jscoverage['/editor.js'].lineData[534] = 0;
  _$jscoverage['/editor.js'].lineData[535] = 0;
  _$jscoverage['/editor.js'].lineData[539] = 0;
  _$jscoverage['/editor.js'].lineData[540] = 0;
  _$jscoverage['/editor.js'].lineData[543] = 0;
  _$jscoverage['/editor.js'].lineData[546] = 0;
  _$jscoverage['/editor.js'].lineData[547] = 0;
  _$jscoverage['/editor.js'].lineData[548] = 0;
  _$jscoverage['/editor.js'].lineData[549] = 0;
  _$jscoverage['/editor.js'].lineData[552] = 0;
  _$jscoverage['/editor.js'].lineData[555] = 0;
  _$jscoverage['/editor.js'].lineData[558] = 0;
  _$jscoverage['/editor.js'].lineData[559] = 0;
  _$jscoverage['/editor.js'].lineData[562] = 0;
  _$jscoverage['/editor.js'].lineData[563] = 0;
  _$jscoverage['/editor.js'].lineData[569] = 0;
  _$jscoverage['/editor.js'].lineData[570] = 0;
  _$jscoverage['/editor.js'].lineData[580] = 0;
  _$jscoverage['/editor.js'].lineData[584] = 0;
  _$jscoverage['/editor.js'].lineData[585] = 0;
  _$jscoverage['/editor.js'].lineData[588] = 0;
  _$jscoverage['/editor.js'].lineData[589] = 0;
  _$jscoverage['/editor.js'].lineData[592] = 0;
  _$jscoverage['/editor.js'].lineData[593] = 0;
  _$jscoverage['/editor.js'].lineData[597] = 0;
  _$jscoverage['/editor.js'].lineData[598] = 0;
  _$jscoverage['/editor.js'].lineData[599] = 0;
  _$jscoverage['/editor.js'].lineData[600] = 0;
  _$jscoverage['/editor.js'].lineData[602] = 0;
  _$jscoverage['/editor.js'].lineData[603] = 0;
  _$jscoverage['/editor.js'].lineData[605] = 0;
  _$jscoverage['/editor.js'].lineData[612] = 0;
  _$jscoverage['/editor.js'].lineData[615] = 0;
  _$jscoverage['/editor.js'].lineData[620] = 0;
  _$jscoverage['/editor.js'].lineData[621] = 0;
  _$jscoverage['/editor.js'].lineData[622] = 0;
  _$jscoverage['/editor.js'].lineData[623] = 0;
  _$jscoverage['/editor.js'].lineData[624] = 0;
  _$jscoverage['/editor.js'].lineData[626] = 0;
  _$jscoverage['/editor.js'].lineData[629] = 0;
  _$jscoverage['/editor.js'].lineData[630] = 0;
  _$jscoverage['/editor.js'].lineData[631] = 0;
  _$jscoverage['/editor.js'].lineData[632] = 0;
  _$jscoverage['/editor.js'].lineData[633] = 0;
  _$jscoverage['/editor.js'].lineData[634] = 0;
  _$jscoverage['/editor.js'].lineData[639] = 0;
  _$jscoverage['/editor.js'].lineData[640] = 0;
  _$jscoverage['/editor.js'].lineData[642] = 0;
  _$jscoverage['/editor.js'].lineData[647] = 0;
  _$jscoverage['/editor.js'].lineData[651] = 0;
  _$jscoverage['/editor.js'].lineData[654] = 0;
  _$jscoverage['/editor.js'].lineData[655] = 0;
  _$jscoverage['/editor.js'].lineData[656] = 0;
  _$jscoverage['/editor.js'].lineData[657] = 0;
  _$jscoverage['/editor.js'].lineData[660] = 0;
  _$jscoverage['/editor.js'].lineData[661] = 0;
  _$jscoverage['/editor.js'].lineData[662] = 0;
  _$jscoverage['/editor.js'].lineData[664] = 0;
  _$jscoverage['/editor.js'].lineData[665] = 0;
  _$jscoverage['/editor.js'].lineData[671] = 0;
  _$jscoverage['/editor.js'].lineData[673] = 0;
  _$jscoverage['/editor.js'].lineData[674] = 0;
  _$jscoverage['/editor.js'].lineData[679] = 0;
  _$jscoverage['/editor.js'].lineData[684] = 0;
  _$jscoverage['/editor.js'].lineData[687] = 0;
  _$jscoverage['/editor.js'].lineData[690] = 0;
  _$jscoverage['/editor.js'].lineData[691] = 0;
  _$jscoverage['/editor.js'].lineData[695] = 0;
  _$jscoverage['/editor.js'].lineData[697] = 0;
  _$jscoverage['/editor.js'].lineData[699] = 0;
  _$jscoverage['/editor.js'].lineData[701] = 0;
  _$jscoverage['/editor.js'].lineData[703] = 0;
  _$jscoverage['/editor.js'].lineData[706] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[708] = 0;
  _$jscoverage['/editor.js'].lineData[712] = 0;
  _$jscoverage['/editor.js'].lineData[713] = 0;
  _$jscoverage['/editor.js'].lineData[725] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[727] = 0;
  _$jscoverage['/editor.js'].lineData[728] = 0;
  _$jscoverage['/editor.js'].lineData[729] = 0;
  _$jscoverage['/editor.js'].lineData[730] = 0;
  _$jscoverage['/editor.js'].lineData[731] = 0;
  _$jscoverage['/editor.js'].lineData[732] = 0;
  _$jscoverage['/editor.js'].lineData[733] = 0;
  _$jscoverage['/editor.js'].lineData[735] = 0;
  _$jscoverage['/editor.js'].lineData[736] = 0;
  _$jscoverage['/editor.js'].lineData[738] = 0;
  _$jscoverage['/editor.js'].lineData[739] = 0;
  _$jscoverage['/editor.js'].lineData[741] = 0;
  _$jscoverage['/editor.js'].lineData[742] = 0;
  _$jscoverage['/editor.js'].lineData[743] = 0;
  _$jscoverage['/editor.js'].lineData[744] = 0;
  _$jscoverage['/editor.js'].lineData[745] = 0;
  _$jscoverage['/editor.js'].lineData[752] = 0;
  _$jscoverage['/editor.js'].lineData[753] = 0;
  _$jscoverage['/editor.js'].lineData[759] = 0;
  _$jscoverage['/editor.js'].lineData[761] = 0;
  _$jscoverage['/editor.js'].lineData[763] = 0;
  _$jscoverage['/editor.js'].lineData[765] = 0;
  _$jscoverage['/editor.js'].lineData[787] = 0;
  _$jscoverage['/editor.js'].lineData[789] = 0;
  _$jscoverage['/editor.js'].lineData[792] = 0;
  _$jscoverage['/editor.js'].lineData[793] = 0;
  _$jscoverage['/editor.js'].lineData[794] = 0;
  _$jscoverage['/editor.js'].lineData[798] = 0;
  _$jscoverage['/editor.js'].lineData[800] = 0;
  _$jscoverage['/editor.js'].lineData[801] = 0;
  _$jscoverage['/editor.js'].lineData[802] = 0;
  _$jscoverage['/editor.js'].lineData[803] = 0;
  _$jscoverage['/editor.js'].lineData[805] = 0;
  _$jscoverage['/editor.js'].lineData[813] = 0;
  _$jscoverage['/editor.js'].lineData[824] = 0;
  _$jscoverage['/editor.js'].lineData[825] = 0;
  _$jscoverage['/editor.js'].lineData[832] = 0;
  _$jscoverage['/editor.js'].lineData[833] = 0;
  _$jscoverage['/editor.js'].lineData[834] = 0;
  _$jscoverage['/editor.js'].lineData[835] = 0;
  _$jscoverage['/editor.js'].lineData[842] = 0;
  _$jscoverage['/editor.js'].lineData[848] = 0;
  _$jscoverage['/editor.js'].lineData[857] = 0;
  _$jscoverage['/editor.js'].lineData[858] = 0;
  _$jscoverage['/editor.js'].lineData[859] = 0;
  _$jscoverage['/editor.js'].lineData[860] = 0;
  _$jscoverage['/editor.js'].lineData[861] = 0;
  _$jscoverage['/editor.js'].lineData[867] = 0;
  _$jscoverage['/editor.js'].lineData[868] = 0;
  _$jscoverage['/editor.js'].lineData[869] = 0;
  _$jscoverage['/editor.js'].lineData[873] = 0;
  _$jscoverage['/editor.js'].lineData[875] = 0;
  _$jscoverage['/editor.js'].lineData[877] = 0;
  _$jscoverage['/editor.js'].lineData[878] = 0;
  _$jscoverage['/editor.js'].lineData[879] = 0;
  _$jscoverage['/editor.js'].lineData[884] = 0;
  _$jscoverage['/editor.js'].lineData[885] = 0;
  _$jscoverage['/editor.js'].lineData[886] = 0;
  _$jscoverage['/editor.js'].lineData[889] = 0;
  _$jscoverage['/editor.js'].lineData[899] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[901] = 0;
  _$jscoverage['/editor.js'].lineData[903] = 0;
  _$jscoverage['/editor.js'].lineData[905] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[907] = 0;
  _$jscoverage['/editor.js'].lineData[909] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[916] = 0;
  _$jscoverage['/editor.js'].lineData[917] = 0;
  _$jscoverage['/editor.js'].lineData[918] = 0;
  _$jscoverage['/editor.js'].lineData[920] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[927] = 0;
  _$jscoverage['/editor.js'].lineData[928] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[938] = 0;
  _$jscoverage['/editor.js'].lineData[939] = 0;
  _$jscoverage['/editor.js'].lineData[940] = 0;
  _$jscoverage['/editor.js'].lineData[941] = 0;
  _$jscoverage['/editor.js'].lineData[945] = 0;
  _$jscoverage['/editor.js'].lineData[946] = 0;
  _$jscoverage['/editor.js'].lineData[947] = 0;
  _$jscoverage['/editor.js'].lineData[948] = 0;
  _$jscoverage['/editor.js'].lineData[954] = 0;
  _$jscoverage['/editor.js'].lineData[955] = 0;
  _$jscoverage['/editor.js'].lineData[956] = 0;
  _$jscoverage['/editor.js'].lineData[963] = 0;
  _$jscoverage['/editor.js'].lineData[964] = 0;
  _$jscoverage['/editor.js'].lineData[966] = 0;
  _$jscoverage['/editor.js'].lineData[967] = 0;
  _$jscoverage['/editor.js'].lineData[968] = 0;
  _$jscoverage['/editor.js'].lineData[971] = 0;
  _$jscoverage['/editor.js'].lineData[972] = 0;
  _$jscoverage['/editor.js'].lineData[973] = 0;
  _$jscoverage['/editor.js'].lineData[977] = 0;
  _$jscoverage['/editor.js'].lineData[983] = 0;
  _$jscoverage['/editor.js'].lineData[984] = 0;
  _$jscoverage['/editor.js'].lineData[987] = 0;
  _$jscoverage['/editor.js'].lineData[990] = 0;
  _$jscoverage['/editor.js'].lineData[994] = 0;
  _$jscoverage['/editor.js'].lineData[995] = 0;
  _$jscoverage['/editor.js'].lineData[996] = 0;
  _$jscoverage['/editor.js'].lineData[1001] = 0;
  _$jscoverage['/editor.js'].lineData[1007] = 0;
  _$jscoverage['/editor.js'].lineData[1008] = 0;
  _$jscoverage['/editor.js'].lineData[1010] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1013] = 0;
  _$jscoverage['/editor.js'].lineData[1015] = 0;
  _$jscoverage['/editor.js'].lineData[1018] = 0;
  _$jscoverage['/editor.js'].lineData[1020] = 0;
  _$jscoverage['/editor.js'].lineData[1021] = 0;
  _$jscoverage['/editor.js'].lineData[1022] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1031] = 0;
  _$jscoverage['/editor.js'].lineData[1032] = 0;
  _$jscoverage['/editor.js'].lineData[1033] = 0;
  _$jscoverage['/editor.js'].lineData[1034] = 0;
  _$jscoverage['/editor.js'].lineData[1035] = 0;
  _$jscoverage['/editor.js'].lineData[1036] = 0;
  _$jscoverage['/editor.js'].lineData[1044] = 0;
  _$jscoverage['/editor.js'].lineData[1045] = 0;
  _$jscoverage['/editor.js'].lineData[1046] = 0;
  _$jscoverage['/editor.js'].lineData[1047] = 0;
  _$jscoverage['/editor.js'].lineData[1048] = 0;
  _$jscoverage['/editor.js'].lineData[1053] = 0;
  _$jscoverage['/editor.js'].lineData[1054] = 0;
  _$jscoverage['/editor.js'].lineData[1055] = 0;
  _$jscoverage['/editor.js'].lineData[1056] = 0;
  _$jscoverage['/editor.js'].lineData[1058] = 0;
  _$jscoverage['/editor.js'].lineData[1064] = 0;
  _$jscoverage['/editor.js'].lineData[1067] = 0;
  _$jscoverage['/editor.js'].lineData[1068] = 0;
  _$jscoverage['/editor.js'].lineData[1070] = 0;
  _$jscoverage['/editor.js'].lineData[1071] = 0;
  _$jscoverage['/editor.js'].lineData[1072] = 0;
  _$jscoverage['/editor.js'].lineData[1073] = 0;
  _$jscoverage['/editor.js'].lineData[1074] = 0;
  _$jscoverage['/editor.js'].lineData[1078] = 0;
  _$jscoverage['/editor.js'].lineData[1105] = 0;
  _$jscoverage['/editor.js'].lineData[1106] = 0;
  _$jscoverage['/editor.js'].lineData[1109] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1117] = 0;
  _$jscoverage['/editor.js'].lineData[1118] = 0;
  _$jscoverage['/editor.js'].lineData[1126] = 0;
  _$jscoverage['/editor.js'].lineData[1131] = 0;
  _$jscoverage['/editor.js'].lineData[1134] = 0;
  _$jscoverage['/editor.js'].lineData[1135] = 0;
  _$jscoverage['/editor.js'].lineData[1136] = 0;
  _$jscoverage['/editor.js'].lineData[1139] = 0;
  _$jscoverage['/editor.js'].lineData[1140] = 0;
  _$jscoverage['/editor.js'].lineData[1141] = 0;
  _$jscoverage['/editor.js'].lineData[1142] = 0;
  _$jscoverage['/editor.js'].lineData[1143] = 0;
  _$jscoverage['/editor.js'].lineData[1144] = 0;
  _$jscoverage['/editor.js'].lineData[1146] = 0;
  _$jscoverage['/editor.js'].lineData[1147] = 0;
  _$jscoverage['/editor.js'].lineData[1148] = 0;
  _$jscoverage['/editor.js'].lineData[1152] = 0;
  _$jscoverage['/editor.js'].lineData[1156] = 0;
  _$jscoverage['/editor.js'].lineData[1157] = 0;
  _$jscoverage['/editor.js'].lineData[1158] = 0;
  _$jscoverage['/editor.js'].lineData[1160] = 0;
  _$jscoverage['/editor.js'].lineData[1165] = 0;
  _$jscoverage['/editor.js'].lineData[1166] = 0;
  _$jscoverage['/editor.js'].lineData[1168] = 0;
  _$jscoverage['/editor.js'].lineData[1169] = 0;
  _$jscoverage['/editor.js'].lineData[1170] = 0;
  _$jscoverage['/editor.js'].lineData[1172] = 0;
  _$jscoverage['/editor.js'].lineData[1173] = 0;
  _$jscoverage['/editor.js'].lineData[1174] = 0;
  _$jscoverage['/editor.js'].lineData[1178] = 0;
  _$jscoverage['/editor.js'].lineData[1182] = 0;
  _$jscoverage['/editor.js'].lineData[1183] = 0;
  _$jscoverage['/editor.js'].lineData[1184] = 0;
  _$jscoverage['/editor.js'].lineData[1186] = 0;
  _$jscoverage['/editor.js'].lineData[1192] = 0;
  _$jscoverage['/editor.js'].lineData[1193] = 0;
  _$jscoverage['/editor.js'].lineData[1195] = 0;
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
  _$jscoverage['/editor.js'].branchData['28'] = [];
  _$jscoverage['/editor.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['57'] = [];
  _$jscoverage['/editor.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['58'] = [];
  _$jscoverage['/editor.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['87'] = [];
  _$jscoverage['/editor.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['88'] = [];
  _$jscoverage['/editor.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['96'] = [];
  _$jscoverage['/editor.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['101'] = [];
  _$jscoverage['/editor.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['204'] = [];
  _$jscoverage['/editor.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['225'] = [];
  _$jscoverage['/editor.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['249'] = [];
  _$jscoverage['/editor.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['252'] = [];
  _$jscoverage['/editor.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['252'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['258'] = [];
  _$jscoverage['/editor.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['267'] = [];
  _$jscoverage['/editor.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['311'] = [];
  _$jscoverage['/editor.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['328'] = [];
  _$jscoverage['/editor.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['334'] = [];
  _$jscoverage['/editor.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['337'] = [];
  _$jscoverage['/editor.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['343'] = [];
  _$jscoverage['/editor.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['375'] = [];
  _$jscoverage['/editor.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['378'] = [];
  _$jscoverage['/editor.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['419'] = [];
  _$jscoverage['/editor.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['425'] = [];
  _$jscoverage['/editor.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['439'] = [];
  _$jscoverage['/editor.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['460'] = [];
  _$jscoverage['/editor.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['466'] = [];
  _$jscoverage['/editor.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['469'] = [];
  _$jscoverage['/editor.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['500'] = [];
  _$jscoverage['/editor.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['512'] = [];
  _$jscoverage['/editor.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['520'] = [];
  _$jscoverage['/editor.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['520'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['526'] = [];
  _$jscoverage['/editor.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['530'] = [];
  _$jscoverage['/editor.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['530'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['534'] = [];
  _$jscoverage['/editor.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['539'] = [];
  _$jscoverage['/editor.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['546'] = [];
  _$jscoverage['/editor.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['549'] = [];
  _$jscoverage['/editor.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['549'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['549'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['552'] = [];
  _$jscoverage['/editor.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['553'] = [];
  _$jscoverage['/editor.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['562'] = [];
  _$jscoverage['/editor.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['562'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['584'] = [];
  _$jscoverage['/editor.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['598'] = [];
  _$jscoverage['/editor.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['599'] = [];
  _$jscoverage['/editor.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['629'] = [];
  _$jscoverage['/editor.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['654'] = [];
  _$jscoverage['/editor.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['660'] = [];
  _$jscoverage['/editor.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['673'] = [];
  _$jscoverage['/editor.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['684'] = [];
  _$jscoverage['/editor.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['685'] = [];
  _$jscoverage['/editor.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['690'] = [];
  _$jscoverage['/editor.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['707'] = [];
  _$jscoverage['/editor.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['726'] = [];
  _$jscoverage['/editor.js'].branchData['726'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['728'] = [];
  _$jscoverage['/editor.js'].branchData['728'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['732'] = [];
  _$jscoverage['/editor.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['733'] = [];
  _$jscoverage['/editor.js'].branchData['733'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['735'] = [];
  _$jscoverage['/editor.js'].branchData['735'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['736'] = [];
  _$jscoverage['/editor.js'].branchData['736'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['738'] = [];
  _$jscoverage['/editor.js'].branchData['738'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['741'] = [];
  _$jscoverage['/editor.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['787'] = [];
  _$jscoverage['/editor.js'].branchData['787'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['800'] = [];
  _$jscoverage['/editor.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['802'] = [];
  _$jscoverage['/editor.js'].branchData['802'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['822'] = [];
  _$jscoverage['/editor.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['833'] = [];
  _$jscoverage['/editor.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['834'] = [];
  _$jscoverage['/editor.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['857'] = [];
  _$jscoverage['/editor.js'].branchData['857'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['859'] = [];
  _$jscoverage['/editor.js'].branchData['859'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['875'] = [];
  _$jscoverage['/editor.js'].branchData['875'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['886'] = [];
  _$jscoverage['/editor.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['887'] = [];
  _$jscoverage['/editor.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['887'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['909'] = [];
  _$jscoverage['/editor.js'].branchData['909'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['920'] = [];
  _$jscoverage['/editor.js'].branchData['920'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['937'] = [];
  _$jscoverage['/editor.js'].branchData['937'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['940'] = [];
  _$jscoverage['/editor.js'].branchData['940'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['947'] = [];
  _$jscoverage['/editor.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['954'] = [];
  _$jscoverage['/editor.js'].branchData['954'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['967'] = [];
  _$jscoverage['/editor.js'].branchData['967'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['983'] = [];
  _$jscoverage['/editor.js'].branchData['983'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['990'] = [];
  _$jscoverage['/editor.js'].branchData['990'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['995'] = [];
  _$jscoverage['/editor.js'].branchData['995'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1001'] = [];
  _$jscoverage['/editor.js'].branchData['1001'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1010'] = [];
  _$jscoverage['/editor.js'].branchData['1010'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1013'] = [];
  _$jscoverage['/editor.js'].branchData['1013'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1031'] = [];
  _$jscoverage['/editor.js'].branchData['1031'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1034'] = [];
  _$jscoverage['/editor.js'].branchData['1034'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1044'] = [];
  _$jscoverage['/editor.js'].branchData['1044'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1047'] = [];
  _$jscoverage['/editor.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1053'] = [];
  _$jscoverage['/editor.js'].branchData['1053'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1056'] = [];
  _$jscoverage['/editor.js'].branchData['1056'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1056'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1073'] = [];
  _$jscoverage['/editor.js'].branchData['1073'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1082'] = [];
  _$jscoverage['/editor.js'].branchData['1082'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1089'] = [];
  _$jscoverage['/editor.js'].branchData['1089'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1134'] = [];
  _$jscoverage['/editor.js'].branchData['1134'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1156'] = [];
  _$jscoverage['/editor.js'].branchData['1156'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1157'] = [];
  _$jscoverage['/editor.js'].branchData['1157'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1165'] = [];
  _$jscoverage['/editor.js'].branchData['1165'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1172'] = [];
  _$jscoverage['/editor.js'].branchData['1172'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1183'] = [];
  _$jscoverage['/editor.js'].branchData['1183'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1183'][1].init(14, 19, '!self.get(\'iframe\')');
function visit1254_1183_1(result) {
  _$jscoverage['/editor.js'].branchData['1183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1172'][1].init(900, 28, 'UA.gecko && !iframe.__loaded');
function visit1253_1172_1(result) {
  _$jscoverage['/editor.js'].branchData['1172'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1165'][1].init(571, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1252_1165_1(result) {
  _$jscoverage['/editor.js'].branchData['1165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1157'][1].init(266, 9, 'iframeSrc');
function visit1251_1157_1(result) {
  _$jscoverage['/editor.js'].branchData['1157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1156'][1].init(216, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1250_1156_1(result) {
  _$jscoverage['/editor.js'].branchData['1156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1134'][1].init(378, 9, 'IS_IE < 7');
function visit1249_1134_1(result) {
  _$jscoverage['/editor.js'].branchData['1134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1089'][1].init(527, 10, 'data || \'\'');
function visit1248_1089_1(result) {
  _$jscoverage['/editor.js'].branchData['1089'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1082'][1].init(236, 15, 'UA.ieMode === 8');
function visit1247_1082_1(result) {
  _$jscoverage['/editor.js'].branchData['1082'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1073'][1].init(215, 21, 'i < customLink.length');
function visit1246_1073_1(result) {
  _$jscoverage['/editor.js'].branchData['1073'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1056'][2].init(74, 28, 'control.nodeName() === \'img\'');
function visit1245_1056_2(result) {
  _$jscoverage['/editor.js'].branchData['1056'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1056'][1].init(74, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1244_1056_1(result) {
  _$jscoverage['/editor.js'].branchData['1056'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1053'][1].init(4830, 8, 'UA.gecko');
function visit1243_1053_1(result) {
  _$jscoverage['/editor.js'].branchData['1053'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1047'][1].init(74, 78, 'util.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1242_1047_1(result) {
  _$jscoverage['/editor.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1044'][1].init(4485, 9, 'UA.webkit');
function visit1241_1044_1(result) {
  _$jscoverage['/editor.js'].branchData['1044'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1034'][1].init(26, 29, 'evt.keyCode in pageUpDownKeys');
function visit1240_1034_1(result) {
  _$jscoverage['/editor.js'].branchData['1034'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1031'][1].init(1361, 31, 'doc.compatMode === \'CSS1Compat\'');
function visit1239_1031_1(result) {
  _$jscoverage['/editor.js'].branchData['1031'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1013'][1].init(139, 7, 'control');
function visit1238_1013_1(result) {
  _$jscoverage['/editor.js'].branchData['1013'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1010'][1].init(107, 24, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1237_1010_1(result) {
  _$jscoverage['/editor.js'].branchData['1010'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1001'][1].init(2596, 5, 'IS_IE');
function visit1236_1001_1(result) {
  _$jscoverage['/editor.js'].branchData['1001'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['995'][1].init(22, 19, '!self.__iframeFocus');
function visit1235_995_1(result) {
  _$jscoverage['/editor.js'].branchData['995'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['990'][1].init(2303, 8, 'UA.gecko');
function visit1234_990_1(result) {
  _$jscoverage['/editor.js'].branchData['990'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['983'][1].init(154, 8, 'UA.gecko');
function visit1233_983_1(result) {
  _$jscoverage['/editor.js'].branchData['983'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['967'][1].init(23, 31, '(UA.gecko) && self.__iframeFocus');
function visit1232_967_1(result) {
  _$jscoverage['/editor.js'].branchData['967'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['954'][1].init(1066, 17, 'UA.gecko || UA.ie');
function visit1231_954_1(result) {
  _$jscoverage['/editor.js'].branchData['954'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['947'][1].init(74, 55, 'util.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1230_947_1(result) {
  _$jscoverage['/editor.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['940'][1].init(74, 53, 'util.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1229_940_1(result) {
  _$jscoverage['/editor.js'].branchData['940'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['937'][1].init(397, 9, 'UA.webkit');
function visit1228_937_1(result) {
  _$jscoverage['/editor.js'].branchData['937'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['920'][1].init(226, 6, '!retry');
function visit1227_920_1(result) {
  _$jscoverage['/editor.js'].branchData['920'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['909'][1].init(150, 9, '!go.retry');
function visit1226_909_1(result) {
  _$jscoverage['/editor.js'].branchData['909'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['887'][2].init(54, 24, 't.nodeName() === \'table\'');
function visit1225_887_2(result) {
  _$jscoverage['/editor.js'].branchData['887'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['887'][1].init(54, 86, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1224_887_1(result) {
  _$jscoverage['/editor.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['886'][1].init(85, 142, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1223_886_1(result) {
  _$jscoverage['/editor.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['875'][1].init(326, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1222_875_1(result) {
  _$jscoverage['/editor.js'].branchData['875'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['859'][1].init(26, 3, 'doc');
function visit1221_859_1(result) {
  _$jscoverage['/editor.js'].branchData['859'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['857'][1].init(381, 5, 'IS_IE');
function visit1220_857_1(result) {
  _$jscoverage['/editor.js'].branchData['857'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['834'][1].init(26, 8, 'UA.gecko');
function visit1219_834_1(result) {
  _$jscoverage['/editor.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['833'][1].init(327, 17, 't === htmlElement');
function visit1218_833_1(result) {
  _$jscoverage['/editor.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['822'][1].init(373, 8, 'UA.gecko');
function visit1217_822_1(result) {
  _$jscoverage['/editor.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['802'][1].init(191, 9, 'UA.webkit');
function visit1216_802_1(result) {
  _$jscoverage['/editor.js'].branchData['802'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['800'][1].init(100, 8, 'UA.gecko');
function visit1215_800_1(result) {
  _$jscoverage['/editor.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['787'][1].init(1316, 5, 'IS_IE');
function visit1214_787_1(result) {
  _$jscoverage['/editor.js'].branchData['787'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['741'][1].init(523, 26, 'cfg.data || textarea.val()');
function visit1213_741_1(result) {
  _$jscoverage['/editor.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['738'][1].init(444, 4, 'name');
function visit1212_738_1(result) {
  _$jscoverage['/editor.js'].branchData['738'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['736'][1].init(27, 20, 'cfg.height || height');
function visit1211_736_1(result) {
  _$jscoverage['/editor.js'].branchData['736'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['735'][1].init(362, 6, 'height');
function visit1210_735_1(result) {
  _$jscoverage['/editor.js'].branchData['735'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['733'][1].init(26, 18, 'cfg.width || width');
function visit1209_733_1(result) {
  _$jscoverage['/editor.js'].branchData['733'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['732'][1].init(284, 5, 'width');
function visit1208_732_1(result) {
  _$jscoverage['/editor.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['728'][1].init(109, 23, 'cfg.textareaAttrs || {}');
function visit1207_728_1(result) {
  _$jscoverage['/editor.js'].branchData['728'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['726'][1].init(16, 9, 'cfg || {}');
function visit1206_726_1(result) {
  _$jscoverage['/editor.js'].branchData['726'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['707'][1].init(22, 15, 'control.destroy');
function visit1205_707_1(result) {
  _$jscoverage['/editor.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['690'][1].init(368, 3, 'doc');
function visit1204_690_1(result) {
  _$jscoverage['/editor.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['685'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1203_685_1(result) {
  _$jscoverage['/editor.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['684'][1].init(168, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1202_684_1(result) {
  _$jscoverage['/editor.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['673'][1].init(79, 20, 'v && self.__docReady');
function visit1201_673_1(result) {
  _$jscoverage['/editor.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['660'][1].init(67, 6, 'iframe');
function visit1200_660_1(result) {
  _$jscoverage['/editor.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['654'][1].init(144, 18, 'v === WYSIWYG_MODE');
function visit1199_654_1(result) {
  _$jscoverage['/editor.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['629'][1].init(1102, 8, 'lastNode');
function visit1198_629_1(result) {
  _$jscoverage['/editor.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['599'][1].init(22, 23, '$sel.type === \'Control\'');
function visit1197_599_1(result) {
  _$jscoverage['/editor.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['598'][1].init(588, 4, '$sel');
function visit1196_598_1(result) {
  _$jscoverage['/editor.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['584'][1].init(140, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1195_584_1(result) {
  _$jscoverage['/editor.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['562'][2].init(2401, 23, 'clone[0].nodeType === 1');
function visit1194_562_2(result) {
  _$jscoverage['/editor.js'].branchData['562'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['562'][1].init(2392, 32, 'clone && clone[0].nodeType === 1');
function visit1193_562_1(result) {
  _$jscoverage['/editor.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['553'][1].init(32, 77, 'xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1192_553_1(result) {
  _$jscoverage['/editor.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['552'][1].init(345, 110, 'nextName && xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1191_552_1(result) {
  _$jscoverage['/editor.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['549'][3].init(171, 42, 'next[0].nodeType === NodeType.ELEMENT_NODE');
function visit1190_549_3(result) {
  _$jscoverage['/editor.js'].branchData['549'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['549'][2].init(171, 82, 'next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1189_549_2(result) {
  _$jscoverage['/editor.js'].branchData['549'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['549'][1].init(163, 90, 'next && next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1188_549_1(result) {
  _$jscoverage['/editor.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['546'][1].init(1615, 7, 'isBlock');
function visit1187_546_1(result) {
  _$jscoverage['/editor.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['539'][1].init(1299, 12, '!lastElement');
function visit1186_539_1(result) {
  _$jscoverage['/editor.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['534'][1].init(328, 12, '!lastElement');
function visit1185_534_1(result) {
  _$jscoverage['/editor.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['530'][2].init(114, 13, '!i && element');
function visit1184_530_2(result) {
  _$jscoverage['/editor.js'].branchData['530'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['530'][1].init(114, 36, '!i && element || element.clone(TRUE)');
function visit1183_530_1(result) {
  _$jscoverage['/editor.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['526'][1].init(846, 6, 'i >= 0');
function visit1182_526_1(result) {
  _$jscoverage['/editor.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['520'][2].init(689, 19, 'ranges.length === 0');
function visit1181_520_2(result) {
  _$jscoverage['/editor.js'].branchData['520'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['520'][1].init(678, 30, '!ranges || ranges.length === 0');
function visit1180_520_1(result) {
  _$jscoverage['/editor.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['512'][1].init(281, 34, 'selection && selection.getRanges()');
function visit1179_512_1(result) {
  _$jscoverage['/editor.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['500'][1].init(50, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1178_500_1(result) {
  _$jscoverage['/editor.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['469'][1].init(172, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1177_469_1(result) {
  _$jscoverage['/editor.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['466'][1].init(76, 33, 'selection && !selection.isInvalid');
function visit1176_466_1(result) {
  _$jscoverage['/editor.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['460'][1].init(48, 29, 'self.__checkSelectionChangeId');
function visit1175_460_1(result) {
  _$jscoverage['/editor.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['439'][1].init(88, 15, 'self.__docReady');
function visit1174_439_1(result) {
  _$jscoverage['/editor.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['425'][1].init(386, 10, 'ind !== -1');
function visit1173_425_1(result) {
  _$jscoverage['/editor.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['419'][1].init(22, 23, 'l.attr(\'href\') === link');
function visit1172_419_1(result) {
  _$jscoverage['/editor.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['378'][1].init(248, 3, 'win');
function visit1171_378_1(result) {
  _$jscoverage['/editor.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['375'][1].init(90, 29, 'self.get(\'customStyle\') || \'\'');
function visit1170_375_1(result) {
  _$jscoverage['/editor.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['343'][1].init(659, 3, 'win');
function visit1169_343_1(result) {
  _$jscoverage['/editor.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['337'][1].init(140, 17, 'win && win.parent');
function visit1168_337_1(result) {
  _$jscoverage['/editor.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['334'][1].init(307, 6, '!UA.ie');
function visit1167_334_1(result) {
  _$jscoverage['/editor.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['328'][1].init(132, 4, '!win');
function visit1166_328_1(result) {
  _$jscoverage['/editor.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['311'][1].init(164, 5, 'range');
function visit1165_311_1(result) {
  _$jscoverage['/editor.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['267'][1].init(799, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1164_267_1(result) {
  _$jscoverage['/editor.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['258'][1].init(512, 6, 'format');
function visit1163_258_1(result) {
  _$jscoverage['/editor.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['252'][2].init(228, 21, 'mode === WYSIWYG_MODE');
function visit1162_252_2(result) {
  _$jscoverage['/editor.js'].branchData['252'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['252'][1].init(228, 42, 'mode === WYSIWYG_MODE && self.isDocReady()');
function visit1161_252_1(result) {
  _$jscoverage['/editor.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['249'][1].init(132, 18, 'mode === undefined');
function visit1160_249_1(result) {
  _$jscoverage['/editor.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['225'][1].init(119, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1159_225_1(result) {
  _$jscoverage['/editor.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['204'][1].init(205, 3, 'cmd');
function visit1158_204_1(result) {
  _$jscoverage['/editor.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['101'][1].init(110, 3, 'sel');
function visit1157_101_1(result) {
  _$jscoverage['/editor.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['96'][1].init(104, 19, 'self.get(\'focused\')');
function visit1156_96_1(result) {
  _$jscoverage['/editor.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['88'][1].init(43, 61, '(form = textarea[0].form) && (form = $(form))');
function visit1155_88_1(result) {
  _$jscoverage['/editor.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['87'][1].init(175, 105, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1154_87_1(result) {
  _$jscoverage['/editor.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['58'][2].init(58, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1153_58_2(result) {
  _$jscoverage['/editor.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['58'][1].init(58, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1152_58_1(result) {
  _$jscoverage['/editor.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['57'][2].init(234, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1151_57_2(result) {
  _$jscoverage['/editor.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['57'][1].init(234, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1150_57_1(result) {
  _$jscoverage['/editor.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['28'][1].init(175, 14, 'UA.ieMode < 11');
function visit1149_28_1(result) {
  _$jscoverage['/editor.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/editor.js'].lineData[8]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/editor.js'].lineData[10]++;
  var iframeContentTpl = require('editor/iframe-content-tpl');
  _$jscoverage['/editor.js'].lineData[11]++;
  var Editor = require('editor/base');
  _$jscoverage['/editor.js'].lineData[12]++;
  var Utils = require('editor/utils');
  _$jscoverage['/editor.js'].lineData[13]++;
  var focusManager = require('editor/focus-manager');
  _$jscoverage['/editor.js'].lineData[14]++;
  var clipboard = require('editor/clipboard');
  _$jscoverage['/editor.js'].lineData[15]++;
  var enterKey = require('editor/enter-key');
  _$jscoverage['/editor.js'].lineData[16]++;
  var htmlDataProcessor = require('editor/html-data-processor');
  _$jscoverage['/editor.js'].lineData[17]++;
  var selectionFix = require('editor/selection-fix');
  _$jscoverage['/editor.js'].lineData[18]++;
  require('editor/styles');
  _$jscoverage['/editor.js'].lineData[19]++;
  require('editor/dom-iterator');
  _$jscoverage['/editor.js'].lineData[20]++;
  require('editor/z-index-manager');
  _$jscoverage['/editor.js'].lineData[21]++;
  module.exports = Editor;
  _$jscoverage['/editor.js'].lineData[22]++;
  var TRUE = true, FALSE = false, NULL = null, window = S.Env.host, document = window.document, UA = require('ua'), IS_IE = visit1149_28_1(UA.ieMode < 11), NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[44]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[49]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[51]++;
  function adjustHeight(self, height) {
    _$jscoverage['/editor.js'].functionData[1]++;
    _$jscoverage['/editor.js'].lineData[52]++;
    var textareaEl = self.get('textarea'), toolBarEl = self.get('toolBarEl'), statusBarEl = self.get('statusBarEl');
    _$jscoverage['/editor.js'].lineData[55]++;
    height = parseInt(height, 10);
    _$jscoverage['/editor.js'].lineData[57]++;
    height -= (visit1150_57_1(visit1151_57_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1152_58_1(visit1153_58_2(statusBarEl && statusBarEl.outerHeight()) || 0));
    _$jscoverage['/editor.js'].lineData[59]++;
    textareaEl.parent().css(HEIGHT, height);
    _$jscoverage['/editor.js'].lineData[60]++;
    textareaEl.css(HEIGHT, height);
  }
  _$jscoverage['/editor.js'].lineData[63]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[66]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[67]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[69]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[75]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[76]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[77]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[78]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[4]++;
  _$jscoverage['/editor.js'].lineData[82]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[87]++;
  if (visit1154_87_1(self.get('attachForm') && visit1155_88_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[90]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[93]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[5]++;
    _$jscoverage['/editor.js'].lineData[94]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[96]++;
    if (visit1156_96_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[97]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[100]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[101]++;
      if (visit1157_101_1(sel)) {
        _$jscoverage['/editor.js'].lineData[102]++;
        sel.removeAllRanges();
      }
    }
  }
  _$jscoverage['/editor.js'].lineData[107]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[109]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[110]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[113]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[114]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  syncUI: function() {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[119]++;
  adjustHeight(this, this.get('height'));
}, 
  sync: function() {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[126]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[127]++;
  self.get('textarea').val(self.getData());
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[135]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[143]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[152]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[162]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[163]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[165]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[166]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  pluginDialog: d, 
  dialogName: name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[180]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[189]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[199]++;
  var self = this, cmd = self.__commands[name], args = util.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[202]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[203]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[204]++;
  if (visit1158_204_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[205]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[207]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[208]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[218]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  setData: function(data) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[222]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[225]++;
  if (visit1159_225_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[227]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[228]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[230]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[231]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[234]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[235]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[246]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[249]++;
  if (visit1160_249_1(mode === undefined)) {
    _$jscoverage['/editor.js'].lineData[250]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[252]++;
  if (visit1161_252_1(visit1162_252_2(mode === WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[253]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[255]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[258]++;
  if (visit1163_258_1(format)) {
    _$jscoverage['/editor.js'].lineData[259]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[261]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[263]++;
  html = util.trim(html);
  _$jscoverage['/editor.js'].lineData[267]++;
  if (visit1164_267_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[268]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[270]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[280]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[288]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[289]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[298]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  getSelectedHtml: function() {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[307]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[311]++;
  if (visit1165_311_1(range)) {
    _$jscoverage['/editor.js'].lineData[312]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[313]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[314]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[315]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[317]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[325]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[328]++;
  if (visit1166_328_1(!win)) {
    _$jscoverage['/editor.js'].lineData[329]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[331]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[332]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[334]++;
  if (visit1167_334_1(!UA.ie)) {
    _$jscoverage['/editor.js'].lineData[337]++;
    if (visit1168_337_1(win && win.parent)) {
      _$jscoverage['/editor.js'].lineData[338]++;
      win.parent.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[343]++;
  if (visit1169_343_1(win)) {
    _$jscoverage['/editor.js'].lineData[344]++;
    win.focus();
  }
  _$jscoverage['/editor.js'].lineData[347]++;
  try {
    _$jscoverage['/editor.js'].lineData[348]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[352]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[360]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[362]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[363]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[373]++;
  var self = this, win = self.get('window'), customStyle = visit1170_375_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[376]++;
  customStyle += '\n' + cssText;
  _$jscoverage['/editor.js'].lineData[377]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[378]++;
  if (visit1171_378_1(win)) {
    _$jscoverage['/editor.js'].lineData[379]++;
    win.addStyleSheet(cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[389]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[398]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[401]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[402]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[403]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[404]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[405]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[406]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[415]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[418]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[419]++;
  if (visit1172_419_1(l.attr('href') === link)) {
    _$jscoverage['/editor.js'].lineData[420]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[423]++;
  var cls = self.get('customLink'), ind = util.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[425]++;
  if (visit1173_425_1(ind !== -1)) {
    _$jscoverage['/editor.js'].lineData[426]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[437]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[438]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[439]++;
  if (visit1174_439_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[440]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[450]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[459]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[460]++;
  if (visit1175_460_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[461]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[464]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[465]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[466]++;
  if (visit1176_466_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[467]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[469]++;
    if (visit1177_469_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[470]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[471]++;
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
  _$jscoverage['/editor.js'].lineData[487]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[488]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[489]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[498]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[500]++;
  if (visit1178_500_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[501]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[504]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[506]++;
  var clone, elementName = element.nodeName(), xhtmlDtd = Editor.XHTML_DTD, isBlock = xhtmlDtd.$block[elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1179_512_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[520]++;
  if (visit1180_520_1(!ranges || visit1181_520_2(ranges.length === 0))) {
    _$jscoverage['/editor.js'].lineData[521]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[524]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[526]++;
  for (i = ranges.length - 1; visit1182_526_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[527]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[530]++;
    clone = visit1183_530_1(visit1184_530_2(!i && element) || element.clone(TRUE));
    _$jscoverage['/editor.js'].lineData[531]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[534]++;
    if (visit1185_534_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[535]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[539]++;
  if (visit1186_539_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[540]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[543]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[546]++;
  if (visit1187_546_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[547]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[548]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[549]++;
    nextName = visit1188_549_1(next && visit1189_549_2(visit1190_549_3(next[0].nodeType === NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[552]++;
    if (visit1191_552_1(nextName && visit1192_553_1(xhtmlDtd.$block[nextName] && xhtmlDtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[555]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[558]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[559]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[562]++;
  if (visit1193_562_1(clone && visit1194_562_2(clone[0].nodeType === 1))) {
    _$jscoverage['/editor.js'].lineData[563]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[569]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[570]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[580]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[584]++;
  if (visit1195_584_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[585]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[588]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[589]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[592]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[593]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[597]++;
  var $sel = editorDoc.selection;
  _$jscoverage['/editor.js'].lineData[598]++;
  if (visit1196_598_1($sel)) {
    _$jscoverage['/editor.js'].lineData[599]++;
    if (visit1197_599_1($sel.type === 'Control')) {
      _$jscoverage['/editor.js'].lineData[600]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[602]++;
    try {
      _$jscoverage['/editor.js'].lineData[603]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[605]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[612]++;
    var sel = self.get('iframe')[0].contentWindow.getSelection(), range = sel.getRangeAt(0);
    _$jscoverage['/editor.js'].lineData[615]++;
    range.deleteContents();
    _$jscoverage['/editor.js'].lineData[620]++;
    var el = editorDoc.createElement('div');
    _$jscoverage['/editor.js'].lineData[621]++;
    el.innerHTML = data;
    _$jscoverage['/editor.js'].lineData[622]++;
    var frag = editorDoc.createDocumentFragment(), node, lastNode;
    _$jscoverage['/editor.js'].lineData[623]++;
    while ((node = el.firstChild)) {
      _$jscoverage['/editor.js'].lineData[624]++;
      lastNode = frag.appendChild(node);
    }
    _$jscoverage['/editor.js'].lineData[626]++;
    range.insertNode(frag);
    _$jscoverage['/editor.js'].lineData[629]++;
    if (visit1198_629_1(lastNode)) {
      _$jscoverage['/editor.js'].lineData[630]++;
      range = range.cloneRange();
      _$jscoverage['/editor.js'].lineData[631]++;
      range.setStartAfter(lastNode);
      _$jscoverage['/editor.js'].lineData[632]++;
      range.collapse(true);
      _$jscoverage['/editor.js'].lineData[633]++;
      sel.removeAllRanges();
      _$jscoverage['/editor.js'].lineData[634]++;
      sel.addRange(range);
    }
  }
  _$jscoverage['/editor.js'].lineData[639]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[640]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[642]++;
  saveLater.call(self);
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[647]++;
  adjustHeight(this, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[651]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[654]++;
  if (visit1199_654_1(v === WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[655]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[656]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[657]++;
    self.fire('wysiwygMode');
  } else {
    _$jscoverage['/editor.js'].lineData[660]++;
    if (visit1200_660_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[661]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[662]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[664]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[665]++;
    self.fire('sourceMode');
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[671]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[673]++;
  if (visit1201_673_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[674]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[679]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[684]++;
  if (visit1202_684_1(self.get('attachForm') && visit1203_685_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[687]++;
    form.detach('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[690]++;
  if (visit1204_690_1(doc)) {
    _$jscoverage['/editor.js'].lineData[691]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[695]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[697]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[699]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[701]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[703]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[706]++;
  util.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[707]++;
  if (visit1205_707_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[708]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[712]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[713]++;
  self.__controls = {};
}});
  _$jscoverage['/editor.js'].lineData[725]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[726]++;
  cfg = visit1206_726_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[727]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[728]++;
  var textareaAttrs = cfg.textareaAttrs = visit1207_728_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[729]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[730]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[731]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[732]++;
  if (visit1208_732_1(width)) {
    _$jscoverage['/editor.js'].lineData[733]++;
    cfg.width = visit1209_733_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[735]++;
  if (visit1210_735_1(height)) {
    _$jscoverage['/editor.js'].lineData[736]++;
    cfg.height = visit1211_736_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[738]++;
  if (visit1212_738_1(name)) {
    _$jscoverage['/editor.js'].lineData[739]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[741]++;
  cfg.data = visit1213_741_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[742]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[743]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[744]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[745]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[752]++;
  Editor._initIframe = function(id) {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[753]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[759]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[761]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[763]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[765]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[787]++;
  if (visit1214_787_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[789]++;
    body.hideFocus = TRUE;
    _$jscoverage['/editor.js'].lineData[792]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[793]++;
    body.contentEditable = TRUE;
    _$jscoverage['/editor.js'].lineData[794]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[798]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[800]++;
  if (visit1215_800_1(UA.gecko)) {
    _$jscoverage['/editor.js'].lineData[801]++;
    body.contentEditable = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[802]++;
    if (visit1216_802_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[803]++;
      body.parentNode.contentEditable = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[805]++;
      doc.designMode = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[813]++;
  if (visit1217_822_1(UA.gecko)) {
    _$jscoverage['/editor.js'].lineData[824]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[825]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[832]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[833]++;
  if (visit1218_833_1(t === htmlElement)) {
    _$jscoverage['/editor.js'].lineData[834]++;
    if (visit1219_834_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[835]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[842]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[848]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[857]++;
  if (visit1220_857_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[858]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[859]++;
  if (visit1221_859_1(doc)) {
    _$jscoverage['/editor.js'].lineData[860]++;
    body.runtimeStyle.marginBottom = '0px';
    _$jscoverage['/editor.js'].lineData[861]++;
    body.runtimeStyle.marginBottom = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[867]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[868]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[869]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[873]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[875]++;
  if (visit1222_875_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[877]++;
    try {
      _$jscoverage['/editor.js'].lineData[878]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[879]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[884]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[51]++;
  _$jscoverage['/editor.js'].lineData[885]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[886]++;
  if (visit1223_886_1(disableObjectResizing || (visit1224_887_1(visit1225_887_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[889]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[899]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[52]++;
    _$jscoverage['/editor.js'].lineData[900]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[901]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[903]++;
  doc.designMode = 'on';
  _$jscoverage['/editor.js'].lineData[905]++;
  setTimeout(function go() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[906]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[907]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[909]++;
  if (visit1226_909_1(!go.retry)) {
    _$jscoverage['/editor.js'].lineData[910]++;
    go.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[55]++;
  _$jscoverage['/editor.js'].lineData[916]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[917]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[918]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[920]++;
  if (visit1227_920_1(!retry)) {
    _$jscoverage['/editor.js'].lineData[921]++;
    blinkCursor(doc, 1);
  }
});
  }
  _$jscoverage['/editor.js'].lineData[927]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[56]++;
    _$jscoverage['/editor.js'].lineData[928]++;
    var textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[937]++;
    if (visit1228_937_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[938]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[939]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[940]++;
  if (visit1229_940_1(util.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[941]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[945]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[946]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[947]++;
  if (visit1230_947_1(util.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[948]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[954]++;
    if (visit1231_954_1(UA.gecko || UA.ie)) {
      _$jscoverage['/editor.js'].lineData[955]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[956]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[963]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[964]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[966]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[967]++;
  if (visit1232_967_1((UA.gecko) && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[968]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[971]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[972]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[973]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[977]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[983]++;
  if (visit1233_983_1(UA.gecko)) {
    _$jscoverage['/editor.js'].lineData[984]++;
    blinkCursor(doc, FALSE);
  }
  _$jscoverage['/editor.js'].lineData[987]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[990]++;
    if (visit1234_990_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[994]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[995]++;
  if (visit1235_995_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[996]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1001]++;
    if (visit1236_1001_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[1007]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[1008]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[1010]++;
  if (visit1237_1010_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[1011]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[1013]++;
    if (visit1238_1013_1(control)) {
      _$jscoverage['/editor.js'].lineData[1015]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1018]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[1020]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[1021]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[1022]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1023]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[1031]++;
      if (visit1239_1031_1(doc.compatMode === 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1032]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1033]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1034]++;
  if (visit1240_1034_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1035]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1036]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1044]++;
    if (visit1241_1044_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[1045]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[1046]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1047]++;
  if (visit1242_1047_1(util.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1048]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1053]++;
    if (visit1243_1053_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[1054]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[68]++;
  _$jscoverage['/editor.js'].lineData[1055]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1056]++;
  if (visit1244_1056_1(visit1245_1056_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1058]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1064]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1067]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[69]++;
    _$jscoverage['/editor.js'].lineData[1068]++;
    var links = '', i;
    _$jscoverage['/editor.js'].lineData[1070]++;
    var innerCssFile = Utils.debugUrl('theme/iframe.css');
    _$jscoverage['/editor.js'].lineData[1071]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1072]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1073]++;
    for (i = 0; visit1246_1073_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1074]++;
      links += util.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1078]++;
    return util.substitute(iframeContentTpl, {
  doctype: visit1247_1082_1(UA.ieMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1248_1089_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require(\'editor\')._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1105]++;
  var saveLater = util.buffer(function() {
  _$jscoverage['/editor.js'].functionData[70]++;
  _$jscoverage['/editor.js'].lineData[1106]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1109]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[71]++;
    _$jscoverage['/editor.js'].lineData[1110]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1117]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1118]++;
    try {
      _$jscoverage['/editor.js'].lineData[1126]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1131]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1134]++;
  if (visit1249_1134_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1135]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1136]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1139]++;
    run();
    _$jscoverage['/editor.js'].lineData[1140]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[72]++;
      _$jscoverage['/editor.js'].lineData[1141]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1142]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1143]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1144]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1146]++;
      doc.open('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1147]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1148]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1152]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[73]++;
    _$jscoverage['/editor.js'].lineData[1156]++;
    var iframeSrc = visit1250_1156_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1157]++;
    if (visit1251_1157_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1158]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1160]++;
    var iframe = new Node(util.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1165]++;
    if (visit1252_1165_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1166]++;
      iframe.attr('tabindex', UA.webkit ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1168]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1169]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1170]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1172]++;
    if (visit1253_1172_1(UA.gecko && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1173]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[74]++;
  _$jscoverage['/editor.js'].lineData[1174]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1178]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1182]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[75]++;
    _$jscoverage['/editor.js'].lineData[1183]++;
    if (visit1254_1183_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1184]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1186]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1192]++;
    util.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[76]++;
  _$jscoverage['/editor.js'].lineData[1193]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1195]++;
    iframe.remove();
  }
});
