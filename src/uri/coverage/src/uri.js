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
  _$jscoverage['/uri.js'].lineData[10] = 0;
  _$jscoverage['/uri.js'].lineData[11] = 0;
  _$jscoverage['/uri.js'].lineData[12] = 0;
  _$jscoverage['/uri.js'].lineData[80] = 0;
  _$jscoverage['/uri.js'].lineData[81] = 0;
  _$jscoverage['/uri.js'].lineData[82] = 0;
  _$jscoverage['/uri.js'].lineData[91] = 0;
  _$jscoverage['/uri.js'].lineData[92] = 0;
  _$jscoverage['/uri.js'].lineData[95] = 0;
  _$jscoverage['/uri.js'].lineData[103] = 0;
  _$jscoverage['/uri.js'].lineData[112] = 0;
  _$jscoverage['/uri.js'].lineData[113] = 0;
  _$jscoverage['/uri.js'].lineData[114] = 0;
  _$jscoverage['/uri.js'].lineData[115] = 0;
  _$jscoverage['/uri.js'].lineData[123] = 0;
  _$jscoverage['/uri.js'].lineData[127] = 0;
  _$jscoverage['/uri.js'].lineData[128] = 0;
  _$jscoverage['/uri.js'].lineData[129] = 0;
  _$jscoverage['/uri.js'].lineData[131] = 0;
  _$jscoverage['/uri.js'].lineData[132] = 0;
  _$jscoverage['/uri.js'].lineData[134] = 0;
  _$jscoverage['/uri.js'].lineData[138] = 0;
  _$jscoverage['/uri.js'].lineData[146] = 0;
  _$jscoverage['/uri.js'].lineData[147] = 0;
  _$jscoverage['/uri.js'].lineData[148] = 0;
  _$jscoverage['/uri.js'].lineData[149] = 0;
  _$jscoverage['/uri.js'].lineData[150] = 0;
  _$jscoverage['/uri.js'].lineData[152] = 0;
  _$jscoverage['/uri.js'].lineData[161] = 0;
  _$jscoverage['/uri.js'].lineData[162] = 0;
  _$jscoverage['/uri.js'].lineData[163] = 0;
  _$jscoverage['/uri.js'].lineData[164] = 0;
  _$jscoverage['/uri.js'].lineData[165] = 0;
  _$jscoverage['/uri.js'].lineData[167] = 0;
  _$jscoverage['/uri.js'].lineData[176] = 0;
  _$jscoverage['/uri.js'].lineData[177] = 0;
  _$jscoverage['/uri.js'].lineData[178] = 0;
  _$jscoverage['/uri.js'].lineData[188] = 0;
  _$jscoverage['/uri.js'].lineData[189] = 0;
  _$jscoverage['/uri.js'].lineData[190] = 0;
  _$jscoverage['/uri.js'].lineData[191] = 0;
  _$jscoverage['/uri.js'].lineData[192] = 0;
  _$jscoverage['/uri.js'].lineData[194] = 0;
  _$jscoverage['/uri.js'].lineData[195] = 0;
  _$jscoverage['/uri.js'].lineData[197] = 0;
  _$jscoverage['/uri.js'].lineData[198] = 0;
  _$jscoverage['/uri.js'].lineData[201] = 0;
  _$jscoverage['/uri.js'].lineData[210] = 0;
  _$jscoverage['/uri.js'].lineData[211] = 0;
  _$jscoverage['/uri.js'].lineData[212] = 0;
  _$jscoverage['/uri.js'].lineData[213] = 0;
  _$jscoverage['/uri.js'].lineData[215] = 0;
  _$jscoverage['/uri.js'].lineData[217] = 0;
  _$jscoverage['/uri.js'].lineData[228] = 0;
  _$jscoverage['/uri.js'].lineData[231] = 0;
  _$jscoverage['/uri.js'].lineData[232] = 0;
  _$jscoverage['/uri.js'].lineData[233] = 0;
  _$jscoverage['/uri.js'].lineData[234] = 0;
  _$jscoverage['/uri.js'].lineData[235] = 0;
  _$jscoverage['/uri.js'].lineData[236] = 0;
  _$jscoverage['/uri.js'].lineData[238] = 0;
  _$jscoverage['/uri.js'].lineData[240] = 0;
  _$jscoverage['/uri.js'].lineData[242] = 0;
  _$jscoverage['/uri.js'].lineData[243] = 0;
  _$jscoverage['/uri.js'].lineData[245] = 0;
  _$jscoverage['/uri.js'].lineData[246] = 0;
  _$jscoverage['/uri.js'].lineData[249] = 0;
  _$jscoverage['/uri.js'].lineData[258] = 0;
  _$jscoverage['/uri.js'].lineData[259] = 0;
  _$jscoverage['/uri.js'].lineData[260] = 0;
  _$jscoverage['/uri.js'].lineData[264] = 0;
  _$jscoverage['/uri.js'].lineData[265] = 0;
  _$jscoverage['/uri.js'].lineData[268] = 0;
  _$jscoverage['/uri.js'].lineData[269] = 0;
  _$jscoverage['/uri.js'].lineData[275] = 0;
  _$jscoverage['/uri.js'].lineData[280] = 0;
  _$jscoverage['/uri.js'].lineData[281] = 0;
  _$jscoverage['/uri.js'].lineData[291] = 0;
  _$jscoverage['/uri.js'].lineData[293] = 0;
  _$jscoverage['/uri.js'].lineData[294] = 0;
  _$jscoverage['/uri.js'].lineData[297] = 0;
  _$jscoverage['/uri.js'].lineData[300] = 0;
  _$jscoverage['/uri.js'].lineData[338] = 0;
  _$jscoverage['/uri.js'].lineData[340] = 0;
  _$jscoverage['/uri.js'].lineData[341] = 0;
  _$jscoverage['/uri.js'].lineData[342] = 0;
  _$jscoverage['/uri.js'].lineData[344] = 0;
  _$jscoverage['/uri.js'].lineData[347] = 0;
  _$jscoverage['/uri.js'].lineData[348] = 0;
  _$jscoverage['/uri.js'].lineData[350] = 0;
  _$jscoverage['/uri.js'].lineData[353] = 0;
  _$jscoverage['/uri.js'].lineData[357] = 0;
  _$jscoverage['/uri.js'].lineData[360] = 0;
  _$jscoverage['/uri.js'].lineData[368] = 0;
  _$jscoverage['/uri.js'].lineData[369] = 0;
  _$jscoverage['/uri.js'].lineData[370] = 0;
  _$jscoverage['/uri.js'].lineData[372] = 0;
  _$jscoverage['/uri.js'].lineData[373] = 0;
  _$jscoverage['/uri.js'].lineData[395] = 0;
  _$jscoverage['/uri.js'].lineData[396] = 0;
  _$jscoverage['/uri.js'].lineData[399] = 0;
  _$jscoverage['/uri.js'].lineData[405] = 0;
  _$jscoverage['/uri.js'].lineData[406] = 0;
  _$jscoverage['/uri.js'].lineData[408] = 0;
  _$jscoverage['/uri.js'].lineData[409] = 0;
  _$jscoverage['/uri.js'].lineData[411] = 0;
  _$jscoverage['/uri.js'].lineData[412] = 0;
  _$jscoverage['/uri.js'].lineData[414] = 0;
  _$jscoverage['/uri.js'].lineData[415] = 0;
  _$jscoverage['/uri.js'].lineData[416] = 0;
  _$jscoverage['/uri.js'].lineData[418] = 0;
  _$jscoverage['/uri.js'].lineData[419] = 0;
  _$jscoverage['/uri.js'].lineData[421] = 0;
  _$jscoverage['/uri.js'].lineData[422] = 0;
  _$jscoverage['/uri.js'].lineData[423] = 0;
  _$jscoverage['/uri.js'].lineData[428] = 0;
  _$jscoverage['/uri.js'].lineData[431] = 0;
  _$jscoverage['/uri.js'].lineData[432] = 0;
  _$jscoverage['/uri.js'].lineData[433] = 0;
  _$jscoverage['/uri.js'].lineData[434] = 0;
  _$jscoverage['/uri.js'].lineData[436] = 0;
  _$jscoverage['/uri.js'].lineData[437] = 0;
  _$jscoverage['/uri.js'].lineData[438] = 0;
  _$jscoverage['/uri.js'].lineData[442] = 0;
  _$jscoverage['/uri.js'].lineData[450] = 0;
  _$jscoverage['/uri.js'].lineData[459] = 0;
  _$jscoverage['/uri.js'].lineData[460] = 0;
  _$jscoverage['/uri.js'].lineData[468] = 0;
  _$jscoverage['/uri.js'].lineData[477] = 0;
  _$jscoverage['/uri.js'].lineData[478] = 0;
  _$jscoverage['/uri.js'].lineData[487] = 0;
  _$jscoverage['/uri.js'].lineData[488] = 0;
  _$jscoverage['/uri.js'].lineData[496] = 0;
  _$jscoverage['/uri.js'].lineData[505] = 0;
  _$jscoverage['/uri.js'].lineData[506] = 0;
  _$jscoverage['/uri.js'].lineData[514] = 0;
  _$jscoverage['/uri.js'].lineData[523] = 0;
  _$jscoverage['/uri.js'].lineData[524] = 0;
  _$jscoverage['/uri.js'].lineData[532] = 0;
  _$jscoverage['/uri.js'].lineData[541] = 0;
  _$jscoverage['/uri.js'].lineData[542] = 0;
  _$jscoverage['/uri.js'].lineData[543] = 0;
  _$jscoverage['/uri.js'].lineData[545] = 0;
  _$jscoverage['/uri.js'].lineData[547] = 0;
  _$jscoverage['/uri.js'].lineData[548] = 0;
  _$jscoverage['/uri.js'].lineData[556] = 0;
  _$jscoverage['/uri.js'].lineData[564] = 0;
  _$jscoverage['/uri.js'].lineData[573] = 0;
  _$jscoverage['/uri.js'].lineData[574] = 0;
  _$jscoverage['/uri.js'].lineData[575] = 0;
  _$jscoverage['/uri.js'].lineData[577] = 0;
  _$jscoverage['/uri.js'].lineData[578] = 0;
  _$jscoverage['/uri.js'].lineData[587] = 0;
  _$jscoverage['/uri.js'].lineData[589] = 0;
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
  _$jscoverage['/uri.js'].branchData['81'] = [];
  _$jscoverage['/uri.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['92'] = [];
  _$jscoverage['/uri.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['113'] = [];
  _$jscoverage['/uri.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['131'] = [];
  _$jscoverage['/uri.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['149'] = [];
  _$jscoverage['/uri.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['164'] = [];
  _$jscoverage['/uri.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['191'] = [];
  _$jscoverage['/uri.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['194'] = [];
  _$jscoverage['/uri.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['212'] = [];
  _$jscoverage['/uri.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['231'] = [];
  _$jscoverage['/uri.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['235'] = [];
  _$jscoverage['/uri.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['242'] = [];
  _$jscoverage['/uri.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['265'] = [];
  _$jscoverage['/uri.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['269'] = [];
  _$jscoverage['/uri.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['293'] = [];
  _$jscoverage['/uri.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['341'] = [];
  _$jscoverage['/uri.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['342'] = [];
  _$jscoverage['/uri.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['395'] = [];
  _$jscoverage['/uri.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['406'] = [];
  _$jscoverage['/uri.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['408'] = [];
  _$jscoverage['/uri.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['412'] = [];
  _$jscoverage['/uri.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['415'] = [];
  _$jscoverage['/uri.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['416'] = [];
  _$jscoverage['/uri.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['419'] = [];
  _$jscoverage['/uri.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['422'] = [];
  _$jscoverage['/uri.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['431'] = [];
  _$jscoverage['/uri.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['432'] = [];
  _$jscoverage['/uri.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['436'] = [];
  _$jscoverage['/uri.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['541'] = [];
  _$jscoverage['/uri.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['542'] = [];
  _$jscoverage['/uri.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['574'] = [];
  _$jscoverage['/uri.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['589'] = [];
  _$jscoverage['/uri.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['590'] = [];
  _$jscoverage['/uri.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['634'] = [];
  _$jscoverage['/uri.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['658'] = [];
  _$jscoverage['/uri.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['659'] = [];
  _$jscoverage['/uri.js'].branchData['659'][1] = new BranchData();
}
_$jscoverage['/uri.js'].branchData['659'][1].init(44, 30, 'url.match(URI_SPLIT_REG) || []');
function visit36_659_1(result) {
  _$jscoverage['/uri.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['658'][1].init(16, 9, 'url || \'\'');
function visit35_658_1(result) {
  _$jscoverage['/uri.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['634'][1].init(22, 39, 'hostname && !util.startsWith(path, \'/\')');
function visit34_634_1(result) {
  _$jscoverage['/uri.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['590'][1].init(67, 103, 'equalsIgnoreCase(self.scheme, other.scheme) && equalsIgnoreCase(self.port, other.port)');
function visit33_590_1(result) {
  _$jscoverage['/uri.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['589'][1].init(100, 171, 'equalsIgnoreCase(self.hostname, other.hostname) && equalsIgnoreCase(self.scheme, other.scheme) && equalsIgnoreCase(self.port, other.port)');
function visit32_589_1(result) {
  _$jscoverage['/uri.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['574'][1].init(48, 30, 'util.startsWith(fragment, \'#\')');
function visit31_574_1(result) {
  _$jscoverage['/uri.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['542'][1].init(22, 27, 'util.startsWith(query, \'?\')');
function visit30_542_1(result) {
  _$jscoverage['/uri.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['541'][1].init(18, 25, 'typeof query === \'string\'');
function visit29_541_1(result) {
  _$jscoverage['/uri.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['436'][1].init(1671, 26, 'override || relativeUri[o]');
function visit28_436_1(result) {
  _$jscoverage['/uri.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['432'][1].init(26, 40, 'override || relativeUri.query.toString()');
function visit27_432_1(result) {
  _$jscoverage['/uri.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['431'][1].init(1427, 13, 'o === \'query\'');
function visit26_431_1(result) {
  _$jscoverage['/uri.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['422'][1].init(198, 21, 'lastSlashIndex !== -1');
function visit25_422_1(result) {
  _$jscoverage['/uri.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['419'][1].init(246, 11, 'target.path');
function visit24_419_1(result) {
  _$jscoverage['/uri.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['416'][1].init(38, 31, 'target.hostname && !target.path');
function visit23_416_1(result) {
  _$jscoverage['/uri.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['415'][1].init(157, 27, '!util.startsWith(path, \'/\')');
function visit22_415_1(result) {
  _$jscoverage['/uri.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['412'][1].init(84, 4, 'path');
function visit21_412_1(result) {
  _$jscoverage['/uri.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['408'][1].init(109, 8, 'override');
function visit20_408_1(result) {
  _$jscoverage['/uri.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['406'][1].init(22, 12, 'o === \'path\'');
function visit19_406_1(result) {
  _$jscoverage['/uri.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['395'][1].init(20, 31, 'typeof relativeUri === \'string\'');
function visit18_395_1(result) {
  _$jscoverage['/uri.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['342'][1].init(44, 15, 'key === \'query\'');
function visit17_342_1(result) {
  _$jscoverage['/uri.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['341'][1].init(18, 7, 'v || \'\'');
function visit16_341_1(result) {
  _$jscoverage['/uri.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['293'][1].init(16, 22, 'uriStr instanceof Uri');
function visit15_293_1(result) {
  _$jscoverage['/uri.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['269'][1].init(17, 41, 'str1.toLowerCase() === str2.toLowerCase()');
function visit14_269_1(result) {
  _$jscoverage['/uri.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['265'][1].init(17, 16, 'str.length === 1');
function visit13_265_1(result) {
  _$jscoverage['/uri.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['242'][1].init(22, 20, 'key instanceof Query');
function visit12_242_1(result) {
  _$jscoverage['/uri.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['235'][1].init(150, 26, 'currentValue === undefined');
function visit11_235_1(result) {
  _$jscoverage['/uri.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['231'][1].init(107, 23, 'typeof key === \'string\'');
function visit10_231_1(result) {
  _$jscoverage['/uri.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['212'][1].init(79, 3, 'key');
function visit9_212_1(result) {
  _$jscoverage['/uri.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['194'][1].init(22, 20, 'key instanceof Query');
function visit8_194_1(result) {
  _$jscoverage['/uri.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['191'][1].init(131, 23, 'typeof key === \'string\'');
function visit7_191_1(result) {
  _$jscoverage['/uri.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['164'][1].init(131, 3, 'key');
function visit6_164_1(result) {
  _$jscoverage['/uri.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['149'][1].init(131, 3, 'key');
function visit5_149_1(result) {
  _$jscoverage['/uri.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['131'][1].init(24, 26, 'util.isArray(_queryMap[k])');
function visit4_131_1(result) {
  _$jscoverage['/uri.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['113'][1].init(58, 11, 'query || \'\'');
function visit3_113_1(result) {
  _$jscoverage['/uri.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['92'][1].init(24, 11, 'query || \'\'');
function visit2_92_1(result) {
  _$jscoverage['/uri.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['81'][1].init(14, 15, '!self._queryMap');
function visit1_81_1(result) {
  _$jscoverage['/uri.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/uri.js'].functionData[0]++;
  _$jscoverage['/uri.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/uri.js'].lineData[10]++;
  var Path = require('path');
  _$jscoverage['/uri.js'].lineData[11]++;
  var logger = S.getLogger('s/uri');
  _$jscoverage['/uri.js'].lineData[12]++;
  var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g, reDisallowedInPathName = /[#\?]/g, reDisallowedInQuery = /[#@]/g, reDisallowedInFragment = /#/g, URI_SPLIT_REG = new RegExp('^' + '(?:([\\w\\d+.-]+):)?' + '(?://' + '(?:([^/?#@]*)@)?' + '(' + '[\\w\\d\\-\\u0100-\\uffff.+%]*' + '|' + '\\[[^\\]]+\\]' + ')' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$'), REG_INFO = {
  scheme: 1, 
  userInfo: 2, 
  hostname: 3, 
  port: 4, 
  path: 5, 
  query: 6, 
  fragment: 7};
  _$jscoverage['/uri.js'].lineData[80]++;
  function parseQuery(self) {
    _$jscoverage['/uri.js'].functionData[1]++;
    _$jscoverage['/uri.js'].lineData[81]++;
    if (visit1_81_1(!self._queryMap)) {
      _$jscoverage['/uri.js'].lineData[82]++;
      self._queryMap = util.unparam(self._query);
    }
  }
  _$jscoverage['/uri.js'].lineData[91]++;
  function Query(query) {
    _$jscoverage['/uri.js'].functionData[2]++;
    _$jscoverage['/uri.js'].lineData[92]++;
    this._query = visit2_92_1(query || '');
  }
  _$jscoverage['/uri.js'].lineData[95]++;
  Query.prototype = {
  constructor: Query, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[3]++;
  _$jscoverage['/uri.js'].lineData[103]++;
  return new Query(this.toString());
}, 
  reset: function(query) {
  _$jscoverage['/uri.js'].functionData[4]++;
  _$jscoverage['/uri.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[113]++;
  self._query = visit3_113_1(query || '');
  _$jscoverage['/uri.js'].lineData[114]++;
  self._queryMap = null;
  _$jscoverage['/uri.js'].lineData[115]++;
  return self;
}, 
  count: function() {
  _$jscoverage['/uri.js'].functionData[5]++;
  _$jscoverage['/uri.js'].lineData[123]++;
  var self = this, count = 0, _queryMap, k;
  _$jscoverage['/uri.js'].lineData[127]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[128]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[129]++;
  for (k in _queryMap) {
    _$jscoverage['/uri.js'].lineData[131]++;
    if (visit4_131_1(util.isArray(_queryMap[k]))) {
      _$jscoverage['/uri.js'].lineData[132]++;
      count += _queryMap[k].length;
    } else {
      _$jscoverage['/uri.js'].lineData[134]++;
      count++;
    }
  }
  _$jscoverage['/uri.js'].lineData[138]++;
  return count;
}, 
  has: function(key) {
  _$jscoverage['/uri.js'].functionData[6]++;
  _$jscoverage['/uri.js'].lineData[146]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[147]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[148]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[149]++;
  if (visit5_149_1(key)) {
    _$jscoverage['/uri.js'].lineData[150]++;
    return key in _queryMap;
  } else {
    _$jscoverage['/uri.js'].lineData[152]++;
    return !util.isEmptyObject(_queryMap);
  }
}, 
  get: function(key) {
  _$jscoverage['/uri.js'].functionData[7]++;
  _$jscoverage['/uri.js'].lineData[161]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[162]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[163]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[164]++;
  if (visit6_164_1(key)) {
    _$jscoverage['/uri.js'].lineData[165]++;
    return _queryMap[key];
  } else {
    _$jscoverage['/uri.js'].lineData[167]++;
    return _queryMap;
  }
}, 
  keys: function() {
  _$jscoverage['/uri.js'].functionData[8]++;
  _$jscoverage['/uri.js'].lineData[176]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[177]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[178]++;
  return util.keys(self._queryMap);
}, 
  set: function(key, value) {
  _$jscoverage['/uri.js'].functionData[9]++;
  _$jscoverage['/uri.js'].lineData[188]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[189]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[190]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[191]++;
  if (visit7_191_1(typeof key === 'string')) {
    _$jscoverage['/uri.js'].lineData[192]++;
    self._queryMap[key] = value;
  } else {
    _$jscoverage['/uri.js'].lineData[194]++;
    if (visit8_194_1(key instanceof Query)) {
      _$jscoverage['/uri.js'].lineData[195]++;
      key = key.get();
    }
    _$jscoverage['/uri.js'].lineData[197]++;
    util.each(key, function(v, k) {
  _$jscoverage['/uri.js'].functionData[10]++;
  _$jscoverage['/uri.js'].lineData[198]++;
  _queryMap[k] = v;
});
  }
  _$jscoverage['/uri.js'].lineData[201]++;
  return self;
}, 
  remove: function(key) {
  _$jscoverage['/uri.js'].functionData[11]++;
  _$jscoverage['/uri.js'].lineData[210]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[211]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[212]++;
  if (visit9_212_1(key)) {
    _$jscoverage['/uri.js'].lineData[213]++;
    delete self._queryMap[key];
  } else {
    _$jscoverage['/uri.js'].lineData[215]++;
    self._queryMap = {};
  }
  _$jscoverage['/uri.js'].lineData[217]++;
  return self;
}, 
  add: function(key, value) {
  _$jscoverage['/uri.js'].functionData[12]++;
  _$jscoverage['/uri.js'].lineData[228]++;
  var self = this, _queryMap, currentValue;
  _$jscoverage['/uri.js'].lineData[231]++;
  if (visit10_231_1(typeof key === 'string')) {
    _$jscoverage['/uri.js'].lineData[232]++;
    parseQuery(self);
    _$jscoverage['/uri.js'].lineData[233]++;
    _queryMap = self._queryMap;
    _$jscoverage['/uri.js'].lineData[234]++;
    currentValue = _queryMap[key];
    _$jscoverage['/uri.js'].lineData[235]++;
    if (visit11_235_1(currentValue === undefined)) {
      _$jscoverage['/uri.js'].lineData[236]++;
      currentValue = value;
    } else {
      _$jscoverage['/uri.js'].lineData[238]++;
      currentValue = [].concat(currentValue).concat(value);
    }
    _$jscoverage['/uri.js'].lineData[240]++;
    _queryMap[key] = currentValue;
  } else {
    _$jscoverage['/uri.js'].lineData[242]++;
    if (visit12_242_1(key instanceof Query)) {
      _$jscoverage['/uri.js'].lineData[243]++;
      key = key.get();
    }
    _$jscoverage['/uri.js'].lineData[245]++;
    for (var k in key) {
      _$jscoverage['/uri.js'].lineData[246]++;
      self.add(k, key[k]);
    }
  }
  _$jscoverage['/uri.js'].lineData[249]++;
  return self;
}, 
  toString: function(serializeArray) {
  _$jscoverage['/uri.js'].functionData[13]++;
  _$jscoverage['/uri.js'].lineData[258]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[259]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[260]++;
  return util.param(self._queryMap, undefined, undefined, serializeArray);
}};
  _$jscoverage['/uri.js'].lineData[264]++;
  function padding2(str) {
    _$jscoverage['/uri.js'].functionData[14]++;
    _$jscoverage['/uri.js'].lineData[265]++;
    return visit13_265_1(str.length === 1) ? '0' + str : str;
  }
  _$jscoverage['/uri.js'].lineData[268]++;
  function equalsIgnoreCase(str1, str2) {
    _$jscoverage['/uri.js'].functionData[15]++;
    _$jscoverage['/uri.js'].lineData[269]++;
    return visit14_269_1(str1.toLowerCase() === str2.toLowerCase());
  }
  _$jscoverage['/uri.js'].lineData[275]++;
  function encodeSpecialChars(str, specialCharsReg) {
    _$jscoverage['/uri.js'].functionData[16]++;
    _$jscoverage['/uri.js'].lineData[280]++;
    return encodeURI(str).replace(specialCharsReg, function(m) {
  _$jscoverage['/uri.js'].functionData[17]++;
  _$jscoverage['/uri.js'].lineData[281]++;
  return '%' + padding2(m.charCodeAt(0).toString(16));
});
  }
  _$jscoverage['/uri.js'].lineData[291]++;
  function Uri(uriStr) {
    _$jscoverage['/uri.js'].functionData[18]++;
    _$jscoverage['/uri.js'].lineData[293]++;
    if (visit15_293_1(uriStr instanceof Uri)) {
      _$jscoverage['/uri.js'].lineData[294]++;
      return uriStr.clone();
    }
    _$jscoverage['/uri.js'].lineData[297]++;
    var components, self = this;
    _$jscoverage['/uri.js'].lineData[300]++;
    util.mix(self, {
  scheme: '', 
  userInfo: '', 
  hostname: '', 
  port: '', 
  path: '', 
  query: '', 
  fragment: ''});
    _$jscoverage['/uri.js'].lineData[338]++;
    components = Uri.getComponents(uriStr);
    _$jscoverage['/uri.js'].lineData[340]++;
    util.each(components, function(v, key) {
  _$jscoverage['/uri.js'].functionData[19]++;
  _$jscoverage['/uri.js'].lineData[341]++;
  v = visit16_341_1(v || '');
  _$jscoverage['/uri.js'].lineData[342]++;
  if (visit17_342_1(key === 'query')) {
    _$jscoverage['/uri.js'].lineData[344]++;
    self.query = new Query(v);
  } else {
    _$jscoverage['/uri.js'].lineData[347]++;
    try {
      _$jscoverage['/uri.js'].lineData[348]++;
      v = util.urlDecode(v);
    }    catch (e) {
  _$jscoverage['/uri.js'].lineData[350]++;
  logger.error(e + 'urlDecode error : ' + v);
}
    _$jscoverage['/uri.js'].lineData[353]++;
    self[key] = v;
  }
});
    _$jscoverage['/uri.js'].lineData[357]++;
    return self;
  }
  _$jscoverage['/uri.js'].lineData[360]++;
  Uri.prototype = {
  constructor: Uri, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[20]++;
  _$jscoverage['/uri.js'].lineData[368]++;
  var uri = new Uri(), self = this;
  _$jscoverage['/uri.js'].lineData[369]++;
  util.each(REG_INFO, function(index, key) {
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
  _$jscoverage['/uri.js'].lineData[395]++;
  if (visit18_395_1(typeof relativeUri === 'string')) {
    _$jscoverage['/uri.js'].lineData[396]++;
    relativeUri = new Uri(relativeUri);
  }
  _$jscoverage['/uri.js'].lineData[399]++;
  var self = this, override = 0, lastSlashIndex, order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'], target = self.clone();
  _$jscoverage['/uri.js'].lineData[405]++;
  util.each(order, function(o) {
  _$jscoverage['/uri.js'].functionData[23]++;
  _$jscoverage['/uri.js'].lineData[406]++;
  if (visit19_406_1(o === 'path')) {
    _$jscoverage['/uri.js'].lineData[408]++;
    if (visit20_408_1(override)) {
      _$jscoverage['/uri.js'].lineData[409]++;
      target[o] = relativeUri[o];
    } else {
      _$jscoverage['/uri.js'].lineData[411]++;
      var path = relativeUri.path;
      _$jscoverage['/uri.js'].lineData[412]++;
      if (visit21_412_1(path)) {
        _$jscoverage['/uri.js'].lineData[414]++;
        override = 1;
        _$jscoverage['/uri.js'].lineData[415]++;
        if (visit22_415_1(!util.startsWith(path, '/'))) {
          _$jscoverage['/uri.js'].lineData[416]++;
          if (visit23_416_1(target.hostname && !target.path)) {
            _$jscoverage['/uri.js'].lineData[418]++;
            path = '/' + path;
          } else {
            _$jscoverage['/uri.js'].lineData[419]++;
            if (visit24_419_1(target.path)) {
              _$jscoverage['/uri.js'].lineData[421]++;
              lastSlashIndex = target.path.lastIndexOf('/');
              _$jscoverage['/uri.js'].lineData[422]++;
              if (visit25_422_1(lastSlashIndex !== -1)) {
                _$jscoverage['/uri.js'].lineData[423]++;
                path = target.path.slice(0, lastSlashIndex + 1) + path;
              }
            }
          }
        }
        _$jscoverage['/uri.js'].lineData[428]++;
        target.path = Path.normalize(path);
      }
    }
  } else {
    _$jscoverage['/uri.js'].lineData[431]++;
    if (visit26_431_1(o === 'query')) {
      _$jscoverage['/uri.js'].lineData[432]++;
      if (visit27_432_1(override || relativeUri.query.toString())) {
        _$jscoverage['/uri.js'].lineData[433]++;
        target.query = relativeUri.query.clone();
        _$jscoverage['/uri.js'].lineData[434]++;
        override = 1;
      }
    } else {
      _$jscoverage['/uri.js'].lineData[436]++;
      if (visit28_436_1(override || relativeUri[o])) {
        _$jscoverage['/uri.js'].lineData[437]++;
        target[o] = relativeUri[o];
        _$jscoverage['/uri.js'].lineData[438]++;
        override = 1;
      }
    }
  }
});
  _$jscoverage['/uri.js'].lineData[442]++;
  return target;
}, 
  getScheme: function() {
  _$jscoverage['/uri.js'].functionData[24]++;
  _$jscoverage['/uri.js'].lineData[450]++;
  return this.scheme;
}, 
  setScheme: function(scheme) {
  _$jscoverage['/uri.js'].functionData[25]++;
  _$jscoverage['/uri.js'].lineData[459]++;
  this.scheme = scheme;
  _$jscoverage['/uri.js'].lineData[460]++;
  return this;
}, 
  getHostname: function() {
  _$jscoverage['/uri.js'].functionData[26]++;
  _$jscoverage['/uri.js'].lineData[468]++;
  return this.hostname;
}, 
  setHostname: function(hostname) {
  _$jscoverage['/uri.js'].functionData[27]++;
  _$jscoverage['/uri.js'].lineData[477]++;
  this.hostname = hostname;
  _$jscoverage['/uri.js'].lineData[478]++;
  return this;
}, 
  setUserInfo: function(userInfo) {
  _$jscoverage['/uri.js'].functionData[28]++;
  _$jscoverage['/uri.js'].lineData[487]++;
  this.userInfo = userInfo;
  _$jscoverage['/uri.js'].lineData[488]++;
  return this;
}, 
  getUserInfo: function() {
  _$jscoverage['/uri.js'].functionData[29]++;
  _$jscoverage['/uri.js'].lineData[496]++;
  return this.userInfo;
}, 
  setPort: function(port) {
  _$jscoverage['/uri.js'].functionData[30]++;
  _$jscoverage['/uri.js'].lineData[505]++;
  this.port = port;
  _$jscoverage['/uri.js'].lineData[506]++;
  return this;
}, 
  getPort: function() {
  _$jscoverage['/uri.js'].functionData[31]++;
  _$jscoverage['/uri.js'].lineData[514]++;
  return this.port;
}, 
  setPath: function(path) {
  _$jscoverage['/uri.js'].functionData[32]++;
  _$jscoverage['/uri.js'].lineData[523]++;
  this.path = path;
  _$jscoverage['/uri.js'].lineData[524]++;
  return this;
}, 
  getPath: function() {
  _$jscoverage['/uri.js'].functionData[33]++;
  _$jscoverage['/uri.js'].lineData[532]++;
  return this.path;
}, 
  setQuery: function(query) {
  _$jscoverage['/uri.js'].functionData[34]++;
  _$jscoverage['/uri.js'].lineData[541]++;
  if (visit29_541_1(typeof query === 'string')) {
    _$jscoverage['/uri.js'].lineData[542]++;
    if (visit30_542_1(util.startsWith(query, '?'))) {
      _$jscoverage['/uri.js'].lineData[543]++;
      query = query.slice(1);
    }
    _$jscoverage['/uri.js'].lineData[545]++;
    query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
  }
  _$jscoverage['/uri.js'].lineData[547]++;
  this.query = query;
  _$jscoverage['/uri.js'].lineData[548]++;
  return this;
}, 
  getQuery: function() {
  _$jscoverage['/uri.js'].functionData[35]++;
  _$jscoverage['/uri.js'].lineData[556]++;
  return this.query;
}, 
  getFragment: function() {
  _$jscoverage['/uri.js'].functionData[36]++;
  _$jscoverage['/uri.js'].lineData[564]++;
  return this.fragment;
}, 
  setFragment: function(fragment) {
  _$jscoverage['/uri.js'].functionData[37]++;
  _$jscoverage['/uri.js'].lineData[573]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[574]++;
  if (visit31_574_1(util.startsWith(fragment, '#'))) {
    _$jscoverage['/uri.js'].lineData[575]++;
    fragment = fragment.slice(1);
  }
  _$jscoverage['/uri.js'].lineData[577]++;
  self.fragment = fragment;
  _$jscoverage['/uri.js'].lineData[578]++;
  return self;
}, 
  isSameOriginAs: function(other) {
  _$jscoverage['/uri.js'].functionData[38]++;
  _$jscoverage['/uri.js'].lineData[587]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[589]++;
  return visit32_589_1(equalsIgnoreCase(self.hostname, other.hostname) && visit33_590_1(equalsIgnoreCase(self.scheme, other.scheme) && equalsIgnoreCase(self.port, other.port)));
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
    if (visit34_634_1(hostname && !util.startsWith(path, '/'))) {
      _$jscoverage['/uri.js'].lineData[635]++;
      path = '/' + path;
    }
    _$jscoverage['/uri.js'].lineData[637]++;
    path = Path.normalize(path);
    _$jscoverage['/uri.js'].lineData[638]++;
    out.push(encodeSpecialChars(path, reDisallowedInPathName));
  }
  _$jscoverage['/uri.js'].lineData[641]++;
  if ((query = (self.query.toString(serializeArray)))) {
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
  url = visit35_658_1(url || '');
  _$jscoverage['/uri.js'].lineData[659]++;
  var m = visit36_659_1(url.match(URI_SPLIT_REG) || []), ret = {};
  _$jscoverage['/uri.js'].lineData[661]++;
  util.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[41]++;
  _$jscoverage['/uri.js'].lineData[662]++;
  ret[key] = m[index];
});
  _$jscoverage['/uri.js'].lineData[664]++;
  return ret;
};
  _$jscoverage['/uri.js'].lineData[667]++;
  return Uri;
});
