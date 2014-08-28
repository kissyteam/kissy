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
  _$jscoverage['/uri.js'].lineData[7] = 0;
  _$jscoverage['/uri.js'].lineData[8] = 0;
  _$jscoverage['/uri.js'].lineData[78] = 0;
  _$jscoverage['/uri.js'].lineData[79] = 0;
  _$jscoverage['/uri.js'].lineData[80] = 0;
  _$jscoverage['/uri.js'].lineData[89] = 0;
  _$jscoverage['/uri.js'].lineData[90] = 0;
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
  _$jscoverage['/uri.js'].lineData[290] = 0;
  _$jscoverage['/uri.js'].lineData[292] = 0;
  _$jscoverage['/uri.js'].lineData[293] = 0;
  _$jscoverage['/uri.js'].lineData[296] = 0;
  _$jscoverage['/uri.js'].lineData[298] = 0;
  _$jscoverage['/uri.js'].lineData[336] = 0;
  _$jscoverage['/uri.js'].lineData[338] = 0;
  _$jscoverage['/uri.js'].lineData[339] = 0;
  _$jscoverage['/uri.js'].lineData[340] = 0;
  _$jscoverage['/uri.js'].lineData[342] = 0;
  _$jscoverage['/uri.js'].lineData[345] = 0;
  _$jscoverage['/uri.js'].lineData[346] = 0;
  _$jscoverage['/uri.js'].lineData[348] = 0;
  _$jscoverage['/uri.js'].lineData[351] = 0;
  _$jscoverage['/uri.js'].lineData[355] = 0;
  _$jscoverage['/uri.js'].lineData[358] = 0;
  _$jscoverage['/uri.js'].lineData[366] = 0;
  _$jscoverage['/uri.js'].lineData[367] = 0;
  _$jscoverage['/uri.js'].lineData[368] = 0;
  _$jscoverage['/uri.js'].lineData[370] = 0;
  _$jscoverage['/uri.js'].lineData[371] = 0;
  _$jscoverage['/uri.js'].lineData[394] = 0;
  _$jscoverage['/uri.js'].lineData[395] = 0;
  _$jscoverage['/uri.js'].lineData[398] = 0;
  _$jscoverage['/uri.js'].lineData[404] = 0;
  _$jscoverage['/uri.js'].lineData[405] = 0;
  _$jscoverage['/uri.js'].lineData[407] = 0;
  _$jscoverage['/uri.js'].lineData[408] = 0;
  _$jscoverage['/uri.js'].lineData[410] = 0;
  _$jscoverage['/uri.js'].lineData[411] = 0;
  _$jscoverage['/uri.js'].lineData[413] = 0;
  _$jscoverage['/uri.js'].lineData[414] = 0;
  _$jscoverage['/uri.js'].lineData[415] = 0;
  _$jscoverage['/uri.js'].lineData[417] = 0;
  _$jscoverage['/uri.js'].lineData[418] = 0;
  _$jscoverage['/uri.js'].lineData[420] = 0;
  _$jscoverage['/uri.js'].lineData[421] = 0;
  _$jscoverage['/uri.js'].lineData[422] = 0;
  _$jscoverage['/uri.js'].lineData[427] = 0;
  _$jscoverage['/uri.js'].lineData[430] = 0;
  _$jscoverage['/uri.js'].lineData[431] = 0;
  _$jscoverage['/uri.js'].lineData[432] = 0;
  _$jscoverage['/uri.js'].lineData[433] = 0;
  _$jscoverage['/uri.js'].lineData[435] = 0;
  _$jscoverage['/uri.js'].lineData[436] = 0;
  _$jscoverage['/uri.js'].lineData[437] = 0;
  _$jscoverage['/uri.js'].lineData[441] = 0;
  _$jscoverage['/uri.js'].lineData[449] = 0;
  _$jscoverage['/uri.js'].lineData[458] = 0;
  _$jscoverage['/uri.js'].lineData[459] = 0;
  _$jscoverage['/uri.js'].lineData[467] = 0;
  _$jscoverage['/uri.js'].lineData[476] = 0;
  _$jscoverage['/uri.js'].lineData[477] = 0;
  _$jscoverage['/uri.js'].lineData[486] = 0;
  _$jscoverage['/uri.js'].lineData[487] = 0;
  _$jscoverage['/uri.js'].lineData[495] = 0;
  _$jscoverage['/uri.js'].lineData[504] = 0;
  _$jscoverage['/uri.js'].lineData[505] = 0;
  _$jscoverage['/uri.js'].lineData[513] = 0;
  _$jscoverage['/uri.js'].lineData[522] = 0;
  _$jscoverage['/uri.js'].lineData[523] = 0;
  _$jscoverage['/uri.js'].lineData[531] = 0;
  _$jscoverage['/uri.js'].lineData[540] = 0;
  _$jscoverage['/uri.js'].lineData[541] = 0;
  _$jscoverage['/uri.js'].lineData[542] = 0;
  _$jscoverage['/uri.js'].lineData[544] = 0;
  _$jscoverage['/uri.js'].lineData[546] = 0;
  _$jscoverage['/uri.js'].lineData[547] = 0;
  _$jscoverage['/uri.js'].lineData[555] = 0;
  _$jscoverage['/uri.js'].lineData[563] = 0;
  _$jscoverage['/uri.js'].lineData[572] = 0;
  _$jscoverage['/uri.js'].lineData[573] = 0;
  _$jscoverage['/uri.js'].lineData[574] = 0;
  _$jscoverage['/uri.js'].lineData[576] = 0;
  _$jscoverage['/uri.js'].lineData[577] = 0;
  _$jscoverage['/uri.js'].lineData[586] = 0;
  _$jscoverage['/uri.js'].lineData[588] = 0;
  _$jscoverage['/uri.js'].lineData[603] = 0;
  _$jscoverage['/uri.js'].lineData[613] = 0;
  _$jscoverage['/uri.js'].lineData[614] = 0;
  _$jscoverage['/uri.js'].lineData[615] = 0;
  _$jscoverage['/uri.js'].lineData[618] = 0;
  _$jscoverage['/uri.js'].lineData[619] = 0;
  _$jscoverage['/uri.js'].lineData[620] = 0;
  _$jscoverage['/uri.js'].lineData[621] = 0;
  _$jscoverage['/uri.js'].lineData[622] = 0;
  _$jscoverage['/uri.js'].lineData[625] = 0;
  _$jscoverage['/uri.js'].lineData[627] = 0;
  _$jscoverage['/uri.js'].lineData[628] = 0;
  _$jscoverage['/uri.js'].lineData[629] = 0;
  _$jscoverage['/uri.js'].lineData[633] = 0;
  _$jscoverage['/uri.js'].lineData[634] = 0;
  _$jscoverage['/uri.js'].lineData[635] = 0;
  _$jscoverage['/uri.js'].lineData[637] = 0;
  _$jscoverage['/uri.js'].lineData[638] = 0;
  _$jscoverage['/uri.js'].lineData[641] = 0;
  _$jscoverage['/uri.js'].lineData[642] = 0;
  _$jscoverage['/uri.js'].lineData[643] = 0;
  _$jscoverage['/uri.js'].lineData[646] = 0;
  _$jscoverage['/uri.js'].lineData[647] = 0;
  _$jscoverage['/uri.js'].lineData[648] = 0;
  _$jscoverage['/uri.js'].lineData[651] = 0;
  _$jscoverage['/uri.js'].lineData[655] = 0;
  _$jscoverage['/uri.js'].lineData[657] = 0;
  _$jscoverage['/uri.js'].lineData[658] = 0;
  _$jscoverage['/uri.js'].lineData[659] = 0;
  _$jscoverage['/uri.js'].lineData[661] = 0;
  _$jscoverage['/uri.js'].lineData[662] = 0;
  _$jscoverage['/uri.js'].lineData[664] = 0;
  _$jscoverage['/uri.js'].lineData[667] = 0;
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
  _$jscoverage['/uri.js'].branchData['79'] = [];
  _$jscoverage['/uri.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['90'] = [];
  _$jscoverage['/uri.js'].branchData['90'][1] = new BranchData();
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
  _$jscoverage['/uri.js'].branchData['292'] = [];
  _$jscoverage['/uri.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['339'] = [];
  _$jscoverage['/uri.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['340'] = [];
  _$jscoverage['/uri.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['394'] = [];
  _$jscoverage['/uri.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['405'] = [];
  _$jscoverage['/uri.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['407'] = [];
  _$jscoverage['/uri.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['411'] = [];
  _$jscoverage['/uri.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['414'] = [];
  _$jscoverage['/uri.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['415'] = [];
  _$jscoverage['/uri.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['418'] = [];
  _$jscoverage['/uri.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['421'] = [];
  _$jscoverage['/uri.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['430'] = [];
  _$jscoverage['/uri.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['431'] = [];
  _$jscoverage['/uri.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['435'] = [];
  _$jscoverage['/uri.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['540'] = [];
  _$jscoverage['/uri.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['541'] = [];
  _$jscoverage['/uri.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['573'] = [];
  _$jscoverage['/uri.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['588'] = [];
  _$jscoverage['/uri.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['589'] = [];
  _$jscoverage['/uri.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['634'] = [];
  _$jscoverage['/uri.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['658'] = [];
  _$jscoverage['/uri.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['659'] = [];
  _$jscoverage['/uri.js'].branchData['659'][1] = new BranchData();
}
_$jscoverage['/uri.js'].branchData['659'][1].init(42, 30, 'url.match(URI_SPLIT_REG) || []');
function visit642_659_1(result) {
  _$jscoverage['/uri.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['658'][1].init(15, 9, 'url || \'\'');
function visit641_658_1(result) {
  _$jscoverage['/uri.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['634'][1].init(21, 36, 'hostname && !S.startsWith(path, \'/\')');
function visit640_634_1(result) {
  _$jscoverage['/uri.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['589'][1].init(66, 102, 'equalsIgnoreCase(self.scheme, other.scheme) && equalsIgnoreCase(self.port, other.port)');
function visit639_589_1(result) {
  _$jscoverage['/uri.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['588'][1].init(97, 169, 'equalsIgnoreCase(self.hostname, other.hostname) && equalsIgnoreCase(self.scheme, other.scheme) && equalsIgnoreCase(self.port, other.port)');
function visit638_588_1(result) {
  _$jscoverage['/uri.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['573'][1].init(46, 27, 'S.startsWith(fragment, \'#\')');
function visit637_573_1(result) {
  _$jscoverage['/uri.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['541'][1].init(21, 24, 'S.startsWith(query, \'?\')');
function visit636_541_1(result) {
  _$jscoverage['/uri.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['540'][1].init(17, 25, 'typeof query === \'string\'');
function visit635_540_1(result) {
  _$jscoverage['/uri.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['435'][1].init(1637, 26, 'override || relativeUri[o]');
function visit634_435_1(result) {
  _$jscoverage['/uri.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['431'][1].init(25, 40, 'override || relativeUri.query.toString()');
function visit633_431_1(result) {
  _$jscoverage['/uri.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['430'][1].init(1398, 13, 'o === \'query\'');
function visit632_430_1(result) {
  _$jscoverage['/uri.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['421'][1].init(195, 21, 'lastSlashIndex !== -1');
function visit631_421_1(result) {
  _$jscoverage['/uri.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['418'][1].init(242, 11, 'target.path');
function visit630_418_1(result) {
  _$jscoverage['/uri.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['415'][1].init(37, 31, 'target.hostname && !target.path');
function visit629_415_1(result) {
  _$jscoverage['/uri.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['414'][1].init(154, 24, '!S.startsWith(path, \'/\')');
function visit628_414_1(result) {
  _$jscoverage['/uri.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['411'][1].init(82, 4, 'path');
function visit627_411_1(result) {
  _$jscoverage['/uri.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['407'][1].init(107, 8, 'override');
function visit626_407_1(result) {
  _$jscoverage['/uri.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['405'][1].init(21, 12, 'o === \'path\'');
function visit625_405_1(result) {
  _$jscoverage['/uri.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['394'][1].init(18, 31, 'typeof relativeUri === \'string\'');
function visit624_394_1(result) {
  _$jscoverage['/uri.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['340'][1].init(42, 15, 'key === \'query\'');
function visit623_340_1(result) {
  _$jscoverage['/uri.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['339'][1].init(17, 7, 'v || \'\'');
function visit622_339_1(result) {
  _$jscoverage['/uri.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['292'][1].init(14, 22, 'uriStr instanceof Uri');
function visit621_292_1(result) {
  _$jscoverage['/uri.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['268'][1].init(16, 41, 'str1.toLowerCase() === str2.toLowerCase()');
function visit620_268_1(result) {
  _$jscoverage['/uri.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['264'][1].init(16, 16, 'str.length === 1');
function visit619_264_1(result) {
  _$jscoverage['/uri.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['241'][1].init(21, 20, 'key instanceof Query');
function visit618_241_1(result) {
  _$jscoverage['/uri.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['234'][1].init(146, 26, 'currentValue === undefined');
function visit617_234_1(result) {
  _$jscoverage['/uri.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['230'][1].init(103, 23, 'typeof key === \'string\'');
function visit616_230_1(result) {
  _$jscoverage['/uri.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['211'][1].init(76, 3, 'key');
function visit615_211_1(result) {
  _$jscoverage['/uri.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['193'][1].init(21, 20, 'key instanceof Query');
function visit614_193_1(result) {
  _$jscoverage['/uri.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['190'][1].init(127, 23, 'typeof key === \'string\'');
function visit613_190_1(result) {
  _$jscoverage['/uri.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['163'][1].init(127, 3, 'key');
function visit612_163_1(result) {
  _$jscoverage['/uri.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['148'][1].init(127, 3, 'key');
function visit611_148_1(result) {
  _$jscoverage['/uri.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['130'][1].init(22, 23, 'S.isArray(_queryMap[k])');
function visit610_130_1(result) {
  _$jscoverage['/uri.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['112'][1].init(56, 11, 'query || \'\'');
function visit609_112_1(result) {
  _$jscoverage['/uri.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['90'][1].init(23, 11, 'query || \'\'');
function visit608_90_1(result) {
  _$jscoverage['/uri.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['79'][1].init(13, 15, '!self._queryMap');
function visit607_79_1(result) {
  _$jscoverage['/uri.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/uri.js'].functionData[0]++;
  _$jscoverage['/uri.js'].lineData[7]++;
  var logger = S.getLogger('s/uri');
  _$jscoverage['/uri.js'].lineData[8]++;
  var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g, reDisallowedInPathName = /[#\?]/g, reDisallowedInQuery = /[#@]/g, reDisallowedInFragment = /#/g, URI_SPLIT_REG = new RegExp('^' + '(?:([\\w\\d+.-]+):)?' + '(?://' + '(?:([^/?#@]*)@)?' + '(' + '[\\w\\d\\-\\u0100-\\uffff.+%]*' + '|' + '\\[[^\\]]+\\]' + ')' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$'), Path = S.Path, REG_INFO = {
  scheme: 1, 
  userInfo: 2, 
  hostname: 3, 
  port: 4, 
  path: 5, 
  query: 6, 
  fragment: 7};
  _$jscoverage['/uri.js'].lineData[78]++;
  function parseQuery(self) {
    _$jscoverage['/uri.js'].functionData[1]++;
    _$jscoverage['/uri.js'].lineData[79]++;
    if (visit607_79_1(!self._queryMap)) {
      _$jscoverage['/uri.js'].lineData[80]++;
      self._queryMap = S.unparam(self._query);
    }
  }
  _$jscoverage['/uri.js'].lineData[89]++;
  function Query(query) {
    _$jscoverage['/uri.js'].functionData[2]++;
    _$jscoverage['/uri.js'].lineData[90]++;
    this._query = visit608_90_1(query || '');
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
  self._query = visit609_112_1(query || '');
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
    if (visit610_130_1(S.isArray(_queryMap[k]))) {
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
  if (visit611_148_1(key)) {
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
  if (visit612_163_1(key)) {
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
  if (visit613_190_1(typeof key === 'string')) {
    _$jscoverage['/uri.js'].lineData[191]++;
    self._queryMap[key] = value;
  } else {
    _$jscoverage['/uri.js'].lineData[193]++;
    if (visit614_193_1(key instanceof Query)) {
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
  if (visit615_211_1(key)) {
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
  if (visit616_230_1(typeof key === 'string')) {
    _$jscoverage['/uri.js'].lineData[231]++;
    parseQuery(self);
    _$jscoverage['/uri.js'].lineData[232]++;
    _queryMap = self._queryMap;
    _$jscoverage['/uri.js'].lineData[233]++;
    currentValue = _queryMap[key];
    _$jscoverage['/uri.js'].lineData[234]++;
    if (visit617_234_1(currentValue === undefined)) {
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
    if (visit618_241_1(key instanceof Query)) {
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
    return visit619_264_1(str.length === 1) ? '0' + str : str;
  }
  _$jscoverage['/uri.js'].lineData[267]++;
  function equalsIgnoreCase(str1, str2) {
    _$jscoverage['/uri.js'].functionData[15]++;
    _$jscoverage['/uri.js'].lineData[268]++;
    return visit620_268_1(str1.toLowerCase() === str2.toLowerCase());
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
  _$jscoverage['/uri.js'].lineData[290]++;
  function Uri(uriStr) {
    _$jscoverage['/uri.js'].functionData[18]++;
    _$jscoverage['/uri.js'].lineData[292]++;
    if (visit621_292_1(uriStr instanceof Uri)) {
      _$jscoverage['/uri.js'].lineData[293]++;
      return uriStr.clone();
    }
    _$jscoverage['/uri.js'].lineData[296]++;
    var components, self = this;
    _$jscoverage['/uri.js'].lineData[298]++;
    S.mix(self, {
  scheme: '', 
  userInfo: '', 
  hostname: '', 
  port: '', 
  path: '', 
  query: '', 
  fragment: ''});
    _$jscoverage['/uri.js'].lineData[336]++;
    components = Uri.getComponents(uriStr);
    _$jscoverage['/uri.js'].lineData[338]++;
    S.each(components, function(v, key) {
  _$jscoverage['/uri.js'].functionData[19]++;
  _$jscoverage['/uri.js'].lineData[339]++;
  v = visit622_339_1(v || '');
  _$jscoverage['/uri.js'].lineData[340]++;
  if (visit623_340_1(key === 'query')) {
    _$jscoverage['/uri.js'].lineData[342]++;
    self.query = new Query(v);
  } else {
    _$jscoverage['/uri.js'].lineData[345]++;
    try {
      _$jscoverage['/uri.js'].lineData[346]++;
      v = S.urlDecode(v);
    }    catch (e) {
  _$jscoverage['/uri.js'].lineData[348]++;
  logger.error(e + 'urlDecode error : ' + v);
}
    _$jscoverage['/uri.js'].lineData[351]++;
    self[key] = v;
  }
});
    _$jscoverage['/uri.js'].lineData[355]++;
    return self;
  }
  _$jscoverage['/uri.js'].lineData[358]++;
  Uri.prototype = {
  constructor: Uri, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[20]++;
  _$jscoverage['/uri.js'].lineData[366]++;
  var uri = new Uri(), self = this;
  _$jscoverage['/uri.js'].lineData[367]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[21]++;
  _$jscoverage['/uri.js'].lineData[368]++;
  uri[key] = self[key];
});
  _$jscoverage['/uri.js'].lineData[370]++;
  uri.query = uri.query.clone();
  _$jscoverage['/uri.js'].lineData[371]++;
  return uri;
}, 
  resolve: function(relativeUri) {
  _$jscoverage['/uri.js'].functionData[22]++;
  _$jscoverage['/uri.js'].lineData[394]++;
  if (visit624_394_1(typeof relativeUri === 'string')) {
    _$jscoverage['/uri.js'].lineData[395]++;
    relativeUri = new Uri(relativeUri);
  }
  _$jscoverage['/uri.js'].lineData[398]++;
  var self = this, override = 0, lastSlashIndex, order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'], target = self.clone();
  _$jscoverage['/uri.js'].lineData[404]++;
  S.each(order, function(o) {
  _$jscoverage['/uri.js'].functionData[23]++;
  _$jscoverage['/uri.js'].lineData[405]++;
  if (visit625_405_1(o === 'path')) {
    _$jscoverage['/uri.js'].lineData[407]++;
    if (visit626_407_1(override)) {
      _$jscoverage['/uri.js'].lineData[408]++;
      target[o] = relativeUri[o];
    } else {
      _$jscoverage['/uri.js'].lineData[410]++;
      var path = relativeUri.path;
      _$jscoverage['/uri.js'].lineData[411]++;
      if (visit627_411_1(path)) {
        _$jscoverage['/uri.js'].lineData[413]++;
        override = 1;
        _$jscoverage['/uri.js'].lineData[414]++;
        if (visit628_414_1(!S.startsWith(path, '/'))) {
          _$jscoverage['/uri.js'].lineData[415]++;
          if (visit629_415_1(target.hostname && !target.path)) {
            _$jscoverage['/uri.js'].lineData[417]++;
            path = '/' + path;
          } else {
            _$jscoverage['/uri.js'].lineData[418]++;
            if (visit630_418_1(target.path)) {
              _$jscoverage['/uri.js'].lineData[420]++;
              lastSlashIndex = target.path.lastIndexOf('/');
              _$jscoverage['/uri.js'].lineData[421]++;
              if (visit631_421_1(lastSlashIndex !== -1)) {
                _$jscoverage['/uri.js'].lineData[422]++;
                path = target.path.slice(0, lastSlashIndex + 1) + path;
              }
            }
          }
        }
        _$jscoverage['/uri.js'].lineData[427]++;
        target.path = Path.normalize(path);
      }
    }
  } else {
    _$jscoverage['/uri.js'].lineData[430]++;
    if (visit632_430_1(o === 'query')) {
      _$jscoverage['/uri.js'].lineData[431]++;
      if (visit633_431_1(override || relativeUri.query.toString())) {
        _$jscoverage['/uri.js'].lineData[432]++;
        target.query = relativeUri.query.clone();
        _$jscoverage['/uri.js'].lineData[433]++;
        override = 1;
      }
    } else {
      _$jscoverage['/uri.js'].lineData[435]++;
      if (visit634_435_1(override || relativeUri[o])) {
        _$jscoverage['/uri.js'].lineData[436]++;
        target[o] = relativeUri[o];
        _$jscoverage['/uri.js'].lineData[437]++;
        override = 1;
      }
    }
  }
});
  _$jscoverage['/uri.js'].lineData[441]++;
  return target;
}, 
  getScheme: function() {
  _$jscoverage['/uri.js'].functionData[24]++;
  _$jscoverage['/uri.js'].lineData[449]++;
  return this.scheme;
}, 
  setScheme: function(scheme) {
  _$jscoverage['/uri.js'].functionData[25]++;
  _$jscoverage['/uri.js'].lineData[458]++;
  this.scheme = scheme;
  _$jscoverage['/uri.js'].lineData[459]++;
  return this;
}, 
  getHostname: function() {
  _$jscoverage['/uri.js'].functionData[26]++;
  _$jscoverage['/uri.js'].lineData[467]++;
  return this.hostname;
}, 
  setHostname: function(hostname) {
  _$jscoverage['/uri.js'].functionData[27]++;
  _$jscoverage['/uri.js'].lineData[476]++;
  this.hostname = hostname;
  _$jscoverage['/uri.js'].lineData[477]++;
  return this;
}, 
  'setUserInfo': function(userInfo) {
  _$jscoverage['/uri.js'].functionData[28]++;
  _$jscoverage['/uri.js'].lineData[486]++;
  this.userInfo = userInfo;
  _$jscoverage['/uri.js'].lineData[487]++;
  return this;
}, 
  getUserInfo: function() {
  _$jscoverage['/uri.js'].functionData[29]++;
  _$jscoverage['/uri.js'].lineData[495]++;
  return this.userInfo;
}, 
  'setPort': function(port) {
  _$jscoverage['/uri.js'].functionData[30]++;
  _$jscoverage['/uri.js'].lineData[504]++;
  this.port = port;
  _$jscoverage['/uri.js'].lineData[505]++;
  return this;
}, 
  'getPort': function() {
  _$jscoverage['/uri.js'].functionData[31]++;
  _$jscoverage['/uri.js'].lineData[513]++;
  return this.port;
}, 
  setPath: function(path) {
  _$jscoverage['/uri.js'].functionData[32]++;
  _$jscoverage['/uri.js'].lineData[522]++;
  this.path = path;
  _$jscoverage['/uri.js'].lineData[523]++;
  return this;
}, 
  getPath: function() {
  _$jscoverage['/uri.js'].functionData[33]++;
  _$jscoverage['/uri.js'].lineData[531]++;
  return this.path;
}, 
  'setQuery': function(query) {
  _$jscoverage['/uri.js'].functionData[34]++;
  _$jscoverage['/uri.js'].lineData[540]++;
  if (visit635_540_1(typeof query === 'string')) {
    _$jscoverage['/uri.js'].lineData[541]++;
    if (visit636_541_1(S.startsWith(query, '?'))) {
      _$jscoverage['/uri.js'].lineData[542]++;
      query = query.slice(1);
    }
    _$jscoverage['/uri.js'].lineData[544]++;
    query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
  }
  _$jscoverage['/uri.js'].lineData[546]++;
  this.query = query;
  _$jscoverage['/uri.js'].lineData[547]++;
  return this;
}, 
  getQuery: function() {
  _$jscoverage['/uri.js'].functionData[35]++;
  _$jscoverage['/uri.js'].lineData[555]++;
  return this.query;
}, 
  getFragment: function() {
  _$jscoverage['/uri.js'].functionData[36]++;
  _$jscoverage['/uri.js'].lineData[563]++;
  return this.fragment;
}, 
  'setFragment': function(fragment) {
  _$jscoverage['/uri.js'].functionData[37]++;
  _$jscoverage['/uri.js'].lineData[572]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[573]++;
  if (visit637_573_1(S.startsWith(fragment, '#'))) {
    _$jscoverage['/uri.js'].lineData[574]++;
    fragment = fragment.slice(1);
  }
  _$jscoverage['/uri.js'].lineData[576]++;
  self.fragment = fragment;
  _$jscoverage['/uri.js'].lineData[577]++;
  return self;
}, 
  isSameOriginAs: function(other) {
  _$jscoverage['/uri.js'].functionData[38]++;
  _$jscoverage['/uri.js'].lineData[586]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[588]++;
  return visit638_588_1(equalsIgnoreCase(self.hostname, other.hostname) && visit639_589_1(equalsIgnoreCase(self.scheme, other.scheme) && equalsIgnoreCase(self.port, other.port)));
}, 
  toString: function(serializeArray) {
  _$jscoverage['/uri.js'].functionData[39]++;
  _$jscoverage['/uri.js'].lineData[603]++;
  var out = [], self = this, scheme, hostname, path, port, fragment, query, userInfo;
  _$jscoverage['/uri.js'].lineData[613]++;
  if ((scheme = self.scheme)) {
    _$jscoverage['/uri.js'].lineData[614]++;
    out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
    _$jscoverage['/uri.js'].lineData[615]++;
    out.push(':');
  }
  _$jscoverage['/uri.js'].lineData[618]++;
  if ((hostname = self.hostname)) {
    _$jscoverage['/uri.js'].lineData[619]++;
    out.push('//');
    _$jscoverage['/uri.js'].lineData[620]++;
    if ((userInfo = self.userInfo)) {
      _$jscoverage['/uri.js'].lineData[621]++;
      out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
      _$jscoverage['/uri.js'].lineData[622]++;
      out.push('@');
    }
    _$jscoverage['/uri.js'].lineData[625]++;
    out.push(encodeURIComponent(hostname));
    _$jscoverage['/uri.js'].lineData[627]++;
    if ((port = self.port)) {
      _$jscoverage['/uri.js'].lineData[628]++;
      out.push(':');
      _$jscoverage['/uri.js'].lineData[629]++;
      out.push(port);
    }
  }
  _$jscoverage['/uri.js'].lineData[633]++;
  if ((path = self.path)) {
    _$jscoverage['/uri.js'].lineData[634]++;
    if (visit640_634_1(hostname && !S.startsWith(path, '/'))) {
      _$jscoverage['/uri.js'].lineData[635]++;
      path = '/' + path;
    }
    _$jscoverage['/uri.js'].lineData[637]++;
    path = Path.normalize(path);
    _$jscoverage['/uri.js'].lineData[638]++;
    out.push(encodeSpecialChars(path, reDisallowedInPathName));
  }
  _$jscoverage['/uri.js'].lineData[641]++;
  if ((query = (self.query.toString.call(self.query, serializeArray)))) {
    _$jscoverage['/uri.js'].lineData[642]++;
    out.push('?');
    _$jscoverage['/uri.js'].lineData[643]++;
    out.push(query);
  }
  _$jscoverage['/uri.js'].lineData[646]++;
  if ((fragment = self.fragment)) {
    _$jscoverage['/uri.js'].lineData[647]++;
    out.push('#');
    _$jscoverage['/uri.js'].lineData[648]++;
    out.push(encodeSpecialChars(fragment, reDisallowedInFragment));
  }
  _$jscoverage['/uri.js'].lineData[651]++;
  return out.join('');
}};
  _$jscoverage['/uri.js'].lineData[655]++;
  Uri.Query = Query;
  _$jscoverage['/uri.js'].lineData[657]++;
  Uri.getComponents = function(url) {
  _$jscoverage['/uri.js'].functionData[40]++;
  _$jscoverage['/uri.js'].lineData[658]++;
  url = visit641_658_1(url || '');
  _$jscoverage['/uri.js'].lineData[659]++;
  var m = visit642_659_1(url.match(URI_SPLIT_REG) || []), ret = {};
  _$jscoverage['/uri.js'].lineData[661]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[41]++;
  _$jscoverage['/uri.js'].lineData[662]++;
  ret[key] = m[index];
});
  _$jscoverage['/uri.js'].lineData[664]++;
  return ret;
};
  _$jscoverage['/uri.js'].lineData[667]++;
  S.Uri = Uri;
})(KISSY);
