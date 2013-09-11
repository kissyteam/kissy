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
  _$jscoverage['/uri.js'].lineData[78] = 0;
  _$jscoverage['/uri.js'].lineData[79] = 0;
  _$jscoverage['/uri.js'].lineData[80] = 0;
  _$jscoverage['/uri.js'].lineData[89] = 0;
  _$jscoverage['/uri.js'].lineData[90] = 0;
  _$jscoverage['/uri.js'].lineData[94] = 0;
  _$jscoverage['/uri.js'].lineData[102] = 0;
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
  _$jscoverage['/uri.js'].lineData[292] = 0;
  _$jscoverage['/uri.js'].lineData[294] = 0;
  _$jscoverage['/uri.js'].lineData[295] = 0;
  _$jscoverage['/uri.js'].lineData[298] = 0;
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
  _$jscoverage['/uri.js'].lineData[369] = 0;
  _$jscoverage['/uri.js'].lineData[370] = 0;
  _$jscoverage['/uri.js'].lineData[371] = 0;
  _$jscoverage['/uri.js'].lineData[373] = 0;
  _$jscoverage['/uri.js'].lineData[374] = 0;
  _$jscoverage['/uri.js'].lineData[397] = 0;
  _$jscoverage['/uri.js'].lineData[398] = 0;
  _$jscoverage['/uri.js'].lineData[401] = 0;
  _$jscoverage['/uri.js'].lineData[407] = 0;
  _$jscoverage['/uri.js'].lineData[408] = 0;
  _$jscoverage['/uri.js'].lineData[410] = 0;
  _$jscoverage['/uri.js'].lineData[411] = 0;
  _$jscoverage['/uri.js'].lineData[413] = 0;
  _$jscoverage['/uri.js'].lineData[414] = 0;
  _$jscoverage['/uri.js'].lineData[416] = 0;
  _$jscoverage['/uri.js'].lineData[417] = 0;
  _$jscoverage['/uri.js'].lineData[418] = 0;
  _$jscoverage['/uri.js'].lineData[420] = 0;
  _$jscoverage['/uri.js'].lineData[421] = 0;
  _$jscoverage['/uri.js'].lineData[423] = 0;
  _$jscoverage['/uri.js'].lineData[424] = 0;
  _$jscoverage['/uri.js'].lineData[425] = 0;
  _$jscoverage['/uri.js'].lineData[430] = 0;
  _$jscoverage['/uri.js'].lineData[433] = 0;
  _$jscoverage['/uri.js'].lineData[434] = 0;
  _$jscoverage['/uri.js'].lineData[435] = 0;
  _$jscoverage['/uri.js'].lineData[436] = 0;
  _$jscoverage['/uri.js'].lineData[438] = 0;
  _$jscoverage['/uri.js'].lineData[439] = 0;
  _$jscoverage['/uri.js'].lineData[440] = 0;
  _$jscoverage['/uri.js'].lineData[444] = 0;
  _$jscoverage['/uri.js'].lineData[452] = 0;
  _$jscoverage['/uri.js'].lineData[461] = 0;
  _$jscoverage['/uri.js'].lineData[462] = 0;
  _$jscoverage['/uri.js'].lineData[470] = 0;
  _$jscoverage['/uri.js'].lineData[479] = 0;
  _$jscoverage['/uri.js'].lineData[480] = 0;
  _$jscoverage['/uri.js'].lineData[489] = 0;
  _$jscoverage['/uri.js'].lineData[490] = 0;
  _$jscoverage['/uri.js'].lineData[498] = 0;
  _$jscoverage['/uri.js'].lineData[507] = 0;
  _$jscoverage['/uri.js'].lineData[508] = 0;
  _$jscoverage['/uri.js'].lineData[516] = 0;
  _$jscoverage['/uri.js'].lineData[525] = 0;
  _$jscoverage['/uri.js'].lineData[526] = 0;
  _$jscoverage['/uri.js'].lineData[534] = 0;
  _$jscoverage['/uri.js'].lineData[543] = 0;
  _$jscoverage['/uri.js'].lineData[544] = 0;
  _$jscoverage['/uri.js'].lineData[545] = 0;
  _$jscoverage['/uri.js'].lineData[547] = 0;
  _$jscoverage['/uri.js'].lineData[549] = 0;
  _$jscoverage['/uri.js'].lineData[550] = 0;
  _$jscoverage['/uri.js'].lineData[558] = 0;
  _$jscoverage['/uri.js'].lineData[566] = 0;
  _$jscoverage['/uri.js'].lineData[575] = 0;
  _$jscoverage['/uri.js'].lineData[576] = 0;
  _$jscoverage['/uri.js'].lineData[577] = 0;
  _$jscoverage['/uri.js'].lineData[579] = 0;
  _$jscoverage['/uri.js'].lineData[580] = 0;
  _$jscoverage['/uri.js'].lineData[589] = 0;
  _$jscoverage['/uri.js'].lineData[591] = 0;
  _$jscoverage['/uri.js'].lineData[606] = 0;
  _$jscoverage['/uri.js'].lineData[616] = 0;
  _$jscoverage['/uri.js'].lineData[617] = 0;
  _$jscoverage['/uri.js'].lineData[618] = 0;
  _$jscoverage['/uri.js'].lineData[621] = 0;
  _$jscoverage['/uri.js'].lineData[622] = 0;
  _$jscoverage['/uri.js'].lineData[623] = 0;
  _$jscoverage['/uri.js'].lineData[624] = 0;
  _$jscoverage['/uri.js'].lineData[625] = 0;
  _$jscoverage['/uri.js'].lineData[628] = 0;
  _$jscoverage['/uri.js'].lineData[630] = 0;
  _$jscoverage['/uri.js'].lineData[631] = 0;
  _$jscoverage['/uri.js'].lineData[632] = 0;
  _$jscoverage['/uri.js'].lineData[636] = 0;
  _$jscoverage['/uri.js'].lineData[637] = 0;
  _$jscoverage['/uri.js'].lineData[638] = 0;
  _$jscoverage['/uri.js'].lineData[640] = 0;
  _$jscoverage['/uri.js'].lineData[641] = 0;
  _$jscoverage['/uri.js'].lineData[644] = 0;
  _$jscoverage['/uri.js'].lineData[645] = 0;
  _$jscoverage['/uri.js'].lineData[646] = 0;
  _$jscoverage['/uri.js'].lineData[649] = 0;
  _$jscoverage['/uri.js'].lineData[650] = 0;
  _$jscoverage['/uri.js'].lineData[651] = 0;
  _$jscoverage['/uri.js'].lineData[654] = 0;
  _$jscoverage['/uri.js'].lineData[658] = 0;
  _$jscoverage['/uri.js'].lineData[660] = 0;
  _$jscoverage['/uri.js'].lineData[661] = 0;
  _$jscoverage['/uri.js'].lineData[662] = 0;
  _$jscoverage['/uri.js'].lineData[664] = 0;
  _$jscoverage['/uri.js'].lineData[665] = 0;
  _$jscoverage['/uri.js'].lineData[667] = 0;
  _$jscoverage['/uri.js'].lineData[670] = 0;
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
  _$jscoverage['/uri.js'].branchData['294'] = [];
  _$jscoverage['/uri.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['341'] = [];
  _$jscoverage['/uri.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['342'] = [];
  _$jscoverage['/uri.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['397'] = [];
  _$jscoverage['/uri.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['408'] = [];
  _$jscoverage['/uri.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['410'] = [];
  _$jscoverage['/uri.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['414'] = [];
  _$jscoverage['/uri.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['417'] = [];
  _$jscoverage['/uri.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['418'] = [];
  _$jscoverage['/uri.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['421'] = [];
  _$jscoverage['/uri.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['424'] = [];
  _$jscoverage['/uri.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['433'] = [];
  _$jscoverage['/uri.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['434'] = [];
  _$jscoverage['/uri.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['438'] = [];
  _$jscoverage['/uri.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['543'] = [];
  _$jscoverage['/uri.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['544'] = [];
  _$jscoverage['/uri.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['576'] = [];
  _$jscoverage['/uri.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['591'] = [];
  _$jscoverage['/uri.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['592'] = [];
  _$jscoverage['/uri.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['616'] = [];
  _$jscoverage['/uri.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['621'] = [];
  _$jscoverage['/uri.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['623'] = [];
  _$jscoverage['/uri.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['630'] = [];
  _$jscoverage['/uri.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['636'] = [];
  _$jscoverage['/uri.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['637'] = [];
  _$jscoverage['/uri.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['644'] = [];
  _$jscoverage['/uri.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['649'] = [];
  _$jscoverage['/uri.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['661'] = [];
  _$jscoverage['/uri.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['662'] = [];
  _$jscoverage['/uri.js'].branchData['662'][1] = new BranchData();
}
_$jscoverage['/uri.js'].branchData['662'][1].init(44, 30, 'url.match(URI_SPLIT_REG) || []');
function visit643_662_1(result) {
  _$jscoverage['/uri.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['661'][1].init(16, 9, 'url || ""');
function visit642_661_1(result) {
  _$jscoverage['/uri.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['649'][1].init(1382, 24, 'fragment = self.fragment');
function visit641_649_1(result) {
  _$jscoverage['/uri.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['644'][1].init(1215, 63, 'query = (self.query.toString.call(self.query, serializeArray))');
function visit640_644_1(result) {
  _$jscoverage['/uri.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['637'][1].init(22, 36, 'hostname && !S.startsWith(path, \'/\')');
function visit639_637_1(result) {
  _$jscoverage['/uri.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['636'][1].init(918, 16, 'path = self.path');
function visit638_636_1(result) {
  _$jscoverage['/uri.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['630'][1].init(313, 16, 'port = self.port');
function visit637_630_1(result) {
  _$jscoverage['/uri.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['623'][1].init(55, 24, 'userInfo = self.userInfo');
function visit636_623_1(result) {
  _$jscoverage['/uri.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['621'][1].init(432, 24, 'hostname = self.hostname');
function visit635_621_1(result) {
  _$jscoverage['/uri.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['616'][1].init(255, 20, 'scheme = self.scheme');
function visit634_616_1(result) {
  _$jscoverage['/uri.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['592'][1].init(70, 109, 'equalsIgnoreCase(self.scheme, other[\'scheme\']) && equalsIgnoreCase(self.port, other[\'port\'])');
function visit633_592_1(result) {
  _$jscoverage['/uri.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['591'][1].init(100, 180, 'equalsIgnoreCase(self.hostname, other[\'hostname\']) && equalsIgnoreCase(self.scheme, other[\'scheme\']) && equalsIgnoreCase(self.port, other[\'port\'])');
function visit632_591_1(result) {
  _$jscoverage['/uri.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['576'][1].init(48, 27, 'S.startsWith(fragment, \'#\')');
function visit631_576_1(result) {
  _$jscoverage['/uri.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['544'][1].init(22, 24, 'S.startsWith(query, \'?\')');
function visit630_544_1(result) {
  _$jscoverage['/uri.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['543'][1].init(18, 24, 'typeof query == \'string\'');
function visit629_543_1(result) {
  _$jscoverage['/uri.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['438'][1].init(1674, 26, 'override || relativeUri[o]');
function visit628_438_1(result) {
  _$jscoverage['/uri.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['434'][1].init(26, 43, 'override || relativeUri[\'query\'].toString()');
function visit627_434_1(result) {
  _$jscoverage['/uri.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['433'][1].init(1425, 12, 'o == \'query\'');
function visit626_433_1(result) {
  _$jscoverage['/uri.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['424'][1].init(198, 20, 'lastSlashIndex != -1');
function visit625_424_1(result) {
  _$jscoverage['/uri.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['421'][1].init(246, 11, 'target.path');
function visit624_421_1(result) {
  _$jscoverage['/uri.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['418'][1].init(38, 31, 'target.hostname && !target.path');
function visit623_418_1(result) {
  _$jscoverage['/uri.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['417'][1].init(157, 24, '!S.startsWith(path, \'/\')');
function visit622_417_1(result) {
  _$jscoverage['/uri.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['414'][1].init(87, 4, 'path');
function visit621_414_1(result) {
  _$jscoverage['/uri.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['410'][1].init(109, 8, 'override');
function visit620_410_1(result) {
  _$jscoverage['/uri.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['408'][1].init(22, 11, 'o == \'path\'');
function visit619_408_1(result) {
  _$jscoverage['/uri.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['397'][1].init(20, 30, 'typeof relativeUri == \'string\'');
function visit618_397_1(result) {
  _$jscoverage['/uri.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['342'][1].init(44, 14, 'key == \'query\'');
function visit617_342_1(result) {
  _$jscoverage['/uri.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['341'][1].init(18, 7, 'v || \'\'');
function visit616_341_1(result) {
  _$jscoverage['/uri.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['294'][1].init(16, 22, 'uriStr instanceof Uri');
function visit615_294_1(result) {
  _$jscoverage['/uri.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['269'][1].init(17, 40, 'str1.toLowerCase() == str2.toLowerCase()');
function visit614_269_1(result) {
  _$jscoverage['/uri.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['265'][1].init(17, 15, 'str.length == 1');
function visit613_265_1(result) {
  _$jscoverage['/uri.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['242'][1].init(22, 20, 'key instanceof Query');
function visit612_242_1(result) {
  _$jscoverage['/uri.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['235'][1].init(150, 26, 'currentValue === undefined');
function visit611_235_1(result) {
  _$jscoverage['/uri.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['231'][1].init(107, 22, 'typeof key == \'string\'');
function visit610_231_1(result) {
  _$jscoverage['/uri.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['212'][1].init(79, 3, 'key');
function visit609_212_1(result) {
  _$jscoverage['/uri.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['194'][1].init(22, 20, 'key instanceof Query');
function visit608_194_1(result) {
  _$jscoverage['/uri.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['191'][1].init(131, 22, 'typeof key == \'string\'');
function visit607_191_1(result) {
  _$jscoverage['/uri.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['164'][1].init(131, 3, 'key');
function visit606_164_1(result) {
  _$jscoverage['/uri.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['149'][1].init(131, 3, 'key');
function visit605_149_1(result) {
  _$jscoverage['/uri.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['131'][1].init(24, 23, 'S.isArray(_queryMap[k])');
function visit604_131_1(result) {
  _$jscoverage['/uri.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['113'][1].init(58, 11, 'query || \'\'');
function visit603_113_1(result) {
  _$jscoverage['/uri.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['90'][1].init(24, 11, 'query || \'\'');
function visit602_90_1(result) {
  _$jscoverage['/uri.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['79'][1].init(14, 15, '!self._queryMap');
function visit601_79_1(result) {
  _$jscoverage['/uri.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/uri.js'].functionData[0]++;
  _$jscoverage['/uri.js'].lineData[8]++;
  var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g, reDisallowedInPathName = /[#\?]/g, logger = S.getLogger('s/uri'), reDisallowedInQuery = /[#@]/g, reDisallowedInFragment = /#/g, URI_SPLIT_REG = new RegExp('^' + '(?:([\\w\\d+.-]+):)?' + '(?://' + '(?:([^/?#@]*)@)?' + '(' + '[\\w\\d\\-\\u0100-\\uffff.+%]*' + '|' + '\\[[^\\]]+\\]' + ')' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$'), Path = S.Path, REG_INFO = {
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
    if (visit601_79_1(!self._queryMap)) {
      _$jscoverage['/uri.js'].lineData[80]++;
      self._queryMap = S.unparam(self._query);
    }
  }
  _$jscoverage['/uri.js'].lineData[89]++;
  function Query(query) {
    _$jscoverage['/uri.js'].functionData[2]++;
    _$jscoverage['/uri.js'].lineData[90]++;
    this._query = visit602_90_1(query || '');
  }
  _$jscoverage['/uri.js'].lineData[94]++;
  Query.prototype = {
  constructor: Query, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[3]++;
  _$jscoverage['/uri.js'].lineData[102]++;
  return new Query(this.toString());
}, 
  reset: function(query) {
  _$jscoverage['/uri.js'].functionData[4]++;
  _$jscoverage['/uri.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[113]++;
  self._query = visit603_113_1(query || '');
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
    if (visit604_131_1(S.isArray(_queryMap[k]))) {
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
  if (visit605_149_1(key)) {
    _$jscoverage['/uri.js'].lineData[150]++;
    return key in _queryMap;
  } else {
    _$jscoverage['/uri.js'].lineData[152]++;
    return !S.isEmptyObject(_queryMap);
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
  if (visit606_164_1(key)) {
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
  return S.keys(self._queryMap);
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
  if (visit607_191_1(typeof key == 'string')) {
    _$jscoverage['/uri.js'].lineData[192]++;
    self._queryMap[key] = value;
  } else {
    _$jscoverage['/uri.js'].lineData[194]++;
    if (visit608_194_1(key instanceof Query)) {
      _$jscoverage['/uri.js'].lineData[195]++;
      key = key.get();
    }
    _$jscoverage['/uri.js'].lineData[197]++;
    S.each(key, function(v, k) {
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
  if (visit609_212_1(key)) {
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
  if (visit610_231_1(typeof key == 'string')) {
    _$jscoverage['/uri.js'].lineData[232]++;
    parseQuery(self);
    _$jscoverage['/uri.js'].lineData[233]++;
    _queryMap = self._queryMap;
    _$jscoverage['/uri.js'].lineData[234]++;
    currentValue = _queryMap[key];
    _$jscoverage['/uri.js'].lineData[235]++;
    if (visit611_235_1(currentValue === undefined)) {
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
    if (visit612_242_1(key instanceof Query)) {
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
  return S.param(self._queryMap, undefined, undefined, serializeArray);
}};
  _$jscoverage['/uri.js'].lineData[264]++;
  function padding2(str) {
    _$jscoverage['/uri.js'].functionData[14]++;
    _$jscoverage['/uri.js'].lineData[265]++;
    return visit613_265_1(str.length == 1) ? '0' + str : str;
  }
  _$jscoverage['/uri.js'].lineData[268]++;
  function equalsIgnoreCase(str1, str2) {
    _$jscoverage['/uri.js'].functionData[15]++;
    _$jscoverage['/uri.js'].lineData[269]++;
    return visit614_269_1(str1.toLowerCase() == str2.toLowerCase());
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
  _$jscoverage['/uri.js'].lineData[292]++;
  function Uri(uriStr) {
    _$jscoverage['/uri.js'].functionData[18]++;
    _$jscoverage['/uri.js'].lineData[294]++;
    if (visit615_294_1(uriStr instanceof Uri)) {
      _$jscoverage['/uri.js'].lineData[295]++;
      return uriStr['clone']();
    }
    _$jscoverage['/uri.js'].lineData[298]++;
    var components, self = this;
    _$jscoverage['/uri.js'].lineData[300]++;
    S.mix(self, {
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
    S.each(components, function(v, key) {
  _$jscoverage['/uri.js'].functionData[19]++;
  _$jscoverage['/uri.js'].lineData[341]++;
  v = visit616_341_1(v || '');
  _$jscoverage['/uri.js'].lineData[342]++;
  if (visit617_342_1(key == 'query')) {
    _$jscoverage['/uri.js'].lineData[344]++;
    self.query = new Query(v);
  } else {
    _$jscoverage['/uri.js'].lineData[347]++;
    try {
      _$jscoverage['/uri.js'].lineData[348]++;
      v = S.urlDecode(v);
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
  _$jscoverage['/uri.js'].lineData[369]++;
  var uri = new Uri(), self = this;
  _$jscoverage['/uri.js'].lineData[370]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[21]++;
  _$jscoverage['/uri.js'].lineData[371]++;
  uri[key] = self[key];
});
  _$jscoverage['/uri.js'].lineData[373]++;
  uri.query = uri.query.clone();
  _$jscoverage['/uri.js'].lineData[374]++;
  return uri;
}, 
  resolve: function(relativeUri) {
  _$jscoverage['/uri.js'].functionData[22]++;
  _$jscoverage['/uri.js'].lineData[397]++;
  if (visit618_397_1(typeof relativeUri == 'string')) {
    _$jscoverage['/uri.js'].lineData[398]++;
    relativeUri = new Uri(relativeUri);
  }
  _$jscoverage['/uri.js'].lineData[401]++;
  var self = this, override = 0, lastSlashIndex, order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'], target = self.clone();
  _$jscoverage['/uri.js'].lineData[407]++;
  S.each(order, function(o) {
  _$jscoverage['/uri.js'].functionData[23]++;
  _$jscoverage['/uri.js'].lineData[408]++;
  if (visit619_408_1(o == 'path')) {
    _$jscoverage['/uri.js'].lineData[410]++;
    if (visit620_410_1(override)) {
      _$jscoverage['/uri.js'].lineData[411]++;
      target[o] = relativeUri[o];
    } else {
      _$jscoverage['/uri.js'].lineData[413]++;
      var path = relativeUri['path'];
      _$jscoverage['/uri.js'].lineData[414]++;
      if (visit621_414_1(path)) {
        _$jscoverage['/uri.js'].lineData[416]++;
        override = 1;
        _$jscoverage['/uri.js'].lineData[417]++;
        if (visit622_417_1(!S.startsWith(path, '/'))) {
          _$jscoverage['/uri.js'].lineData[418]++;
          if (visit623_418_1(target.hostname && !target.path)) {
            _$jscoverage['/uri.js'].lineData[420]++;
            path = '/' + path;
          } else {
            _$jscoverage['/uri.js'].lineData[421]++;
            if (visit624_421_1(target.path)) {
              _$jscoverage['/uri.js'].lineData[423]++;
              lastSlashIndex = target.path.lastIndexOf('/');
              _$jscoverage['/uri.js'].lineData[424]++;
              if (visit625_424_1(lastSlashIndex != -1)) {
                _$jscoverage['/uri.js'].lineData[425]++;
                path = target.path.slice(0, lastSlashIndex + 1) + path;
              }
            }
          }
        }
        _$jscoverage['/uri.js'].lineData[430]++;
        target.path = Path.normalize(path);
      }
    }
  } else {
    _$jscoverage['/uri.js'].lineData[433]++;
    if (visit626_433_1(o == 'query')) {
      _$jscoverage['/uri.js'].lineData[434]++;
      if (visit627_434_1(override || relativeUri['query'].toString())) {
        _$jscoverage['/uri.js'].lineData[435]++;
        target.query = relativeUri['query'].clone();
        _$jscoverage['/uri.js'].lineData[436]++;
        override = 1;
      }
    } else {
      _$jscoverage['/uri.js'].lineData[438]++;
      if (visit628_438_1(override || relativeUri[o])) {
        _$jscoverage['/uri.js'].lineData[439]++;
        target[o] = relativeUri[o];
        _$jscoverage['/uri.js'].lineData[440]++;
        override = 1;
      }
    }
  }
});
  _$jscoverage['/uri.js'].lineData[444]++;
  return target;
}, 
  getScheme: function() {
  _$jscoverage['/uri.js'].functionData[24]++;
  _$jscoverage['/uri.js'].lineData[452]++;
  return this.scheme;
}, 
  setScheme: function(scheme) {
  _$jscoverage['/uri.js'].functionData[25]++;
  _$jscoverage['/uri.js'].lineData[461]++;
  this.scheme = scheme;
  _$jscoverage['/uri.js'].lineData[462]++;
  return this;
}, 
  getHostname: function() {
  _$jscoverage['/uri.js'].functionData[26]++;
  _$jscoverage['/uri.js'].lineData[470]++;
  return this.hostname;
}, 
  setHostname: function(hostname) {
  _$jscoverage['/uri.js'].functionData[27]++;
  _$jscoverage['/uri.js'].lineData[479]++;
  this.hostname = hostname;
  _$jscoverage['/uri.js'].lineData[480]++;
  return this;
}, 
  'setUserInfo': function(userInfo) {
  _$jscoverage['/uri.js'].functionData[28]++;
  _$jscoverage['/uri.js'].lineData[489]++;
  this.userInfo = userInfo;
  _$jscoverage['/uri.js'].lineData[490]++;
  return this;
}, 
  getUserInfo: function() {
  _$jscoverage['/uri.js'].functionData[29]++;
  _$jscoverage['/uri.js'].lineData[498]++;
  return this.userInfo;
}, 
  'setPort': function(port) {
  _$jscoverage['/uri.js'].functionData[30]++;
  _$jscoverage['/uri.js'].lineData[507]++;
  this.port = port;
  _$jscoverage['/uri.js'].lineData[508]++;
  return this;
}, 
  'getPort': function() {
  _$jscoverage['/uri.js'].functionData[31]++;
  _$jscoverage['/uri.js'].lineData[516]++;
  return this.port;
}, 
  setPath: function(path) {
  _$jscoverage['/uri.js'].functionData[32]++;
  _$jscoverage['/uri.js'].lineData[525]++;
  this.path = path;
  _$jscoverage['/uri.js'].lineData[526]++;
  return this;
}, 
  getPath: function() {
  _$jscoverage['/uri.js'].functionData[33]++;
  _$jscoverage['/uri.js'].lineData[534]++;
  return this.path;
}, 
  'setQuery': function(query) {
  _$jscoverage['/uri.js'].functionData[34]++;
  _$jscoverage['/uri.js'].lineData[543]++;
  if (visit629_543_1(typeof query == 'string')) {
    _$jscoverage['/uri.js'].lineData[544]++;
    if (visit630_544_1(S.startsWith(query, '?'))) {
      _$jscoverage['/uri.js'].lineData[545]++;
      query = query.slice(1);
    }
    _$jscoverage['/uri.js'].lineData[547]++;
    query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
  }
  _$jscoverage['/uri.js'].lineData[549]++;
  this.query = query;
  _$jscoverage['/uri.js'].lineData[550]++;
  return this;
}, 
  getQuery: function() {
  _$jscoverage['/uri.js'].functionData[35]++;
  _$jscoverage['/uri.js'].lineData[558]++;
  return this.query;
}, 
  getFragment: function() {
  _$jscoverage['/uri.js'].functionData[36]++;
  _$jscoverage['/uri.js'].lineData[566]++;
  return this.fragment;
}, 
  'setFragment': function(fragment) {
  _$jscoverage['/uri.js'].functionData[37]++;
  _$jscoverage['/uri.js'].lineData[575]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[576]++;
  if (visit631_576_1(S.startsWith(fragment, '#'))) {
    _$jscoverage['/uri.js'].lineData[577]++;
    fragment = fragment.slice(1);
  }
  _$jscoverage['/uri.js'].lineData[579]++;
  self.fragment = fragment;
  _$jscoverage['/uri.js'].lineData[580]++;
  return self;
}, 
  isSameOriginAs: function(other) {
  _$jscoverage['/uri.js'].functionData[38]++;
  _$jscoverage['/uri.js'].lineData[589]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[591]++;
  return visit632_591_1(equalsIgnoreCase(self.hostname, other['hostname']) && visit633_592_1(equalsIgnoreCase(self.scheme, other['scheme']) && equalsIgnoreCase(self.port, other['port'])));
}, 
  toString: function(serializeArray) {
  _$jscoverage['/uri.js'].functionData[39]++;
  _$jscoverage['/uri.js'].lineData[606]++;
  var out = [], self = this, scheme, hostname, path, port, fragment, query, userInfo;
  _$jscoverage['/uri.js'].lineData[616]++;
  if (visit634_616_1(scheme = self.scheme)) {
    _$jscoverage['/uri.js'].lineData[617]++;
    out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
    _$jscoverage['/uri.js'].lineData[618]++;
    out.push(':');
  }
  _$jscoverage['/uri.js'].lineData[621]++;
  if (visit635_621_1(hostname = self.hostname)) {
    _$jscoverage['/uri.js'].lineData[622]++;
    out.push('//');
    _$jscoverage['/uri.js'].lineData[623]++;
    if (visit636_623_1(userInfo = self.userInfo)) {
      _$jscoverage['/uri.js'].lineData[624]++;
      out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
      _$jscoverage['/uri.js'].lineData[625]++;
      out.push('@');
    }
    _$jscoverage['/uri.js'].lineData[628]++;
    out.push(encodeURIComponent(hostname));
    _$jscoverage['/uri.js'].lineData[630]++;
    if (visit637_630_1(port = self.port)) {
      _$jscoverage['/uri.js'].lineData[631]++;
      out.push(':');
      _$jscoverage['/uri.js'].lineData[632]++;
      out.push(port);
    }
  }
  _$jscoverage['/uri.js'].lineData[636]++;
  if (visit638_636_1(path = self.path)) {
    _$jscoverage['/uri.js'].lineData[637]++;
    if (visit639_637_1(hostname && !S.startsWith(path, '/'))) {
      _$jscoverage['/uri.js'].lineData[638]++;
      path = '/' + path;
    }
    _$jscoverage['/uri.js'].lineData[640]++;
    path = Path.normalize(path);
    _$jscoverage['/uri.js'].lineData[641]++;
    out.push(encodeSpecialChars(path, reDisallowedInPathName));
  }
  _$jscoverage['/uri.js'].lineData[644]++;
  if (visit640_644_1(query = (self.query.toString.call(self.query, serializeArray)))) {
    _$jscoverage['/uri.js'].lineData[645]++;
    out.push('?');
    _$jscoverage['/uri.js'].lineData[646]++;
    out.push(query);
  }
  _$jscoverage['/uri.js'].lineData[649]++;
  if (visit641_649_1(fragment = self.fragment)) {
    _$jscoverage['/uri.js'].lineData[650]++;
    out.push('#');
    _$jscoverage['/uri.js'].lineData[651]++;
    out.push(encodeSpecialChars(fragment, reDisallowedInFragment));
  }
  _$jscoverage['/uri.js'].lineData[654]++;
  return out.join('');
}};
  _$jscoverage['/uri.js'].lineData[658]++;
  Uri.Query = Query;
  _$jscoverage['/uri.js'].lineData[660]++;
  Uri.getComponents = function(url) {
  _$jscoverage['/uri.js'].functionData[40]++;
  _$jscoverage['/uri.js'].lineData[661]++;
  url = visit642_661_1(url || "");
  _$jscoverage['/uri.js'].lineData[662]++;
  var m = visit643_662_1(url.match(URI_SPLIT_REG) || []), ret = {};
  _$jscoverage['/uri.js'].lineData[664]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[41]++;
  _$jscoverage['/uri.js'].lineData[665]++;
  ret[key] = m[index];
});
  _$jscoverage['/uri.js'].lineData[667]++;
  return ret;
};
  _$jscoverage['/uri.js'].lineData[670]++;
  S.Uri = Uri;
})(KISSY);
