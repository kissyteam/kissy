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
if (! _$jscoverage['/uri.js']) {
  _$jscoverage['/uri.js'] = {};
  _$jscoverage['/uri.js'].lineData = [];
  _$jscoverage['/uri.js'].lineData[6] = 0;
  _$jscoverage['/uri.js'].lineData[8] = 0;
  _$jscoverage['/uri.js'].lineData[77] = 0;
  _$jscoverage['/uri.js'].lineData[78] = 0;
  _$jscoverage['/uri.js'].lineData[79] = 0;
  _$jscoverage['/uri.js'].lineData[88] = 0;
  _$jscoverage['/uri.js'].lineData[89] = 0;
  _$jscoverage['/uri.js'].lineData[93] = 0;
  _$jscoverage['/uri.js'].lineData[101] = 0;
  _$jscoverage['/uri.js'].lineData[111] = 0;
  _$jscoverage['/uri.js'].lineData[112] = 0;
  _$jscoverage['/uri.js'].lineData[113] = 0;
  _$jscoverage['/uri.js'].lineData[114] = 0;
  _$jscoverage['/uri.js'].lineData[122] = 0;
  _$jscoverage['/uri.js'].lineData[126] = 0;
  _$jscoverage['/uri.js'].lineData[127] = 0;
  _$jscoverage['/uri.js'].lineData[128] = 0;
  _$jscoverage['/uri.js'].lineData[130] = 0;
  _$jscoverage['/uri.js'].lineData[131] = 0;
  _$jscoverage['/uri.js'].lineData[133] = 0;
  _$jscoverage['/uri.js'].lineData[137] = 0;
  _$jscoverage['/uri.js'].lineData[145] = 0;
  _$jscoverage['/uri.js'].lineData[146] = 0;
  _$jscoverage['/uri.js'].lineData[147] = 0;
  _$jscoverage['/uri.js'].lineData[148] = 0;
  _$jscoverage['/uri.js'].lineData[149] = 0;
  _$jscoverage['/uri.js'].lineData[151] = 0;
  _$jscoverage['/uri.js'].lineData[160] = 0;
  _$jscoverage['/uri.js'].lineData[161] = 0;
  _$jscoverage['/uri.js'].lineData[162] = 0;
  _$jscoverage['/uri.js'].lineData[163] = 0;
  _$jscoverage['/uri.js'].lineData[164] = 0;
  _$jscoverage['/uri.js'].lineData[166] = 0;
  _$jscoverage['/uri.js'].lineData[175] = 0;
  _$jscoverage['/uri.js'].lineData[176] = 0;
  _$jscoverage['/uri.js'].lineData[177] = 0;
  _$jscoverage['/uri.js'].lineData[187] = 0;
  _$jscoverage['/uri.js'].lineData[188] = 0;
  _$jscoverage['/uri.js'].lineData[189] = 0;
  _$jscoverage['/uri.js'].lineData[190] = 0;
  _$jscoverage['/uri.js'].lineData[191] = 0;
  _$jscoverage['/uri.js'].lineData[193] = 0;
  _$jscoverage['/uri.js'].lineData[194] = 0;
  _$jscoverage['/uri.js'].lineData[196] = 0;
  _$jscoverage['/uri.js'].lineData[197] = 0;
  _$jscoverage['/uri.js'].lineData[200] = 0;
  _$jscoverage['/uri.js'].lineData[209] = 0;
  _$jscoverage['/uri.js'].lineData[210] = 0;
  _$jscoverage['/uri.js'].lineData[211] = 0;
  _$jscoverage['/uri.js'].lineData[212] = 0;
  _$jscoverage['/uri.js'].lineData[214] = 0;
  _$jscoverage['/uri.js'].lineData[216] = 0;
  _$jscoverage['/uri.js'].lineData[227] = 0;
  _$jscoverage['/uri.js'].lineData[230] = 0;
  _$jscoverage['/uri.js'].lineData[231] = 0;
  _$jscoverage['/uri.js'].lineData[232] = 0;
  _$jscoverage['/uri.js'].lineData[233] = 0;
  _$jscoverage['/uri.js'].lineData[234] = 0;
  _$jscoverage['/uri.js'].lineData[235] = 0;
  _$jscoverage['/uri.js'].lineData[237] = 0;
  _$jscoverage['/uri.js'].lineData[239] = 0;
  _$jscoverage['/uri.js'].lineData[241] = 0;
  _$jscoverage['/uri.js'].lineData[242] = 0;
  _$jscoverage['/uri.js'].lineData[244] = 0;
  _$jscoverage['/uri.js'].lineData[245] = 0;
  _$jscoverage['/uri.js'].lineData[248] = 0;
  _$jscoverage['/uri.js'].lineData[257] = 0;
  _$jscoverage['/uri.js'].lineData[258] = 0;
  _$jscoverage['/uri.js'].lineData[259] = 0;
  _$jscoverage['/uri.js'].lineData[263] = 0;
  _$jscoverage['/uri.js'].lineData[264] = 0;
  _$jscoverage['/uri.js'].lineData[267] = 0;
  _$jscoverage['/uri.js'].lineData[268] = 0;
  _$jscoverage['/uri.js'].lineData[274] = 0;
  _$jscoverage['/uri.js'].lineData[279] = 0;
  _$jscoverage['/uri.js'].lineData[280] = 0;
  _$jscoverage['/uri.js'].lineData[291] = 0;
  _$jscoverage['/uri.js'].lineData[293] = 0;
  _$jscoverage['/uri.js'].lineData[294] = 0;
  _$jscoverage['/uri.js'].lineData[297] = 0;
  _$jscoverage['/uri.js'].lineData[299] = 0;
  _$jscoverage['/uri.js'].lineData[337] = 0;
  _$jscoverage['/uri.js'].lineData[339] = 0;
  _$jscoverage['/uri.js'].lineData[340] = 0;
  _$jscoverage['/uri.js'].lineData[341] = 0;
  _$jscoverage['/uri.js'].lineData[343] = 0;
  _$jscoverage['/uri.js'].lineData[346] = 0;
  _$jscoverage['/uri.js'].lineData[347] = 0;
  _$jscoverage['/uri.js'].lineData[349] = 0;
  _$jscoverage['/uri.js'].lineData[352] = 0;
  _$jscoverage['/uri.js'].lineData[356] = 0;
  _$jscoverage['/uri.js'].lineData[359] = 0;
  _$jscoverage['/uri.js'].lineData[368] = 0;
  _$jscoverage['/uri.js'].lineData[369] = 0;
  _$jscoverage['/uri.js'].lineData[370] = 0;
  _$jscoverage['/uri.js'].lineData[372] = 0;
  _$jscoverage['/uri.js'].lineData[373] = 0;
  _$jscoverage['/uri.js'].lineData[396] = 0;
  _$jscoverage['/uri.js'].lineData[397] = 0;
  _$jscoverage['/uri.js'].lineData[400] = 0;
  _$jscoverage['/uri.js'].lineData[406] = 0;
  _$jscoverage['/uri.js'].lineData[407] = 0;
  _$jscoverage['/uri.js'].lineData[409] = 0;
  _$jscoverage['/uri.js'].lineData[410] = 0;
  _$jscoverage['/uri.js'].lineData[412] = 0;
  _$jscoverage['/uri.js'].lineData[413] = 0;
  _$jscoverage['/uri.js'].lineData[415] = 0;
  _$jscoverage['/uri.js'].lineData[416] = 0;
  _$jscoverage['/uri.js'].lineData[417] = 0;
  _$jscoverage['/uri.js'].lineData[419] = 0;
  _$jscoverage['/uri.js'].lineData[420] = 0;
  _$jscoverage['/uri.js'].lineData[422] = 0;
  _$jscoverage['/uri.js'].lineData[423] = 0;
  _$jscoverage['/uri.js'].lineData[424] = 0;
  _$jscoverage['/uri.js'].lineData[429] = 0;
  _$jscoverage['/uri.js'].lineData[432] = 0;
  _$jscoverage['/uri.js'].lineData[433] = 0;
  _$jscoverage['/uri.js'].lineData[434] = 0;
  _$jscoverage['/uri.js'].lineData[435] = 0;
  _$jscoverage['/uri.js'].lineData[437] = 0;
  _$jscoverage['/uri.js'].lineData[438] = 0;
  _$jscoverage['/uri.js'].lineData[439] = 0;
  _$jscoverage['/uri.js'].lineData[443] = 0;
  _$jscoverage['/uri.js'].lineData[451] = 0;
  _$jscoverage['/uri.js'].lineData[460] = 0;
  _$jscoverage['/uri.js'].lineData[461] = 0;
  _$jscoverage['/uri.js'].lineData[469] = 0;
  _$jscoverage['/uri.js'].lineData[478] = 0;
  _$jscoverage['/uri.js'].lineData[479] = 0;
  _$jscoverage['/uri.js'].lineData[488] = 0;
  _$jscoverage['/uri.js'].lineData[489] = 0;
  _$jscoverage['/uri.js'].lineData[497] = 0;
  _$jscoverage['/uri.js'].lineData[506] = 0;
  _$jscoverage['/uri.js'].lineData[507] = 0;
  _$jscoverage['/uri.js'].lineData[515] = 0;
  _$jscoverage['/uri.js'].lineData[524] = 0;
  _$jscoverage['/uri.js'].lineData[525] = 0;
  _$jscoverage['/uri.js'].lineData[533] = 0;
  _$jscoverage['/uri.js'].lineData[542] = 0;
  _$jscoverage['/uri.js'].lineData[543] = 0;
  _$jscoverage['/uri.js'].lineData[544] = 0;
  _$jscoverage['/uri.js'].lineData[546] = 0;
  _$jscoverage['/uri.js'].lineData[548] = 0;
  _$jscoverage['/uri.js'].lineData[549] = 0;
  _$jscoverage['/uri.js'].lineData[557] = 0;
  _$jscoverage['/uri.js'].lineData[565] = 0;
  _$jscoverage['/uri.js'].lineData[574] = 0;
  _$jscoverage['/uri.js'].lineData[575] = 0;
  _$jscoverage['/uri.js'].lineData[576] = 0;
  _$jscoverage['/uri.js'].lineData[578] = 0;
  _$jscoverage['/uri.js'].lineData[579] = 0;
  _$jscoverage['/uri.js'].lineData[588] = 0;
  _$jscoverage['/uri.js'].lineData[590] = 0;
  _$jscoverage['/uri.js'].lineData[605] = 0;
  _$jscoverage['/uri.js'].lineData[615] = 0;
  _$jscoverage['/uri.js'].lineData[616] = 0;
  _$jscoverage['/uri.js'].lineData[617] = 0;
  _$jscoverage['/uri.js'].lineData[620] = 0;
  _$jscoverage['/uri.js'].lineData[621] = 0;
  _$jscoverage['/uri.js'].lineData[622] = 0;
  _$jscoverage['/uri.js'].lineData[623] = 0;
  _$jscoverage['/uri.js'].lineData[624] = 0;
  _$jscoverage['/uri.js'].lineData[627] = 0;
  _$jscoverage['/uri.js'].lineData[629] = 0;
  _$jscoverage['/uri.js'].lineData[630] = 0;
  _$jscoverage['/uri.js'].lineData[631] = 0;
  _$jscoverage['/uri.js'].lineData[635] = 0;
  _$jscoverage['/uri.js'].lineData[636] = 0;
  _$jscoverage['/uri.js'].lineData[637] = 0;
  _$jscoverage['/uri.js'].lineData[639] = 0;
  _$jscoverage['/uri.js'].lineData[640] = 0;
  _$jscoverage['/uri.js'].lineData[643] = 0;
  _$jscoverage['/uri.js'].lineData[644] = 0;
  _$jscoverage['/uri.js'].lineData[645] = 0;
  _$jscoverage['/uri.js'].lineData[648] = 0;
  _$jscoverage['/uri.js'].lineData[649] = 0;
  _$jscoverage['/uri.js'].lineData[650] = 0;
  _$jscoverage['/uri.js'].lineData[653] = 0;
  _$jscoverage['/uri.js'].lineData[657] = 0;
  _$jscoverage['/uri.js'].lineData[659] = 0;
  _$jscoverage['/uri.js'].lineData[660] = 0;
  _$jscoverage['/uri.js'].lineData[661] = 0;
  _$jscoverage['/uri.js'].lineData[663] = 0;
  _$jscoverage['/uri.js'].lineData[664] = 0;
  _$jscoverage['/uri.js'].lineData[666] = 0;
  _$jscoverage['/uri.js'].lineData[669] = 0;
}
if (! _$jscoverage['/uri.js'].functionData) {
  _$jscoverage['/uri.js'].functionData = [];
  _$jscoverage['/uri.js'].functionData[0] = 0;
  _$jscoverage['/uri.js'].functionData[1] = 0;
  _$jscoverage['/uri.js'].functionData[2] = 0;
  _$jscoverage['/uri.js'].functionData[3] = 0;
  _$jscoverage['/uri.js'].functionData[4] = 0;
  _$jscoverage['/uri.js'].functionData[5] = 0;
  _$jscoverage['/uri.js'].functionData[6] = 0;
  _$jscoverage['/uri.js'].functionData[7] = 0;
  _$jscoverage['/uri.js'].functionData[8] = 0;
  _$jscoverage['/uri.js'].functionData[9] = 0;
  _$jscoverage['/uri.js'].functionData[10] = 0;
  _$jscoverage['/uri.js'].functionData[11] = 0;
  _$jscoverage['/uri.js'].functionData[12] = 0;
  _$jscoverage['/uri.js'].functionData[13] = 0;
  _$jscoverage['/uri.js'].functionData[14] = 0;
  _$jscoverage['/uri.js'].functionData[15] = 0;
  _$jscoverage['/uri.js'].functionData[16] = 0;
  _$jscoverage['/uri.js'].functionData[17] = 0;
  _$jscoverage['/uri.js'].functionData[18] = 0;
  _$jscoverage['/uri.js'].functionData[19] = 0;
  _$jscoverage['/uri.js'].functionData[20] = 0;
  _$jscoverage['/uri.js'].functionData[21] = 0;
  _$jscoverage['/uri.js'].functionData[22] = 0;
  _$jscoverage['/uri.js'].functionData[23] = 0;
  _$jscoverage['/uri.js'].functionData[24] = 0;
  _$jscoverage['/uri.js'].functionData[25] = 0;
  _$jscoverage['/uri.js'].functionData[26] = 0;
  _$jscoverage['/uri.js'].functionData[27] = 0;
  _$jscoverage['/uri.js'].functionData[28] = 0;
  _$jscoverage['/uri.js'].functionData[29] = 0;
  _$jscoverage['/uri.js'].functionData[30] = 0;
  _$jscoverage['/uri.js'].functionData[31] = 0;
  _$jscoverage['/uri.js'].functionData[32] = 0;
  _$jscoverage['/uri.js'].functionData[33] = 0;
  _$jscoverage['/uri.js'].functionData[34] = 0;
  _$jscoverage['/uri.js'].functionData[35] = 0;
  _$jscoverage['/uri.js'].functionData[36] = 0;
  _$jscoverage['/uri.js'].functionData[37] = 0;
  _$jscoverage['/uri.js'].functionData[38] = 0;
  _$jscoverage['/uri.js'].functionData[39] = 0;
  _$jscoverage['/uri.js'].functionData[40] = 0;
  _$jscoverage['/uri.js'].functionData[41] = 0;
}
if (! _$jscoverage['/uri.js'].branchData) {
  _$jscoverage['/uri.js'].branchData = {};
  _$jscoverage['/uri.js'].branchData['78'] = [];
  _$jscoverage['/uri.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['89'] = [];
  _$jscoverage['/uri.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['112'] = [];
  _$jscoverage['/uri.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['130'] = [];
  _$jscoverage['/uri.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['148'] = [];
  _$jscoverage['/uri.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['163'] = [];
  _$jscoverage['/uri.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['190'] = [];
  _$jscoverage['/uri.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['193'] = [];
  _$jscoverage['/uri.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['211'] = [];
  _$jscoverage['/uri.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['230'] = [];
  _$jscoverage['/uri.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['234'] = [];
  _$jscoverage['/uri.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['241'] = [];
  _$jscoverage['/uri.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['264'] = [];
  _$jscoverage['/uri.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['268'] = [];
  _$jscoverage['/uri.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['293'] = [];
  _$jscoverage['/uri.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['340'] = [];
  _$jscoverage['/uri.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['341'] = [];
  _$jscoverage['/uri.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['396'] = [];
  _$jscoverage['/uri.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['407'] = [];
  _$jscoverage['/uri.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['409'] = [];
  _$jscoverage['/uri.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['413'] = [];
  _$jscoverage['/uri.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['416'] = [];
  _$jscoverage['/uri.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['417'] = [];
  _$jscoverage['/uri.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['420'] = [];
  _$jscoverage['/uri.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['423'] = [];
  _$jscoverage['/uri.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['432'] = [];
  _$jscoverage['/uri.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['433'] = [];
  _$jscoverage['/uri.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['437'] = [];
  _$jscoverage['/uri.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['542'] = [];
  _$jscoverage['/uri.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['543'] = [];
  _$jscoverage['/uri.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['575'] = [];
  _$jscoverage['/uri.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['590'] = [];
  _$jscoverage['/uri.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['591'] = [];
  _$jscoverage['/uri.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['615'] = [];
  _$jscoverage['/uri.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['620'] = [];
  _$jscoverage['/uri.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['622'] = [];
  _$jscoverage['/uri.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['629'] = [];
  _$jscoverage['/uri.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['635'] = [];
  _$jscoverage['/uri.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['636'] = [];
  _$jscoverage['/uri.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['643'] = [];
  _$jscoverage['/uri.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['648'] = [];
  _$jscoverage['/uri.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['660'] = [];
  _$jscoverage['/uri.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['661'] = [];
  _$jscoverage['/uri.js'].branchData['661'][1] = new BranchData();
}
_$jscoverage['/uri.js'].branchData['661'][1].init(44, 30, 'url.match(URI_SPLIT_REG) || []');
function visit642_661_1(result) {
  _$jscoverage['/uri.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['660'][1].init(16, 9, 'url || ""');
function visit641_660_1(result) {
  _$jscoverage['/uri.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['648'][1].init(1382, 24, 'fragment = self.fragment');
function visit640_648_1(result) {
  _$jscoverage['/uri.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['643'][1].init(1215, 63, 'query = (self.query.toString.call(self.query, serializeArray))');
function visit639_643_1(result) {
  _$jscoverage['/uri.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['636'][1].init(22, 36, 'hostname && !S.startsWith(path, \'/\')');
function visit638_636_1(result) {
  _$jscoverage['/uri.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['635'][1].init(918, 16, 'path = self.path');
function visit637_635_1(result) {
  _$jscoverage['/uri.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['629'][1].init(313, 16, 'port = self.port');
function visit636_629_1(result) {
  _$jscoverage['/uri.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['622'][1].init(55, 24, 'userInfo = self.userInfo');
function visit635_622_1(result) {
  _$jscoverage['/uri.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['620'][1].init(432, 24, 'hostname = self.hostname');
function visit634_620_1(result) {
  _$jscoverage['/uri.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['615'][1].init(255, 20, 'scheme = self.scheme');
function visit633_615_1(result) {
  _$jscoverage['/uri.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['591'][1].init(70, 109, 'equalsIgnoreCase(self.scheme, other[\'scheme\']) && equalsIgnoreCase(self.port, other[\'port\'])');
function visit632_591_1(result) {
  _$jscoverage['/uri.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['590'][1].init(100, 180, 'equalsIgnoreCase(self.hostname, other[\'hostname\']) && equalsIgnoreCase(self.scheme, other[\'scheme\']) && equalsIgnoreCase(self.port, other[\'port\'])');
function visit631_590_1(result) {
  _$jscoverage['/uri.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['575'][1].init(48, 27, 'S.startsWith(fragment, \'#\')');
function visit630_575_1(result) {
  _$jscoverage['/uri.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['543'][1].init(22, 24, 'S.startsWith(query, \'?\')');
function visit629_543_1(result) {
  _$jscoverage['/uri.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['542'][1].init(18, 24, 'typeof query == \'string\'');
function visit628_542_1(result) {
  _$jscoverage['/uri.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['437'][1].init(1674, 26, 'override || relativeUri[o]');
function visit627_437_1(result) {
  _$jscoverage['/uri.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['433'][1].init(26, 43, 'override || relativeUri[\'query\'].toString()');
function visit626_433_1(result) {
  _$jscoverage['/uri.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['432'][1].init(1425, 12, 'o == \'query\'');
function visit625_432_1(result) {
  _$jscoverage['/uri.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['423'][1].init(198, 20, 'lastSlashIndex != -1');
function visit624_423_1(result) {
  _$jscoverage['/uri.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['420'][1].init(246, 11, 'target.path');
function visit623_420_1(result) {
  _$jscoverage['/uri.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['417'][1].init(38, 31, 'target.hostname && !target.path');
function visit622_417_1(result) {
  _$jscoverage['/uri.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['416'][1].init(157, 24, '!S.startsWith(path, \'/\')');
function visit621_416_1(result) {
  _$jscoverage['/uri.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['413'][1].init(87, 4, 'path');
function visit620_413_1(result) {
  _$jscoverage['/uri.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['409'][1].init(109, 8, 'override');
function visit619_409_1(result) {
  _$jscoverage['/uri.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['407'][1].init(22, 11, 'o == \'path\'');
function visit618_407_1(result) {
  _$jscoverage['/uri.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['396'][1].init(20, 30, 'typeof relativeUri == \'string\'');
function visit617_396_1(result) {
  _$jscoverage['/uri.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['341'][1].init(44, 14, 'key == \'query\'');
function visit616_341_1(result) {
  _$jscoverage['/uri.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['340'][1].init(18, 7, 'v || \'\'');
function visit615_340_1(result) {
  _$jscoverage['/uri.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['293'][1].init(16, 22, 'uriStr instanceof Uri');
function visit614_293_1(result) {
  _$jscoverage['/uri.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['268'][1].init(17, 40, 'str1.toLowerCase() == str2.toLowerCase()');
function visit613_268_1(result) {
  _$jscoverage['/uri.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['264'][1].init(17, 15, 'str.length == 1');
function visit612_264_1(result) {
  _$jscoverage['/uri.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['241'][1].init(22, 20, 'key instanceof Query');
function visit611_241_1(result) {
  _$jscoverage['/uri.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['234'][1].init(150, 26, 'currentValue === undefined');
function visit610_234_1(result) {
  _$jscoverage['/uri.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['230'][1].init(107, 22, 'typeof key == \'string\'');
function visit609_230_1(result) {
  _$jscoverage['/uri.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['211'][1].init(79, 3, 'key');
function visit608_211_1(result) {
  _$jscoverage['/uri.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['193'][1].init(22, 20, 'key instanceof Query');
function visit607_193_1(result) {
  _$jscoverage['/uri.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['190'][1].init(131, 22, 'typeof key == \'string\'');
function visit606_190_1(result) {
  _$jscoverage['/uri.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['163'][1].init(131, 3, 'key');
function visit605_163_1(result) {
  _$jscoverage['/uri.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['148'][1].init(131, 3, 'key');
function visit604_148_1(result) {
  _$jscoverage['/uri.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['130'][1].init(24, 23, 'S.isArray(_queryMap[k])');
function visit603_130_1(result) {
  _$jscoverage['/uri.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['112'][1].init(58, 11, 'query || \'\'');
function visit602_112_1(result) {
  _$jscoverage['/uri.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['89'][1].init(24, 11, 'query || \'\'');
function visit601_89_1(result) {
  _$jscoverage['/uri.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['78'][1].init(14, 15, '!self._queryMap');
function visit600_78_1(result) {
  _$jscoverage['/uri.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/uri.js'].functionData[0]++;
  _$jscoverage['/uri.js'].lineData[8]++;
  var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g, reDisallowedInPathName = /[#\?]/g, reDisallowedInQuery = /[#@]/g, reDisallowedInFragment = /#/g, URI_SPLIT_REG = new RegExp('^' + '(?:([\\w\\d+.-]+):)?' + '(?://' + '(?:([^/?#@]*)@)?' + '(' + '[\\w\\d\\-\\u0100-\\uffff.+%]*' + '|' + '\\[[^\\]]+\\]' + ')' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$'), Path = S.Path, REG_INFO = {
  scheme: 1, 
  userInfo: 2, 
  hostname: 3, 
  port: 4, 
  path: 5, 
  query: 6, 
  fragment: 7};
  _$jscoverage['/uri.js'].lineData[77]++;
  function parseQuery(self) {
    _$jscoverage['/uri.js'].functionData[1]++;
    _$jscoverage['/uri.js'].lineData[78]++;
    if (visit600_78_1(!self._queryMap)) {
      _$jscoverage['/uri.js'].lineData[79]++;
      self._queryMap = S.unparam(self._query);
    }
  }
  _$jscoverage['/uri.js'].lineData[88]++;
  function Query(query) {
    _$jscoverage['/uri.js'].functionData[2]++;
    _$jscoverage['/uri.js'].lineData[89]++;
    this._query = visit601_89_1(query || '');
  }
  _$jscoverage['/uri.js'].lineData[93]++;
  Query.prototype = {
  constructor: Query, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[3]++;
  _$jscoverage['/uri.js'].lineData[101]++;
  return new Query(this.toString());
}, 
  reset: function(query) {
  _$jscoverage['/uri.js'].functionData[4]++;
  _$jscoverage['/uri.js'].lineData[111]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[112]++;
  self._query = visit602_112_1(query || '');
  _$jscoverage['/uri.js'].lineData[113]++;
  self._queryMap = null;
  _$jscoverage['/uri.js'].lineData[114]++;
  return self;
}, 
  count: function() {
  _$jscoverage['/uri.js'].functionData[5]++;
  _$jscoverage['/uri.js'].lineData[122]++;
  var self = this, count = 0, _queryMap, k;
  _$jscoverage['/uri.js'].lineData[126]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[127]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[128]++;
  for (k in _queryMap) {
    _$jscoverage['/uri.js'].lineData[130]++;
    if (visit603_130_1(S.isArray(_queryMap[k]))) {
      _$jscoverage['/uri.js'].lineData[131]++;
      count += _queryMap[k].length;
    } else {
      _$jscoverage['/uri.js'].lineData[133]++;
      count++;
    }
  }
  _$jscoverage['/uri.js'].lineData[137]++;
  return count;
}, 
  has: function(key) {
  _$jscoverage['/uri.js'].functionData[6]++;
  _$jscoverage['/uri.js'].lineData[145]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[146]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[147]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[148]++;
  if (visit604_148_1(key)) {
    _$jscoverage['/uri.js'].lineData[149]++;
    return key in _queryMap;
  } else {
    _$jscoverage['/uri.js'].lineData[151]++;
    return !S.isEmptyObject(_queryMap);
  }
}, 
  get: function(key) {
  _$jscoverage['/uri.js'].functionData[7]++;
  _$jscoverage['/uri.js'].lineData[160]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[161]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[162]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[163]++;
  if (visit605_163_1(key)) {
    _$jscoverage['/uri.js'].lineData[164]++;
    return _queryMap[key];
  } else {
    _$jscoverage['/uri.js'].lineData[166]++;
    return _queryMap;
  }
}, 
  keys: function() {
  _$jscoverage['/uri.js'].functionData[8]++;
  _$jscoverage['/uri.js'].lineData[175]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[176]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[177]++;
  return S.keys(self._queryMap);
}, 
  set: function(key, value) {
  _$jscoverage['/uri.js'].functionData[9]++;
  _$jscoverage['/uri.js'].lineData[187]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[188]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[189]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[190]++;
  if (visit606_190_1(typeof key == 'string')) {
    _$jscoverage['/uri.js'].lineData[191]++;
    self._queryMap[key] = value;
  } else {
    _$jscoverage['/uri.js'].lineData[193]++;
    if (visit607_193_1(key instanceof Query)) {
      _$jscoverage['/uri.js'].lineData[194]++;
      key = key.get();
    }
    _$jscoverage['/uri.js'].lineData[196]++;
    S.each(key, function(v, k) {
  _$jscoverage['/uri.js'].functionData[10]++;
  _$jscoverage['/uri.js'].lineData[197]++;
  _queryMap[k] = v;
});
  }
  _$jscoverage['/uri.js'].lineData[200]++;
  return self;
}, 
  remove: function(key) {
  _$jscoverage['/uri.js'].functionData[11]++;
  _$jscoverage['/uri.js'].lineData[209]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[210]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[211]++;
  if (visit608_211_1(key)) {
    _$jscoverage['/uri.js'].lineData[212]++;
    delete self._queryMap[key];
  } else {
    _$jscoverage['/uri.js'].lineData[214]++;
    self._queryMap = {};
  }
  _$jscoverage['/uri.js'].lineData[216]++;
  return self;
}, 
  add: function(key, value) {
  _$jscoverage['/uri.js'].functionData[12]++;
  _$jscoverage['/uri.js'].lineData[227]++;
  var self = this, _queryMap, currentValue;
  _$jscoverage['/uri.js'].lineData[230]++;
  if (visit609_230_1(typeof key == 'string')) {
    _$jscoverage['/uri.js'].lineData[231]++;
    parseQuery(self);
    _$jscoverage['/uri.js'].lineData[232]++;
    _queryMap = self._queryMap;
    _$jscoverage['/uri.js'].lineData[233]++;
    currentValue = _queryMap[key];
    _$jscoverage['/uri.js'].lineData[234]++;
    if (visit610_234_1(currentValue === undefined)) {
      _$jscoverage['/uri.js'].lineData[235]++;
      currentValue = value;
    } else {
      _$jscoverage['/uri.js'].lineData[237]++;
      currentValue = [].concat(currentValue).concat(value);
    }
    _$jscoverage['/uri.js'].lineData[239]++;
    _queryMap[key] = currentValue;
  } else {
    _$jscoverage['/uri.js'].lineData[241]++;
    if (visit611_241_1(key instanceof Query)) {
      _$jscoverage['/uri.js'].lineData[242]++;
      key = key.get();
    }
    _$jscoverage['/uri.js'].lineData[244]++;
    for (var k in key) {
      _$jscoverage['/uri.js'].lineData[245]++;
      self.add(k, key[k]);
    }
  }
  _$jscoverage['/uri.js'].lineData[248]++;
  return self;
}, 
  toString: function(serializeArray) {
  _$jscoverage['/uri.js'].functionData[13]++;
  _$jscoverage['/uri.js'].lineData[257]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[258]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[259]++;
  return S.param(self._queryMap, undefined, undefined, serializeArray);
}};
  _$jscoverage['/uri.js'].lineData[263]++;
  function padding2(str) {
    _$jscoverage['/uri.js'].functionData[14]++;
    _$jscoverage['/uri.js'].lineData[264]++;
    return visit612_264_1(str.length == 1) ? '0' + str : str;
  }
  _$jscoverage['/uri.js'].lineData[267]++;
  function equalsIgnoreCase(str1, str2) {
    _$jscoverage['/uri.js'].functionData[15]++;
    _$jscoverage['/uri.js'].lineData[268]++;
    return visit613_268_1(str1.toLowerCase() == str2.toLowerCase());
  }
  _$jscoverage['/uri.js'].lineData[274]++;
  function encodeSpecialChars(str, specialCharsReg) {
    _$jscoverage['/uri.js'].functionData[16]++;
    _$jscoverage['/uri.js'].lineData[279]++;
    return encodeURI(str).replace(specialCharsReg, function(m) {
  _$jscoverage['/uri.js'].functionData[17]++;
  _$jscoverage['/uri.js'].lineData[280]++;
  return '%' + padding2(m.charCodeAt(0).toString(16));
});
  }
  _$jscoverage['/uri.js'].lineData[291]++;
  function Uri(uriStr) {
    _$jscoverage['/uri.js'].functionData[18]++;
    _$jscoverage['/uri.js'].lineData[293]++;
    if (visit614_293_1(uriStr instanceof Uri)) {
      _$jscoverage['/uri.js'].lineData[294]++;
      return uriStr['clone']();
    }
    _$jscoverage['/uri.js'].lineData[297]++;
    var components, self = this;
    _$jscoverage['/uri.js'].lineData[299]++;
    S.mix(self, {
  scheme: '', 
  userInfo: '', 
  hostname: '', 
  port: '', 
  path: '', 
  query: '', 
  fragment: ''});
    _$jscoverage['/uri.js'].lineData[337]++;
    components = Uri.getComponents(uriStr);
    _$jscoverage['/uri.js'].lineData[339]++;
    S.each(components, function(v, key) {
  _$jscoverage['/uri.js'].functionData[19]++;
  _$jscoverage['/uri.js'].lineData[340]++;
  v = visit615_340_1(v || '');
  _$jscoverage['/uri.js'].lineData[341]++;
  if (visit616_341_1(key == 'query')) {
    _$jscoverage['/uri.js'].lineData[343]++;
    self.query = new Query(v);
  } else {
    _$jscoverage['/uri.js'].lineData[346]++;
    try {
      _$jscoverage['/uri.js'].lineData[347]++;
      v = S.urlDecode(v);
    }    catch (e) {
  _$jscoverage['/uri.js'].lineData[349]++;
  S.log(e + 'urlDecode error : ' + v, 'error');
}
    _$jscoverage['/uri.js'].lineData[352]++;
    self[key] = v;
  }
});
    _$jscoverage['/uri.js'].lineData[356]++;
    return self;
  }
  _$jscoverage['/uri.js'].lineData[359]++;
  Uri.prototype = {
  constructor: Uri, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[20]++;
  _$jscoverage['/uri.js'].lineData[368]++;
  var uri = new Uri(), self = this;
  _$jscoverage['/uri.js'].lineData[369]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[21]++;
  _$jscoverage['/uri.js'].lineData[370]++;
  uri[key] = self[key];
});
  _$jscoverage['/uri.js'].lineData[372]++;
  uri.query = uri.query.clone();
  _$jscoverage['/uri.js'].lineData[373]++;
  return uri;
}, 
  resolve: function(relativeUri) {
  _$jscoverage['/uri.js'].functionData[22]++;
  _$jscoverage['/uri.js'].lineData[396]++;
  if (visit617_396_1(typeof relativeUri == 'string')) {
    _$jscoverage['/uri.js'].lineData[397]++;
    relativeUri = new Uri(relativeUri);
  }
  _$jscoverage['/uri.js'].lineData[400]++;
  var self = this, override = 0, lastSlashIndex, order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'], target = self.clone();
  _$jscoverage['/uri.js'].lineData[406]++;
  S.each(order, function(o) {
  _$jscoverage['/uri.js'].functionData[23]++;
  _$jscoverage['/uri.js'].lineData[407]++;
  if (visit618_407_1(o == 'path')) {
    _$jscoverage['/uri.js'].lineData[409]++;
    if (visit619_409_1(override)) {
      _$jscoverage['/uri.js'].lineData[410]++;
      target[o] = relativeUri[o];
    } else {
      _$jscoverage['/uri.js'].lineData[412]++;
      var path = relativeUri['path'];
      _$jscoverage['/uri.js'].lineData[413]++;
      if (visit620_413_1(path)) {
        _$jscoverage['/uri.js'].lineData[415]++;
        override = 1;
        _$jscoverage['/uri.js'].lineData[416]++;
        if (visit621_416_1(!S.startsWith(path, '/'))) {
          _$jscoverage['/uri.js'].lineData[417]++;
          if (visit622_417_1(target.hostname && !target.path)) {
            _$jscoverage['/uri.js'].lineData[419]++;
            path = '/' + path;
          } else {
            _$jscoverage['/uri.js'].lineData[420]++;
            if (visit623_420_1(target.path)) {
              _$jscoverage['/uri.js'].lineData[422]++;
              lastSlashIndex = target.path.lastIndexOf('/');
              _$jscoverage['/uri.js'].lineData[423]++;
              if (visit624_423_1(lastSlashIndex != -1)) {
                _$jscoverage['/uri.js'].lineData[424]++;
                path = target.path.slice(0, lastSlashIndex + 1) + path;
              }
            }
          }
        }
        _$jscoverage['/uri.js'].lineData[429]++;
        target.path = Path.normalize(path);
      }
    }
  } else {
    _$jscoverage['/uri.js'].lineData[432]++;
    if (visit625_432_1(o == 'query')) {
      _$jscoverage['/uri.js'].lineData[433]++;
      if (visit626_433_1(override || relativeUri['query'].toString())) {
        _$jscoverage['/uri.js'].lineData[434]++;
        target.query = relativeUri['query'].clone();
        _$jscoverage['/uri.js'].lineData[435]++;
        override = 1;
      }
    } else {
      _$jscoverage['/uri.js'].lineData[437]++;
      if (visit627_437_1(override || relativeUri[o])) {
        _$jscoverage['/uri.js'].lineData[438]++;
        target[o] = relativeUri[o];
        _$jscoverage['/uri.js'].lineData[439]++;
        override = 1;
      }
    }
  }
});
  _$jscoverage['/uri.js'].lineData[443]++;
  return target;
}, 
  getScheme: function() {
  _$jscoverage['/uri.js'].functionData[24]++;
  _$jscoverage['/uri.js'].lineData[451]++;
  return this.scheme;
}, 
  setScheme: function(scheme) {
  _$jscoverage['/uri.js'].functionData[25]++;
  _$jscoverage['/uri.js'].lineData[460]++;
  this.scheme = scheme;
  _$jscoverage['/uri.js'].lineData[461]++;
  return this;
}, 
  getHostname: function() {
  _$jscoverage['/uri.js'].functionData[26]++;
  _$jscoverage['/uri.js'].lineData[469]++;
  return this.hostname;
}, 
  setHostname: function(hostname) {
  _$jscoverage['/uri.js'].functionData[27]++;
  _$jscoverage['/uri.js'].lineData[478]++;
  this.hostname = hostname;
  _$jscoverage['/uri.js'].lineData[479]++;
  return this;
}, 
  'setUserInfo': function(userInfo) {
  _$jscoverage['/uri.js'].functionData[28]++;
  _$jscoverage['/uri.js'].lineData[488]++;
  this.userInfo = userInfo;
  _$jscoverage['/uri.js'].lineData[489]++;
  return this;
}, 
  getUserInfo: function() {
  _$jscoverage['/uri.js'].functionData[29]++;
  _$jscoverage['/uri.js'].lineData[497]++;
  return this.userInfo;
}, 
  'setPort': function(port) {
  _$jscoverage['/uri.js'].functionData[30]++;
  _$jscoverage['/uri.js'].lineData[506]++;
  this.port = port;
  _$jscoverage['/uri.js'].lineData[507]++;
  return this;
}, 
  'getPort': function() {
  _$jscoverage['/uri.js'].functionData[31]++;
  _$jscoverage['/uri.js'].lineData[515]++;
  return this.port;
}, 
  setPath: function(path) {
  _$jscoverage['/uri.js'].functionData[32]++;
  _$jscoverage['/uri.js'].lineData[524]++;
  this.path = path;
  _$jscoverage['/uri.js'].lineData[525]++;
  return this;
}, 
  getPath: function() {
  _$jscoverage['/uri.js'].functionData[33]++;
  _$jscoverage['/uri.js'].lineData[533]++;
  return this.path;
}, 
  'setQuery': function(query) {
  _$jscoverage['/uri.js'].functionData[34]++;
  _$jscoverage['/uri.js'].lineData[542]++;
  if (visit628_542_1(typeof query == 'string')) {
    _$jscoverage['/uri.js'].lineData[543]++;
    if (visit629_543_1(S.startsWith(query, '?'))) {
      _$jscoverage['/uri.js'].lineData[544]++;
      query = query.slice(1);
    }
    _$jscoverage['/uri.js'].lineData[546]++;
    query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
  }
  _$jscoverage['/uri.js'].lineData[548]++;
  this.query = query;
  _$jscoverage['/uri.js'].lineData[549]++;
  return this;
}, 
  getQuery: function() {
  _$jscoverage['/uri.js'].functionData[35]++;
  _$jscoverage['/uri.js'].lineData[557]++;
  return this.query;
}, 
  getFragment: function() {
  _$jscoverage['/uri.js'].functionData[36]++;
  _$jscoverage['/uri.js'].lineData[565]++;
  return this.fragment;
}, 
  'setFragment': function(fragment) {
  _$jscoverage['/uri.js'].functionData[37]++;
  _$jscoverage['/uri.js'].lineData[574]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[575]++;
  if (visit630_575_1(S.startsWith(fragment, '#'))) {
    _$jscoverage['/uri.js'].lineData[576]++;
    fragment = fragment.slice(1);
  }
  _$jscoverage['/uri.js'].lineData[578]++;
  self.fragment = fragment;
  _$jscoverage['/uri.js'].lineData[579]++;
  return self;
}, 
  isSameOriginAs: function(other) {
  _$jscoverage['/uri.js'].functionData[38]++;
  _$jscoverage['/uri.js'].lineData[588]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[590]++;
  return visit631_590_1(equalsIgnoreCase(self.hostname, other['hostname']) && visit632_591_1(equalsIgnoreCase(self.scheme, other['scheme']) && equalsIgnoreCase(self.port, other['port'])));
}, 
  toString: function(serializeArray) {
  _$jscoverage['/uri.js'].functionData[39]++;
  _$jscoverage['/uri.js'].lineData[605]++;
  var out = [], self = this, scheme, hostname, path, port, fragment, query, userInfo;
  _$jscoverage['/uri.js'].lineData[615]++;
  if (visit633_615_1(scheme = self.scheme)) {
    _$jscoverage['/uri.js'].lineData[616]++;
    out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
    _$jscoverage['/uri.js'].lineData[617]++;
    out.push(':');
  }
  _$jscoverage['/uri.js'].lineData[620]++;
  if (visit634_620_1(hostname = self.hostname)) {
    _$jscoverage['/uri.js'].lineData[621]++;
    out.push('//');
    _$jscoverage['/uri.js'].lineData[622]++;
    if (visit635_622_1(userInfo = self.userInfo)) {
      _$jscoverage['/uri.js'].lineData[623]++;
      out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
      _$jscoverage['/uri.js'].lineData[624]++;
      out.push('@');
    }
    _$jscoverage['/uri.js'].lineData[627]++;
    out.push(encodeURIComponent(hostname));
    _$jscoverage['/uri.js'].lineData[629]++;
    if (visit636_629_1(port = self.port)) {
      _$jscoverage['/uri.js'].lineData[630]++;
      out.push(':');
      _$jscoverage['/uri.js'].lineData[631]++;
      out.push(port);
    }
  }
  _$jscoverage['/uri.js'].lineData[635]++;
  if (visit637_635_1(path = self.path)) {
    _$jscoverage['/uri.js'].lineData[636]++;
    if (visit638_636_1(hostname && !S.startsWith(path, '/'))) {
      _$jscoverage['/uri.js'].lineData[637]++;
      path = '/' + path;
    }
    _$jscoverage['/uri.js'].lineData[639]++;
    path = Path.normalize(path);
    _$jscoverage['/uri.js'].lineData[640]++;
    out.push(encodeSpecialChars(path, reDisallowedInPathName));
  }
  _$jscoverage['/uri.js'].lineData[643]++;
  if (visit639_643_1(query = (self.query.toString.call(self.query, serializeArray)))) {
    _$jscoverage['/uri.js'].lineData[644]++;
    out.push('?');
    _$jscoverage['/uri.js'].lineData[645]++;
    out.push(query);
  }
  _$jscoverage['/uri.js'].lineData[648]++;
  if (visit640_648_1(fragment = self.fragment)) {
    _$jscoverage['/uri.js'].lineData[649]++;
    out.push('#');
    _$jscoverage['/uri.js'].lineData[650]++;
    out.push(encodeSpecialChars(fragment, reDisallowedInFragment));
  }
  _$jscoverage['/uri.js'].lineData[653]++;
  return out.join('');
}};
  _$jscoverage['/uri.js'].lineData[657]++;
  Uri.Query = Query;
  _$jscoverage['/uri.js'].lineData[659]++;
  Uri.getComponents = function(url) {
  _$jscoverage['/uri.js'].functionData[40]++;
  _$jscoverage['/uri.js'].lineData[660]++;
  url = visit641_660_1(url || "");
  _$jscoverage['/uri.js'].lineData[661]++;
  var m = visit642_661_1(url.match(URI_SPLIT_REG) || []), ret = {};
  _$jscoverage['/uri.js'].lineData[663]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[41]++;
  _$jscoverage['/uri.js'].lineData[664]++;
  ret[key] = m[index];
});
  _$jscoverage['/uri.js'].lineData[666]++;
  return ret;
};
  _$jscoverage['/uri.js'].lineData[669]++;
  S.Uri = Uri;
})(KISSY);
