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
  _$jscoverage['/uri.js'].lineData[77] = 0;
  _$jscoverage['/uri.js'].lineData[78] = 0;
  _$jscoverage['/uri.js'].lineData[79] = 0;
  _$jscoverage['/uri.js'].lineData[88] = 0;
  _$jscoverage['/uri.js'].lineData[89] = 0;
  _$jscoverage['/uri.js'].lineData[92] = 0;
  _$jscoverage['/uri.js'].lineData[100] = 0;
  _$jscoverage['/uri.js'].lineData[110] = 0;
  _$jscoverage['/uri.js'].lineData[111] = 0;
  _$jscoverage['/uri.js'].lineData[112] = 0;
  _$jscoverage['/uri.js'].lineData[113] = 0;
  _$jscoverage['/uri.js'].lineData[121] = 0;
  _$jscoverage['/uri.js'].lineData[125] = 0;
  _$jscoverage['/uri.js'].lineData[126] = 0;
  _$jscoverage['/uri.js'].lineData[127] = 0;
  _$jscoverage['/uri.js'].lineData[129] = 0;
  _$jscoverage['/uri.js'].lineData[130] = 0;
  _$jscoverage['/uri.js'].lineData[132] = 0;
  _$jscoverage['/uri.js'].lineData[136] = 0;
  _$jscoverage['/uri.js'].lineData[144] = 0;
  _$jscoverage['/uri.js'].lineData[145] = 0;
  _$jscoverage['/uri.js'].lineData[146] = 0;
  _$jscoverage['/uri.js'].lineData[147] = 0;
  _$jscoverage['/uri.js'].lineData[148] = 0;
  _$jscoverage['/uri.js'].lineData[150] = 0;
  _$jscoverage['/uri.js'].lineData[159] = 0;
  _$jscoverage['/uri.js'].lineData[160] = 0;
  _$jscoverage['/uri.js'].lineData[161] = 0;
  _$jscoverage['/uri.js'].lineData[162] = 0;
  _$jscoverage['/uri.js'].lineData[163] = 0;
  _$jscoverage['/uri.js'].lineData[165] = 0;
  _$jscoverage['/uri.js'].lineData[174] = 0;
  _$jscoverage['/uri.js'].lineData[175] = 0;
  _$jscoverage['/uri.js'].lineData[176] = 0;
  _$jscoverage['/uri.js'].lineData[186] = 0;
  _$jscoverage['/uri.js'].lineData[187] = 0;
  _$jscoverage['/uri.js'].lineData[188] = 0;
  _$jscoverage['/uri.js'].lineData[189] = 0;
  _$jscoverage['/uri.js'].lineData[190] = 0;
  _$jscoverage['/uri.js'].lineData[192] = 0;
  _$jscoverage['/uri.js'].lineData[193] = 0;
  _$jscoverage['/uri.js'].lineData[195] = 0;
  _$jscoverage['/uri.js'].lineData[196] = 0;
  _$jscoverage['/uri.js'].lineData[199] = 0;
  _$jscoverage['/uri.js'].lineData[208] = 0;
  _$jscoverage['/uri.js'].lineData[209] = 0;
  _$jscoverage['/uri.js'].lineData[210] = 0;
  _$jscoverage['/uri.js'].lineData[211] = 0;
  _$jscoverage['/uri.js'].lineData[213] = 0;
  _$jscoverage['/uri.js'].lineData[215] = 0;
  _$jscoverage['/uri.js'].lineData[226] = 0;
  _$jscoverage['/uri.js'].lineData[229] = 0;
  _$jscoverage['/uri.js'].lineData[230] = 0;
  _$jscoverage['/uri.js'].lineData[231] = 0;
  _$jscoverage['/uri.js'].lineData[232] = 0;
  _$jscoverage['/uri.js'].lineData[233] = 0;
  _$jscoverage['/uri.js'].lineData[234] = 0;
  _$jscoverage['/uri.js'].lineData[236] = 0;
  _$jscoverage['/uri.js'].lineData[238] = 0;
  _$jscoverage['/uri.js'].lineData[240] = 0;
  _$jscoverage['/uri.js'].lineData[241] = 0;
  _$jscoverage['/uri.js'].lineData[243] = 0;
  _$jscoverage['/uri.js'].lineData[244] = 0;
  _$jscoverage['/uri.js'].lineData[247] = 0;
  _$jscoverage['/uri.js'].lineData[256] = 0;
  _$jscoverage['/uri.js'].lineData[257] = 0;
  _$jscoverage['/uri.js'].lineData[258] = 0;
  _$jscoverage['/uri.js'].lineData[262] = 0;
  _$jscoverage['/uri.js'].lineData[263] = 0;
  _$jscoverage['/uri.js'].lineData[266] = 0;
  _$jscoverage['/uri.js'].lineData[267] = 0;
  _$jscoverage['/uri.js'].lineData[273] = 0;
  _$jscoverage['/uri.js'].lineData[278] = 0;
  _$jscoverage['/uri.js'].lineData[279] = 0;
  _$jscoverage['/uri.js'].lineData[289] = 0;
  _$jscoverage['/uri.js'].lineData[291] = 0;
  _$jscoverage['/uri.js'].lineData[292] = 0;
  _$jscoverage['/uri.js'].lineData[295] = 0;
  _$jscoverage['/uri.js'].lineData[297] = 0;
  _$jscoverage['/uri.js'].lineData[335] = 0;
  _$jscoverage['/uri.js'].lineData[337] = 0;
  _$jscoverage['/uri.js'].lineData[338] = 0;
  _$jscoverage['/uri.js'].lineData[339] = 0;
  _$jscoverage['/uri.js'].lineData[341] = 0;
  _$jscoverage['/uri.js'].lineData[344] = 0;
  _$jscoverage['/uri.js'].lineData[345] = 0;
  _$jscoverage['/uri.js'].lineData[347] = 0;
  _$jscoverage['/uri.js'].lineData[350] = 0;
  _$jscoverage['/uri.js'].lineData[354] = 0;
  _$jscoverage['/uri.js'].lineData[357] = 0;
  _$jscoverage['/uri.js'].lineData[365] = 0;
  _$jscoverage['/uri.js'].lineData[366] = 0;
  _$jscoverage['/uri.js'].lineData[367] = 0;
  _$jscoverage['/uri.js'].lineData[369] = 0;
  _$jscoverage['/uri.js'].lineData[370] = 0;
  _$jscoverage['/uri.js'].lineData[393] = 0;
  _$jscoverage['/uri.js'].lineData[394] = 0;
  _$jscoverage['/uri.js'].lineData[397] = 0;
  _$jscoverage['/uri.js'].lineData[403] = 0;
  _$jscoverage['/uri.js'].lineData[404] = 0;
  _$jscoverage['/uri.js'].lineData[406] = 0;
  _$jscoverage['/uri.js'].lineData[407] = 0;
  _$jscoverage['/uri.js'].lineData[409] = 0;
  _$jscoverage['/uri.js'].lineData[410] = 0;
  _$jscoverage['/uri.js'].lineData[412] = 0;
  _$jscoverage['/uri.js'].lineData[413] = 0;
  _$jscoverage['/uri.js'].lineData[414] = 0;
  _$jscoverage['/uri.js'].lineData[416] = 0;
  _$jscoverage['/uri.js'].lineData[417] = 0;
  _$jscoverage['/uri.js'].lineData[419] = 0;
  _$jscoverage['/uri.js'].lineData[420] = 0;
  _$jscoverage['/uri.js'].lineData[421] = 0;
  _$jscoverage['/uri.js'].lineData[426] = 0;
  _$jscoverage['/uri.js'].lineData[429] = 0;
  _$jscoverage['/uri.js'].lineData[430] = 0;
  _$jscoverage['/uri.js'].lineData[431] = 0;
  _$jscoverage['/uri.js'].lineData[432] = 0;
  _$jscoverage['/uri.js'].lineData[434] = 0;
  _$jscoverage['/uri.js'].lineData[435] = 0;
  _$jscoverage['/uri.js'].lineData[436] = 0;
  _$jscoverage['/uri.js'].lineData[440] = 0;
  _$jscoverage['/uri.js'].lineData[448] = 0;
  _$jscoverage['/uri.js'].lineData[457] = 0;
  _$jscoverage['/uri.js'].lineData[458] = 0;
  _$jscoverage['/uri.js'].lineData[466] = 0;
  _$jscoverage['/uri.js'].lineData[475] = 0;
  _$jscoverage['/uri.js'].lineData[476] = 0;
  _$jscoverage['/uri.js'].lineData[485] = 0;
  _$jscoverage['/uri.js'].lineData[486] = 0;
  _$jscoverage['/uri.js'].lineData[494] = 0;
  _$jscoverage['/uri.js'].lineData[503] = 0;
  _$jscoverage['/uri.js'].lineData[504] = 0;
  _$jscoverage['/uri.js'].lineData[512] = 0;
  _$jscoverage['/uri.js'].lineData[521] = 0;
  _$jscoverage['/uri.js'].lineData[522] = 0;
  _$jscoverage['/uri.js'].lineData[530] = 0;
  _$jscoverage['/uri.js'].lineData[539] = 0;
  _$jscoverage['/uri.js'].lineData[540] = 0;
  _$jscoverage['/uri.js'].lineData[541] = 0;
  _$jscoverage['/uri.js'].lineData[543] = 0;
  _$jscoverage['/uri.js'].lineData[545] = 0;
  _$jscoverage['/uri.js'].lineData[546] = 0;
  _$jscoverage['/uri.js'].lineData[554] = 0;
  _$jscoverage['/uri.js'].lineData[562] = 0;
  _$jscoverage['/uri.js'].lineData[571] = 0;
  _$jscoverage['/uri.js'].lineData[572] = 0;
  _$jscoverage['/uri.js'].lineData[573] = 0;
  _$jscoverage['/uri.js'].lineData[575] = 0;
  _$jscoverage['/uri.js'].lineData[576] = 0;
  _$jscoverage['/uri.js'].lineData[585] = 0;
  _$jscoverage['/uri.js'].lineData[587] = 0;
  _$jscoverage['/uri.js'].lineData[602] = 0;
  _$jscoverage['/uri.js'].lineData[612] = 0;
  _$jscoverage['/uri.js'].lineData[613] = 0;
  _$jscoverage['/uri.js'].lineData[614] = 0;
  _$jscoverage['/uri.js'].lineData[617] = 0;
  _$jscoverage['/uri.js'].lineData[618] = 0;
  _$jscoverage['/uri.js'].lineData[619] = 0;
  _$jscoverage['/uri.js'].lineData[620] = 0;
  _$jscoverage['/uri.js'].lineData[621] = 0;
  _$jscoverage['/uri.js'].lineData[624] = 0;
  _$jscoverage['/uri.js'].lineData[626] = 0;
  _$jscoverage['/uri.js'].lineData[627] = 0;
  _$jscoverage['/uri.js'].lineData[628] = 0;
  _$jscoverage['/uri.js'].lineData[632] = 0;
  _$jscoverage['/uri.js'].lineData[633] = 0;
  _$jscoverage['/uri.js'].lineData[634] = 0;
  _$jscoverage['/uri.js'].lineData[636] = 0;
  _$jscoverage['/uri.js'].lineData[637] = 0;
  _$jscoverage['/uri.js'].lineData[640] = 0;
  _$jscoverage['/uri.js'].lineData[641] = 0;
  _$jscoverage['/uri.js'].lineData[642] = 0;
  _$jscoverage['/uri.js'].lineData[645] = 0;
  _$jscoverage['/uri.js'].lineData[646] = 0;
  _$jscoverage['/uri.js'].lineData[647] = 0;
  _$jscoverage['/uri.js'].lineData[650] = 0;
  _$jscoverage['/uri.js'].lineData[654] = 0;
  _$jscoverage['/uri.js'].lineData[656] = 0;
  _$jscoverage['/uri.js'].lineData[657] = 0;
  _$jscoverage['/uri.js'].lineData[658] = 0;
  _$jscoverage['/uri.js'].lineData[660] = 0;
  _$jscoverage['/uri.js'].lineData[661] = 0;
  _$jscoverage['/uri.js'].lineData[663] = 0;
  _$jscoverage['/uri.js'].lineData[666] = 0;
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
  _$jscoverage['/uri.js'].branchData['111'] = [];
  _$jscoverage['/uri.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['129'] = [];
  _$jscoverage['/uri.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['147'] = [];
  _$jscoverage['/uri.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['162'] = [];
  _$jscoverage['/uri.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['189'] = [];
  _$jscoverage['/uri.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['192'] = [];
  _$jscoverage['/uri.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['210'] = [];
  _$jscoverage['/uri.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['229'] = [];
  _$jscoverage['/uri.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['233'] = [];
  _$jscoverage['/uri.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['240'] = [];
  _$jscoverage['/uri.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['263'] = [];
  _$jscoverage['/uri.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['267'] = [];
  _$jscoverage['/uri.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['291'] = [];
  _$jscoverage['/uri.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['338'] = [];
  _$jscoverage['/uri.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['339'] = [];
  _$jscoverage['/uri.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['393'] = [];
  _$jscoverage['/uri.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['404'] = [];
  _$jscoverage['/uri.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['406'] = [];
  _$jscoverage['/uri.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['410'] = [];
  _$jscoverage['/uri.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['413'] = [];
  _$jscoverage['/uri.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['414'] = [];
  _$jscoverage['/uri.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['417'] = [];
  _$jscoverage['/uri.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['420'] = [];
  _$jscoverage['/uri.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['429'] = [];
  _$jscoverage['/uri.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['430'] = [];
  _$jscoverage['/uri.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['434'] = [];
  _$jscoverage['/uri.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['539'] = [];
  _$jscoverage['/uri.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['540'] = [];
  _$jscoverage['/uri.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['572'] = [];
  _$jscoverage['/uri.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['587'] = [];
  _$jscoverage['/uri.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['588'] = [];
  _$jscoverage['/uri.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['612'] = [];
  _$jscoverage['/uri.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['617'] = [];
  _$jscoverage['/uri.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['619'] = [];
  _$jscoverage['/uri.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['626'] = [];
  _$jscoverage['/uri.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['632'] = [];
  _$jscoverage['/uri.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['633'] = [];
  _$jscoverage['/uri.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['640'] = [];
  _$jscoverage['/uri.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['645'] = [];
  _$jscoverage['/uri.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['657'] = [];
  _$jscoverage['/uri.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/uri.js'].branchData['658'] = [];
  _$jscoverage['/uri.js'].branchData['658'][1] = new BranchData();
}
_$jscoverage['/uri.js'].branchData['658'][1].init(42, 30, 'url.match(URI_SPLIT_REG) || []');
function visit627_658_1(result) {
  _$jscoverage['/uri.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['657'][1].init(15, 9, 'url || ""');
function visit626_657_1(result) {
  _$jscoverage['/uri.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['645'][1].init(1337, 24, 'fragment = self.fragment');
function visit625_645_1(result) {
  _$jscoverage['/uri.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['640'][1].init(1175, 63, 'query = (self.query.toString.call(self.query, serializeArray))');
function visit624_640_1(result) {
  _$jscoverage['/uri.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['633'][1].init(21, 36, 'hostname && !S.startsWith(path, \'/\')');
function visit623_633_1(result) {
  _$jscoverage['/uri.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['632'][1].init(886, 16, 'path = self.path');
function visit622_632_1(result) {
  _$jscoverage['/uri.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['626'][1].init(304, 16, 'port = self.port');
function visit621_626_1(result) {
  _$jscoverage['/uri.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['619'][1].init(53, 24, 'userInfo = self.userInfo');
function visit620_619_1(result) {
  _$jscoverage['/uri.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['617'][1].init(415, 24, 'hostname = self.hostname');
function visit619_617_1(result) {
  _$jscoverage['/uri.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['612'][1].init(243, 20, 'scheme = self.scheme');
function visit618_612_1(result) {
  _$jscoverage['/uri.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['588'][1].init(69, 108, 'equalsIgnoreCase(self.scheme, other[\'scheme\']) && equalsIgnoreCase(self.port, other[\'port\'])');
function visit617_588_1(result) {
  _$jscoverage['/uri.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['587'][1].init(97, 178, 'equalsIgnoreCase(self.hostname, other[\'hostname\']) && equalsIgnoreCase(self.scheme, other[\'scheme\']) && equalsIgnoreCase(self.port, other[\'port\'])');
function visit616_587_1(result) {
  _$jscoverage['/uri.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['572'][1].init(46, 27, 'S.startsWith(fragment, \'#\')');
function visit615_572_1(result) {
  _$jscoverage['/uri.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['540'][1].init(21, 24, 'S.startsWith(query, \'?\')');
function visit614_540_1(result) {
  _$jscoverage['/uri.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['539'][1].init(17, 24, 'typeof query == \'string\'');
function visit613_539_1(result) {
  _$jscoverage['/uri.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['434'][1].init(1643, 26, 'override || relativeUri[o]');
function visit612_434_1(result) {
  _$jscoverage['/uri.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['430'][1].init(25, 43, 'override || relativeUri[\'query\'].toString()');
function visit611_430_1(result) {
  _$jscoverage['/uri.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['429'][1].init(1399, 12, 'o == \'query\'');
function visit610_429_1(result) {
  _$jscoverage['/uri.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['420'][1].init(195, 20, 'lastSlashIndex != -1');
function visit609_420_1(result) {
  _$jscoverage['/uri.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['417'][1].init(242, 11, 'target.path');
function visit608_417_1(result) {
  _$jscoverage['/uri.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['414'][1].init(37, 31, 'target.hostname && !target.path');
function visit607_414_1(result) {
  _$jscoverage['/uri.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['413'][1].init(154, 24, '!S.startsWith(path, \'/\')');
function visit606_413_1(result) {
  _$jscoverage['/uri.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['410'][1].init(85, 4, 'path');
function visit605_410_1(result) {
  _$jscoverage['/uri.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['406'][1].init(107, 8, 'override');
function visit604_406_1(result) {
  _$jscoverage['/uri.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['404'][1].init(21, 11, 'o == \'path\'');
function visit603_404_1(result) {
  _$jscoverage['/uri.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['393'][1].init(18, 30, 'typeof relativeUri == \'string\'');
function visit602_393_1(result) {
  _$jscoverage['/uri.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['339'][1].init(42, 14, 'key == \'query\'');
function visit601_339_1(result) {
  _$jscoverage['/uri.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['338'][1].init(17, 7, 'v || \'\'');
function visit600_338_1(result) {
  _$jscoverage['/uri.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['291'][1].init(14, 22, 'uriStr instanceof Uri');
function visit599_291_1(result) {
  _$jscoverage['/uri.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['267'][1].init(16, 40, 'str1.toLowerCase() == str2.toLowerCase()');
function visit598_267_1(result) {
  _$jscoverage['/uri.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['263'][1].init(16, 15, 'str.length == 1');
function visit597_263_1(result) {
  _$jscoverage['/uri.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['240'][1].init(21, 20, 'key instanceof Query');
function visit596_240_1(result) {
  _$jscoverage['/uri.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['233'][1].init(146, 26, 'currentValue === undefined');
function visit595_233_1(result) {
  _$jscoverage['/uri.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['229'][1].init(103, 22, 'typeof key == \'string\'');
function visit594_229_1(result) {
  _$jscoverage['/uri.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['210'][1].init(76, 3, 'key');
function visit593_210_1(result) {
  _$jscoverage['/uri.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['192'][1].init(21, 20, 'key instanceof Query');
function visit592_192_1(result) {
  _$jscoverage['/uri.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['189'][1].init(127, 22, 'typeof key == \'string\'');
function visit591_189_1(result) {
  _$jscoverage['/uri.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['162'][1].init(127, 3, 'key');
function visit590_162_1(result) {
  _$jscoverage['/uri.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['147'][1].init(127, 3, 'key');
function visit589_147_1(result) {
  _$jscoverage['/uri.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['129'][1].init(22, 23, 'S.isArray(_queryMap[k])');
function visit588_129_1(result) {
  _$jscoverage['/uri.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['111'][1].init(56, 11, 'query || \'\'');
function visit587_111_1(result) {
  _$jscoverage['/uri.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['89'][1].init(23, 11, 'query || \'\'');
function visit586_89_1(result) {
  _$jscoverage['/uri.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].branchData['78'][1].init(13, 15, '!self._queryMap');
function visit585_78_1(result) {
  _$jscoverage['/uri.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/uri.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/uri.js'].functionData[0]++;
  _$jscoverage['/uri.js'].lineData[7]++;
  var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g, reDisallowedInPathName = /[#\?]/g, logger = S.getLogger('s/uri'), reDisallowedInQuery = /[#@]/g, reDisallowedInFragment = /#/g, URI_SPLIT_REG = new RegExp('^' + '(?:([\\w\\d+.-]+):)?' + '(?://' + '(?:([^/?#@]*)@)?' + '(' + '[\\w\\d\\-\\u0100-\\uffff.+%]*' + '|' + '\\[[^\\]]+\\]' + ')' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$'), Path = S.Path, REG_INFO = {
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
    if (visit585_78_1(!self._queryMap)) {
      _$jscoverage['/uri.js'].lineData[79]++;
      self._queryMap = S.unparam(self._query);
    }
  }
  _$jscoverage['/uri.js'].lineData[88]++;
  function Query(query) {
    _$jscoverage['/uri.js'].functionData[2]++;
    _$jscoverage['/uri.js'].lineData[89]++;
    this._query = visit586_89_1(query || '');
  }
  _$jscoverage['/uri.js'].lineData[92]++;
  Query.prototype = {
  constructor: Query, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[3]++;
  _$jscoverage['/uri.js'].lineData[100]++;
  return new Query(this.toString());
}, 
  reset: function(query) {
  _$jscoverage['/uri.js'].functionData[4]++;
  _$jscoverage['/uri.js'].lineData[110]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[111]++;
  self._query = visit587_111_1(query || '');
  _$jscoverage['/uri.js'].lineData[112]++;
  self._queryMap = null;
  _$jscoverage['/uri.js'].lineData[113]++;
  return self;
}, 
  count: function() {
  _$jscoverage['/uri.js'].functionData[5]++;
  _$jscoverage['/uri.js'].lineData[121]++;
  var self = this, count = 0, _queryMap, k;
  _$jscoverage['/uri.js'].lineData[125]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[126]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[127]++;
  for (k in _queryMap) {
    _$jscoverage['/uri.js'].lineData[129]++;
    if (visit588_129_1(S.isArray(_queryMap[k]))) {
      _$jscoverage['/uri.js'].lineData[130]++;
      count += _queryMap[k].length;
    } else {
      _$jscoverage['/uri.js'].lineData[132]++;
      count++;
    }
  }
  _$jscoverage['/uri.js'].lineData[136]++;
  return count;
}, 
  has: function(key) {
  _$jscoverage['/uri.js'].functionData[6]++;
  _$jscoverage['/uri.js'].lineData[144]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[145]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[146]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[147]++;
  if (visit589_147_1(key)) {
    _$jscoverage['/uri.js'].lineData[148]++;
    return key in _queryMap;
  } else {
    _$jscoverage['/uri.js'].lineData[150]++;
    return !S.isEmptyObject(_queryMap);
  }
}, 
  get: function(key) {
  _$jscoverage['/uri.js'].functionData[7]++;
  _$jscoverage['/uri.js'].lineData[159]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[160]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[161]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[162]++;
  if (visit590_162_1(key)) {
    _$jscoverage['/uri.js'].lineData[163]++;
    return _queryMap[key];
  } else {
    _$jscoverage['/uri.js'].lineData[165]++;
    return _queryMap;
  }
}, 
  keys: function() {
  _$jscoverage['/uri.js'].functionData[8]++;
  _$jscoverage['/uri.js'].lineData[174]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[175]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[176]++;
  return S.keys(self._queryMap);
}, 
  set: function(key, value) {
  _$jscoverage['/uri.js'].functionData[9]++;
  _$jscoverage['/uri.js'].lineData[186]++;
  var self = this, _queryMap;
  _$jscoverage['/uri.js'].lineData[187]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[188]++;
  _queryMap = self._queryMap;
  _$jscoverage['/uri.js'].lineData[189]++;
  if (visit591_189_1(typeof key == 'string')) {
    _$jscoverage['/uri.js'].lineData[190]++;
    self._queryMap[key] = value;
  } else {
    _$jscoverage['/uri.js'].lineData[192]++;
    if (visit592_192_1(key instanceof Query)) {
      _$jscoverage['/uri.js'].lineData[193]++;
      key = key.get();
    }
    _$jscoverage['/uri.js'].lineData[195]++;
    S.each(key, function(v, k) {
  _$jscoverage['/uri.js'].functionData[10]++;
  _$jscoverage['/uri.js'].lineData[196]++;
  _queryMap[k] = v;
});
  }
  _$jscoverage['/uri.js'].lineData[199]++;
  return self;
}, 
  remove: function(key) {
  _$jscoverage['/uri.js'].functionData[11]++;
  _$jscoverage['/uri.js'].lineData[208]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[209]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[210]++;
  if (visit593_210_1(key)) {
    _$jscoverage['/uri.js'].lineData[211]++;
    delete self._queryMap[key];
  } else {
    _$jscoverage['/uri.js'].lineData[213]++;
    self._queryMap = {};
  }
  _$jscoverage['/uri.js'].lineData[215]++;
  return self;
}, 
  add: function(key, value) {
  _$jscoverage['/uri.js'].functionData[12]++;
  _$jscoverage['/uri.js'].lineData[226]++;
  var self = this, _queryMap, currentValue;
  _$jscoverage['/uri.js'].lineData[229]++;
  if (visit594_229_1(typeof key == 'string')) {
    _$jscoverage['/uri.js'].lineData[230]++;
    parseQuery(self);
    _$jscoverage['/uri.js'].lineData[231]++;
    _queryMap = self._queryMap;
    _$jscoverage['/uri.js'].lineData[232]++;
    currentValue = _queryMap[key];
    _$jscoverage['/uri.js'].lineData[233]++;
    if (visit595_233_1(currentValue === undefined)) {
      _$jscoverage['/uri.js'].lineData[234]++;
      currentValue = value;
    } else {
      _$jscoverage['/uri.js'].lineData[236]++;
      currentValue = [].concat(currentValue).concat(value);
    }
    _$jscoverage['/uri.js'].lineData[238]++;
    _queryMap[key] = currentValue;
  } else {
    _$jscoverage['/uri.js'].lineData[240]++;
    if (visit596_240_1(key instanceof Query)) {
      _$jscoverage['/uri.js'].lineData[241]++;
      key = key.get();
    }
    _$jscoverage['/uri.js'].lineData[243]++;
    for (var k in key) {
      _$jscoverage['/uri.js'].lineData[244]++;
      self.add(k, key[k]);
    }
  }
  _$jscoverage['/uri.js'].lineData[247]++;
  return self;
}, 
  toString: function(serializeArray) {
  _$jscoverage['/uri.js'].functionData[13]++;
  _$jscoverage['/uri.js'].lineData[256]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[257]++;
  parseQuery(self);
  _$jscoverage['/uri.js'].lineData[258]++;
  return S.param(self._queryMap, undefined, undefined, serializeArray);
}};
  _$jscoverage['/uri.js'].lineData[262]++;
  function padding2(str) {
    _$jscoverage['/uri.js'].functionData[14]++;
    _$jscoverage['/uri.js'].lineData[263]++;
    return visit597_263_1(str.length == 1) ? '0' + str : str;
  }
  _$jscoverage['/uri.js'].lineData[266]++;
  function equalsIgnoreCase(str1, str2) {
    _$jscoverage['/uri.js'].functionData[15]++;
    _$jscoverage['/uri.js'].lineData[267]++;
    return visit598_267_1(str1.toLowerCase() == str2.toLowerCase());
  }
  _$jscoverage['/uri.js'].lineData[273]++;
  function encodeSpecialChars(str, specialCharsReg) {
    _$jscoverage['/uri.js'].functionData[16]++;
    _$jscoverage['/uri.js'].lineData[278]++;
    return encodeURI(str).replace(specialCharsReg, function(m) {
  _$jscoverage['/uri.js'].functionData[17]++;
  _$jscoverage['/uri.js'].lineData[279]++;
  return '%' + padding2(m.charCodeAt(0).toString(16));
});
  }
  _$jscoverage['/uri.js'].lineData[289]++;
  function Uri(uriStr) {
    _$jscoverage['/uri.js'].functionData[18]++;
    _$jscoverage['/uri.js'].lineData[291]++;
    if (visit599_291_1(uriStr instanceof Uri)) {
      _$jscoverage['/uri.js'].lineData[292]++;
      return uriStr['clone']();
    }
    _$jscoverage['/uri.js'].lineData[295]++;
    var components, self = this;
    _$jscoverage['/uri.js'].lineData[297]++;
    S.mix(self, {
  scheme: '', 
  userInfo: '', 
  hostname: '', 
  port: '', 
  path: '', 
  query: '', 
  fragment: ''});
    _$jscoverage['/uri.js'].lineData[335]++;
    components = Uri.getComponents(uriStr);
    _$jscoverage['/uri.js'].lineData[337]++;
    S.each(components, function(v, key) {
  _$jscoverage['/uri.js'].functionData[19]++;
  _$jscoverage['/uri.js'].lineData[338]++;
  v = visit600_338_1(v || '');
  _$jscoverage['/uri.js'].lineData[339]++;
  if (visit601_339_1(key == 'query')) {
    _$jscoverage['/uri.js'].lineData[341]++;
    self.query = new Query(v);
  } else {
    _$jscoverage['/uri.js'].lineData[344]++;
    try {
      _$jscoverage['/uri.js'].lineData[345]++;
      v = S.urlDecode(v);
    }    catch (e) {
  _$jscoverage['/uri.js'].lineData[347]++;
  logger.error(e + 'urlDecode error : ' + v);
}
    _$jscoverage['/uri.js'].lineData[350]++;
    self[key] = v;
  }
});
    _$jscoverage['/uri.js'].lineData[354]++;
    return self;
  }
  _$jscoverage['/uri.js'].lineData[357]++;
  Uri.prototype = {
  constructor: Uri, 
  clone: function() {
  _$jscoverage['/uri.js'].functionData[20]++;
  _$jscoverage['/uri.js'].lineData[365]++;
  var uri = new Uri(), self = this;
  _$jscoverage['/uri.js'].lineData[366]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[21]++;
  _$jscoverage['/uri.js'].lineData[367]++;
  uri[key] = self[key];
});
  _$jscoverage['/uri.js'].lineData[369]++;
  uri.query = uri.query.clone();
  _$jscoverage['/uri.js'].lineData[370]++;
  return uri;
}, 
  resolve: function(relativeUri) {
  _$jscoverage['/uri.js'].functionData[22]++;
  _$jscoverage['/uri.js'].lineData[393]++;
  if (visit602_393_1(typeof relativeUri == 'string')) {
    _$jscoverage['/uri.js'].lineData[394]++;
    relativeUri = new Uri(relativeUri);
  }
  _$jscoverage['/uri.js'].lineData[397]++;
  var self = this, override = 0, lastSlashIndex, order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'], target = self.clone();
  _$jscoverage['/uri.js'].lineData[403]++;
  S.each(order, function(o) {
  _$jscoverage['/uri.js'].functionData[23]++;
  _$jscoverage['/uri.js'].lineData[404]++;
  if (visit603_404_1(o == 'path')) {
    _$jscoverage['/uri.js'].lineData[406]++;
    if (visit604_406_1(override)) {
      _$jscoverage['/uri.js'].lineData[407]++;
      target[o] = relativeUri[o];
    } else {
      _$jscoverage['/uri.js'].lineData[409]++;
      var path = relativeUri['path'];
      _$jscoverage['/uri.js'].lineData[410]++;
      if (visit605_410_1(path)) {
        _$jscoverage['/uri.js'].lineData[412]++;
        override = 1;
        _$jscoverage['/uri.js'].lineData[413]++;
        if (visit606_413_1(!S.startsWith(path, '/'))) {
          _$jscoverage['/uri.js'].lineData[414]++;
          if (visit607_414_1(target.hostname && !target.path)) {
            _$jscoverage['/uri.js'].lineData[416]++;
            path = '/' + path;
          } else {
            _$jscoverage['/uri.js'].lineData[417]++;
            if (visit608_417_1(target.path)) {
              _$jscoverage['/uri.js'].lineData[419]++;
              lastSlashIndex = target.path.lastIndexOf('/');
              _$jscoverage['/uri.js'].lineData[420]++;
              if (visit609_420_1(lastSlashIndex != -1)) {
                _$jscoverage['/uri.js'].lineData[421]++;
                path = target.path.slice(0, lastSlashIndex + 1) + path;
              }
            }
          }
        }
        _$jscoverage['/uri.js'].lineData[426]++;
        target.path = Path.normalize(path);
      }
    }
  } else {
    _$jscoverage['/uri.js'].lineData[429]++;
    if (visit610_429_1(o == 'query')) {
      _$jscoverage['/uri.js'].lineData[430]++;
      if (visit611_430_1(override || relativeUri['query'].toString())) {
        _$jscoverage['/uri.js'].lineData[431]++;
        target.query = relativeUri['query'].clone();
        _$jscoverage['/uri.js'].lineData[432]++;
        override = 1;
      }
    } else {
      _$jscoverage['/uri.js'].lineData[434]++;
      if (visit612_434_1(override || relativeUri[o])) {
        _$jscoverage['/uri.js'].lineData[435]++;
        target[o] = relativeUri[o];
        _$jscoverage['/uri.js'].lineData[436]++;
        override = 1;
      }
    }
  }
});
  _$jscoverage['/uri.js'].lineData[440]++;
  return target;
}, 
  getScheme: function() {
  _$jscoverage['/uri.js'].functionData[24]++;
  _$jscoverage['/uri.js'].lineData[448]++;
  return this.scheme;
}, 
  setScheme: function(scheme) {
  _$jscoverage['/uri.js'].functionData[25]++;
  _$jscoverage['/uri.js'].lineData[457]++;
  this.scheme = scheme;
  _$jscoverage['/uri.js'].lineData[458]++;
  return this;
}, 
  getHostname: function() {
  _$jscoverage['/uri.js'].functionData[26]++;
  _$jscoverage['/uri.js'].lineData[466]++;
  return this.hostname;
}, 
  setHostname: function(hostname) {
  _$jscoverage['/uri.js'].functionData[27]++;
  _$jscoverage['/uri.js'].lineData[475]++;
  this.hostname = hostname;
  _$jscoverage['/uri.js'].lineData[476]++;
  return this;
}, 
  'setUserInfo': function(userInfo) {
  _$jscoverage['/uri.js'].functionData[28]++;
  _$jscoverage['/uri.js'].lineData[485]++;
  this.userInfo = userInfo;
  _$jscoverage['/uri.js'].lineData[486]++;
  return this;
}, 
  getUserInfo: function() {
  _$jscoverage['/uri.js'].functionData[29]++;
  _$jscoverage['/uri.js'].lineData[494]++;
  return this.userInfo;
}, 
  'setPort': function(port) {
  _$jscoverage['/uri.js'].functionData[30]++;
  _$jscoverage['/uri.js'].lineData[503]++;
  this.port = port;
  _$jscoverage['/uri.js'].lineData[504]++;
  return this;
}, 
  'getPort': function() {
  _$jscoverage['/uri.js'].functionData[31]++;
  _$jscoverage['/uri.js'].lineData[512]++;
  return this.port;
}, 
  setPath: function(path) {
  _$jscoverage['/uri.js'].functionData[32]++;
  _$jscoverage['/uri.js'].lineData[521]++;
  this.path = path;
  _$jscoverage['/uri.js'].lineData[522]++;
  return this;
}, 
  getPath: function() {
  _$jscoverage['/uri.js'].functionData[33]++;
  _$jscoverage['/uri.js'].lineData[530]++;
  return this.path;
}, 
  'setQuery': function(query) {
  _$jscoverage['/uri.js'].functionData[34]++;
  _$jscoverage['/uri.js'].lineData[539]++;
  if (visit613_539_1(typeof query == 'string')) {
    _$jscoverage['/uri.js'].lineData[540]++;
    if (visit614_540_1(S.startsWith(query, '?'))) {
      _$jscoverage['/uri.js'].lineData[541]++;
      query = query.slice(1);
    }
    _$jscoverage['/uri.js'].lineData[543]++;
    query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
  }
  _$jscoverage['/uri.js'].lineData[545]++;
  this.query = query;
  _$jscoverage['/uri.js'].lineData[546]++;
  return this;
}, 
  getQuery: function() {
  _$jscoverage['/uri.js'].functionData[35]++;
  _$jscoverage['/uri.js'].lineData[554]++;
  return this.query;
}, 
  getFragment: function() {
  _$jscoverage['/uri.js'].functionData[36]++;
  _$jscoverage['/uri.js'].lineData[562]++;
  return this.fragment;
}, 
  'setFragment': function(fragment) {
  _$jscoverage['/uri.js'].functionData[37]++;
  _$jscoverage['/uri.js'].lineData[571]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[572]++;
  if (visit615_572_1(S.startsWith(fragment, '#'))) {
    _$jscoverage['/uri.js'].lineData[573]++;
    fragment = fragment.slice(1);
  }
  _$jscoverage['/uri.js'].lineData[575]++;
  self.fragment = fragment;
  _$jscoverage['/uri.js'].lineData[576]++;
  return self;
}, 
  isSameOriginAs: function(other) {
  _$jscoverage['/uri.js'].functionData[38]++;
  _$jscoverage['/uri.js'].lineData[585]++;
  var self = this;
  _$jscoverage['/uri.js'].lineData[587]++;
  return visit616_587_1(equalsIgnoreCase(self.hostname, other['hostname']) && visit617_588_1(equalsIgnoreCase(self.scheme, other['scheme']) && equalsIgnoreCase(self.port, other['port'])));
}, 
  toString: function(serializeArray) {
  _$jscoverage['/uri.js'].functionData[39]++;
  _$jscoverage['/uri.js'].lineData[602]++;
  var out = [], self = this, scheme, hostname, path, port, fragment, query, userInfo;
  _$jscoverage['/uri.js'].lineData[612]++;
  if (visit618_612_1(scheme = self.scheme)) {
    _$jscoverage['/uri.js'].lineData[613]++;
    out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
    _$jscoverage['/uri.js'].lineData[614]++;
    out.push(':');
  }
  _$jscoverage['/uri.js'].lineData[617]++;
  if (visit619_617_1(hostname = self.hostname)) {
    _$jscoverage['/uri.js'].lineData[618]++;
    out.push('//');
    _$jscoverage['/uri.js'].lineData[619]++;
    if (visit620_619_1(userInfo = self.userInfo)) {
      _$jscoverage['/uri.js'].lineData[620]++;
      out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
      _$jscoverage['/uri.js'].lineData[621]++;
      out.push('@');
    }
    _$jscoverage['/uri.js'].lineData[624]++;
    out.push(encodeURIComponent(hostname));
    _$jscoverage['/uri.js'].lineData[626]++;
    if (visit621_626_1(port = self.port)) {
      _$jscoverage['/uri.js'].lineData[627]++;
      out.push(':');
      _$jscoverage['/uri.js'].lineData[628]++;
      out.push(port);
    }
  }
  _$jscoverage['/uri.js'].lineData[632]++;
  if (visit622_632_1(path = self.path)) {
    _$jscoverage['/uri.js'].lineData[633]++;
    if (visit623_633_1(hostname && !S.startsWith(path, '/'))) {
      _$jscoverage['/uri.js'].lineData[634]++;
      path = '/' + path;
    }
    _$jscoverage['/uri.js'].lineData[636]++;
    path = Path.normalize(path);
    _$jscoverage['/uri.js'].lineData[637]++;
    out.push(encodeSpecialChars(path, reDisallowedInPathName));
  }
  _$jscoverage['/uri.js'].lineData[640]++;
  if (visit624_640_1(query = (self.query.toString.call(self.query, serializeArray)))) {
    _$jscoverage['/uri.js'].lineData[641]++;
    out.push('?');
    _$jscoverage['/uri.js'].lineData[642]++;
    out.push(query);
  }
  _$jscoverage['/uri.js'].lineData[645]++;
  if (visit625_645_1(fragment = self.fragment)) {
    _$jscoverage['/uri.js'].lineData[646]++;
    out.push('#');
    _$jscoverage['/uri.js'].lineData[647]++;
    out.push(encodeSpecialChars(fragment, reDisallowedInFragment));
  }
  _$jscoverage['/uri.js'].lineData[650]++;
  return out.join('');
}};
  _$jscoverage['/uri.js'].lineData[654]++;
  Uri.Query = Query;
  _$jscoverage['/uri.js'].lineData[656]++;
  Uri.getComponents = function(url) {
  _$jscoverage['/uri.js'].functionData[40]++;
  _$jscoverage['/uri.js'].lineData[657]++;
  url = visit626_657_1(url || "");
  _$jscoverage['/uri.js'].lineData[658]++;
  var m = visit627_658_1(url.match(URI_SPLIT_REG) || []), ret = {};
  _$jscoverage['/uri.js'].lineData[660]++;
  S.each(REG_INFO, function(index, key) {
  _$jscoverage['/uri.js'].functionData[41]++;
  _$jscoverage['/uri.js'].lineData[661]++;
  ret[key] = m[index];
});
  _$jscoverage['/uri.js'].lineData[663]++;
  return ret;
};
  _$jscoverage['/uri.js'].lineData[666]++;
  S.Uri = Uri;
})(KISSY);
