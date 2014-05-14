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
if (! _$jscoverage['/tree/node.js']) {
  _$jscoverage['/tree/node.js'] = {};
  _$jscoverage['/tree/node.js'].lineData = [];
  _$jscoverage['/tree/node.js'].lineData[6] = 0;
  _$jscoverage['/tree/node.js'].lineData[7] = 0;
  _$jscoverage['/tree/node.js'].lineData[8] = 0;
  _$jscoverage['/tree/node.js'].lineData[9] = 0;
  _$jscoverage['/tree/node.js'].lineData[11] = 0;
  _$jscoverage['/tree/node.js'].lineData[14] = 0;
  _$jscoverage['/tree/node.js'].lineData[29] = 0;
  _$jscoverage['/tree/node.js'].lineData[30] = 0;
  _$jscoverage['/tree/node.js'].lineData[37] = 0;
  _$jscoverage['/tree/node.js'].lineData[39] = 0;
  _$jscoverage['/tree/node.js'].lineData[50] = 0;
  _$jscoverage['/tree/node.js'].lineData[51] = 0;
  _$jscoverage['/tree/node.js'].lineData[52] = 0;
  _$jscoverage['/tree/node.js'].lineData[57] = 0;
  _$jscoverage['/tree/node.js'].lineData[58] = 0;
  _$jscoverage['/tree/node.js'].lineData[64] = 0;
  _$jscoverage['/tree/node.js'].lineData[74] = 0;
  _$jscoverage['/tree/node.js'].lineData[76] = 0;
  _$jscoverage['/tree/node.js'].lineData[81] = 0;
  _$jscoverage['/tree/node.js'].lineData[82] = 0;
  _$jscoverage['/tree/node.js'].lineData[87] = 0;
  _$jscoverage['/tree/node.js'].lineData[88] = 0;
  _$jscoverage['/tree/node.js'].lineData[93] = 0;
  _$jscoverage['/tree/node.js'].lineData[94] = 0;
  _$jscoverage['/tree/node.js'].lineData[99] = 0;
  _$jscoverage['/tree/node.js'].lineData[100] = 0;
  _$jscoverage['/tree/node.js'].lineData[105] = 0;
  _$jscoverage['/tree/node.js'].lineData[106] = 0;
  _$jscoverage['/tree/node.js'].lineData[108] = 0;
  _$jscoverage['/tree/node.js'].lineData[110] = 0;
  _$jscoverage['/tree/node.js'].lineData[115] = 0;
  _$jscoverage['/tree/node.js'].lineData[116] = 0;
  _$jscoverage['/tree/node.js'].lineData[117] = 0;
  _$jscoverage['/tree/node.js'].lineData[119] = 0;
  _$jscoverage['/tree/node.js'].lineData[122] = 0;
  _$jscoverage['/tree/node.js'].lineData[125] = 0;
  _$jscoverage['/tree/node.js'].lineData[126] = 0;
  _$jscoverage['/tree/node.js'].lineData[129] = 0;
  _$jscoverage['/tree/node.js'].lineData[130] = 0;
  _$jscoverage['/tree/node.js'].lineData[133] = 0;
  _$jscoverage['/tree/node.js'].lineData[137] = 0;
  _$jscoverage['/tree/node.js'].lineData[141] = 0;
  _$jscoverage['/tree/node.js'].lineData[142] = 0;
  _$jscoverage['/tree/node.js'].lineData[144] = 0;
  _$jscoverage['/tree/node.js'].lineData[145] = 0;
  _$jscoverage['/tree/node.js'].lineData[146] = 0;
  _$jscoverage['/tree/node.js'].lineData[147] = 0;
  _$jscoverage['/tree/node.js'].lineData[149] = 0;
  _$jscoverage['/tree/node.js'].lineData[153] = 0;
  _$jscoverage['/tree/node.js'].lineData[157] = 0;
  _$jscoverage['/tree/node.js'].lineData[158] = 0;
  _$jscoverage['/tree/node.js'].lineData[160] = 0;
  _$jscoverage['/tree/node.js'].lineData[161] = 0;
  _$jscoverage['/tree/node.js'].lineData[162] = 0;
  _$jscoverage['/tree/node.js'].lineData[163] = 0;
  _$jscoverage['/tree/node.js'].lineData[165] = 0;
  _$jscoverage['/tree/node.js'].lineData[172] = 0;
  _$jscoverage['/tree/node.js'].lineData[177] = 0;
  _$jscoverage['/tree/node.js'].lineData[178] = 0;
  _$jscoverage['/tree/node.js'].lineData[182] = 0;
  _$jscoverage['/tree/node.js'].lineData[183] = 0;
  _$jscoverage['/tree/node.js'].lineData[184] = 0;
  _$jscoverage['/tree/node.js'].lineData[185] = 0;
  _$jscoverage['/tree/node.js'].lineData[187] = 0;
  _$jscoverage['/tree/node.js'].lineData[188] = 0;
  _$jscoverage['/tree/node.js'].lineData[190] = 0;
  _$jscoverage['/tree/node.js'].lineData[197] = 0;
  _$jscoverage['/tree/node.js'].lineData[198] = 0;
  _$jscoverage['/tree/node.js'].lineData[200] = 0;
  _$jscoverage['/tree/node.js'].lineData[201] = 0;
  _$jscoverage['/tree/node.js'].lineData[206] = 0;
  _$jscoverage['/tree/node.js'].lineData[213] = 0;
  _$jscoverage['/tree/node.js'].lineData[214] = 0;
  _$jscoverage['/tree/node.js'].lineData[215] = 0;
  _$jscoverage['/tree/node.js'].lineData[217] = 0;
  _$jscoverage['/tree/node.js'].lineData[218] = 0;
  _$jscoverage['/tree/node.js'].lineData[219] = 0;
  _$jscoverage['/tree/node.js'].lineData[220] = 0;
  _$jscoverage['/tree/node.js'].lineData[222] = 0;
  _$jscoverage['/tree/node.js'].lineData[223] = 0;
  _$jscoverage['/tree/node.js'].lineData[227] = 0;
  _$jscoverage['/tree/node.js'].lineData[228] = 0;
  _$jscoverage['/tree/node.js'].lineData[236] = 0;
  _$jscoverage['/tree/node.js'].lineData[242] = 0;
  _$jscoverage['/tree/node.js'].lineData[246] = 0;
  _$jscoverage['/tree/node.js'].lineData[250] = 0;
  _$jscoverage['/tree/node.js'].lineData[252] = 0;
  _$jscoverage['/tree/node.js'].lineData[253] = 0;
  _$jscoverage['/tree/node.js'].lineData[254] = 0;
  _$jscoverage['/tree/node.js'].lineData[255] = 0;
  _$jscoverage['/tree/node.js'].lineData[259] = 0;
  _$jscoverage['/tree/node.js'].lineData[261] = 0;
  _$jscoverage['/tree/node.js'].lineData[262] = 0;
  _$jscoverage['/tree/node.js'].lineData[263] = 0;
  _$jscoverage['/tree/node.js'].lineData[264] = 0;
  _$jscoverage['/tree/node.js'].lineData[265] = 0;
  _$jscoverage['/tree/node.js'].lineData[273] = 0;
  _$jscoverage['/tree/node.js'].lineData[274] = 0;
  _$jscoverage['/tree/node.js'].lineData[275] = 0;
  _$jscoverage['/tree/node.js'].lineData[276] = 0;
  _$jscoverage['/tree/node.js'].lineData[284] = 0;
  _$jscoverage['/tree/node.js'].lineData[285] = 0;
  _$jscoverage['/tree/node.js'].lineData[286] = 0;
  _$jscoverage['/tree/node.js'].lineData[287] = 0;
  _$jscoverage['/tree/node.js'].lineData[312] = 0;
  _$jscoverage['/tree/node.js'].lineData[313] = 0;
  _$jscoverage['/tree/node.js'].lineData[314] = 0;
  _$jscoverage['/tree/node.js'].lineData[315] = 0;
  _$jscoverage['/tree/node.js'].lineData[316] = 0;
  _$jscoverage['/tree/node.js'].lineData[318] = 0;
  _$jscoverage['/tree/node.js'].lineData[324] = 0;
  _$jscoverage['/tree/node.js'].lineData[330] = 0;
  _$jscoverage['/tree/node.js'].lineData[340] = 0;
  _$jscoverage['/tree/node.js'].lineData[350] = 0;
  _$jscoverage['/tree/node.js'].lineData[373] = 0;
  _$jscoverage['/tree/node.js'].lineData[392] = 0;
  _$jscoverage['/tree/node.js'].lineData[394] = 0;
  _$jscoverage['/tree/node.js'].lineData[395] = 0;
  _$jscoverage['/tree/node.js'].lineData[397] = 0;
  _$jscoverage['/tree/node.js'].lineData[416] = 0;
  _$jscoverage['/tree/node.js'].lineData[427] = 0;
  _$jscoverage['/tree/node.js'].lineData[428] = 0;
  _$jscoverage['/tree/node.js'].lineData[429] = 0;
  _$jscoverage['/tree/node.js'].lineData[430] = 0;
  _$jscoverage['/tree/node.js'].lineData[434] = 0;
  _$jscoverage['/tree/node.js'].lineData[435] = 0;
  _$jscoverage['/tree/node.js'].lineData[436] = 0;
  _$jscoverage['/tree/node.js'].lineData[437] = 0;
  _$jscoverage['/tree/node.js'].lineData[438] = 0;
  _$jscoverage['/tree/node.js'].lineData[442] = 0;
  _$jscoverage['/tree/node.js'].lineData[443] = 0;
  _$jscoverage['/tree/node.js'].lineData[444] = 0;
  _$jscoverage['/tree/node.js'].lineData[445] = 0;
  _$jscoverage['/tree/node.js'].lineData[450] = 0;
  _$jscoverage['/tree/node.js'].lineData[451] = 0;
  _$jscoverage['/tree/node.js'].lineData[457] = 0;
  _$jscoverage['/tree/node.js'].lineData[460] = 0;
  _$jscoverage['/tree/node.js'].lineData[461] = 0;
  _$jscoverage['/tree/node.js'].lineData[463] = 0;
  _$jscoverage['/tree/node.js'].lineData[466] = 0;
  _$jscoverage['/tree/node.js'].lineData[467] = 0;
  _$jscoverage['/tree/node.js'].lineData[469] = 0;
  _$jscoverage['/tree/node.js'].lineData[470] = 0;
  _$jscoverage['/tree/node.js'].lineData[473] = 0;
  _$jscoverage['/tree/node.js'].lineData[477] = 0;
  _$jscoverage['/tree/node.js'].lineData[478] = 0;
  _$jscoverage['/tree/node.js'].lineData[479] = 0;
  _$jscoverage['/tree/node.js'].lineData[480] = 0;
  _$jscoverage['/tree/node.js'].lineData[482] = 0;
  _$jscoverage['/tree/node.js'].lineData[484] = 0;
  _$jscoverage['/tree/node.js'].lineData[488] = 0;
  _$jscoverage['/tree/node.js'].lineData[489] = 0;
  _$jscoverage['/tree/node.js'].lineData[492] = 0;
  _$jscoverage['/tree/node.js'].lineData[493] = 0;
  _$jscoverage['/tree/node.js'].lineData[497] = 0;
  _$jscoverage['/tree/node.js'].lineData[498] = 0;
  _$jscoverage['/tree/node.js'].lineData[499] = 0;
  _$jscoverage['/tree/node.js'].lineData[500] = 0;
  _$jscoverage['/tree/node.js'].lineData[502] = 0;
  _$jscoverage['/tree/node.js'].lineData[509] = 0;
  _$jscoverage['/tree/node.js'].lineData[510] = 0;
  _$jscoverage['/tree/node.js'].lineData[513] = 0;
  _$jscoverage['/tree/node.js'].lineData[514] = 0;
  _$jscoverage['/tree/node.js'].lineData[515] = 0;
  _$jscoverage['/tree/node.js'].lineData[516] = 0;
  _$jscoverage['/tree/node.js'].lineData[517] = 0;
  _$jscoverage['/tree/node.js'].lineData[521] = 0;
  _$jscoverage['/tree/node.js'].lineData[522] = 0;
  _$jscoverage['/tree/node.js'].lineData[523] = 0;
  _$jscoverage['/tree/node.js'].lineData[525] = 0;
  _$jscoverage['/tree/node.js'].lineData[526] = 0;
  _$jscoverage['/tree/node.js'].lineData[527] = 0;
  _$jscoverage['/tree/node.js'].lineData[529] = 0;
  _$jscoverage['/tree/node.js'].lineData[534] = 0;
  _$jscoverage['/tree/node.js'].lineData[535] = 0;
  _$jscoverage['/tree/node.js'].lineData[536] = 0;
  _$jscoverage['/tree/node.js'].lineData[537] = 0;
  _$jscoverage['/tree/node.js'].lineData[540] = 0;
  _$jscoverage['/tree/node.js'].lineData[541] = 0;
  _$jscoverage['/tree/node.js'].lineData[542] = 0;
  _$jscoverage['/tree/node.js'].lineData[543] = 0;
}
if (! _$jscoverage['/tree/node.js'].functionData) {
  _$jscoverage['/tree/node.js'].functionData = [];
  _$jscoverage['/tree/node.js'].functionData[0] = 0;
  _$jscoverage['/tree/node.js'].functionData[1] = 0;
  _$jscoverage['/tree/node.js'].functionData[2] = 0;
  _$jscoverage['/tree/node.js'].functionData[3] = 0;
  _$jscoverage['/tree/node.js'].functionData[4] = 0;
  _$jscoverage['/tree/node.js'].functionData[5] = 0;
  _$jscoverage['/tree/node.js'].functionData[6] = 0;
  _$jscoverage['/tree/node.js'].functionData[7] = 0;
  _$jscoverage['/tree/node.js'].functionData[8] = 0;
  _$jscoverage['/tree/node.js'].functionData[9] = 0;
  _$jscoverage['/tree/node.js'].functionData[10] = 0;
  _$jscoverage['/tree/node.js'].functionData[11] = 0;
  _$jscoverage['/tree/node.js'].functionData[12] = 0;
  _$jscoverage['/tree/node.js'].functionData[13] = 0;
  _$jscoverage['/tree/node.js'].functionData[14] = 0;
  _$jscoverage['/tree/node.js'].functionData[15] = 0;
  _$jscoverage['/tree/node.js'].functionData[16] = 0;
  _$jscoverage['/tree/node.js'].functionData[17] = 0;
  _$jscoverage['/tree/node.js'].functionData[18] = 0;
  _$jscoverage['/tree/node.js'].functionData[19] = 0;
  _$jscoverage['/tree/node.js'].functionData[20] = 0;
  _$jscoverage['/tree/node.js'].functionData[21] = 0;
  _$jscoverage['/tree/node.js'].functionData[22] = 0;
  _$jscoverage['/tree/node.js'].functionData[23] = 0;
  _$jscoverage['/tree/node.js'].functionData[24] = 0;
  _$jscoverage['/tree/node.js'].functionData[25] = 0;
  _$jscoverage['/tree/node.js'].functionData[26] = 0;
  _$jscoverage['/tree/node.js'].functionData[27] = 0;
  _$jscoverage['/tree/node.js'].functionData[28] = 0;
  _$jscoverage['/tree/node.js'].functionData[29] = 0;
  _$jscoverage['/tree/node.js'].functionData[30] = 0;
  _$jscoverage['/tree/node.js'].functionData[31] = 0;
  _$jscoverage['/tree/node.js'].functionData[32] = 0;
  _$jscoverage['/tree/node.js'].functionData[33] = 0;
  _$jscoverage['/tree/node.js'].functionData[34] = 0;
  _$jscoverage['/tree/node.js'].functionData[35] = 0;
  _$jscoverage['/tree/node.js'].functionData[36] = 0;
  _$jscoverage['/tree/node.js'].functionData[37] = 0;
  _$jscoverage['/tree/node.js'].functionData[38] = 0;
  _$jscoverage['/tree/node.js'].functionData[39] = 0;
}
if (! _$jscoverage['/tree/node.js'].branchData) {
  _$jscoverage['/tree/node.js'].branchData = {};
  _$jscoverage['/tree/node.js'].branchData['105'] = [];
  _$jscoverage['/tree/node.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['105'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['115'] = [];
  _$jscoverage['/tree/node.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['116'] = [];
  _$jscoverage['/tree/node.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['129'] = [];
  _$jscoverage['/tree/node.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['141'] = [];
  _$jscoverage['/tree/node.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['146'] = [];
  _$jscoverage['/tree/node.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['157'] = [];
  _$jscoverage['/tree/node.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['162'] = [];
  _$jscoverage['/tree/node.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['184'] = [];
  _$jscoverage['/tree/node.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['200'] = [];
  _$jscoverage['/tree/node.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['213'] = [];
  _$jscoverage['/tree/node.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['218'] = [];
  _$jscoverage['/tree/node.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['264'] = [];
  _$jscoverage['/tree/node.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['264'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['313'] = [];
  _$jscoverage['/tree/node.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['315'] = [];
  _$jscoverage['/tree/node.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['373'] = [];
  _$jscoverage['/tree/node.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['394'] = [];
  _$jscoverage['/tree/node.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['429'] = [];
  _$jscoverage['/tree/node.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['436'] = [];
  _$jscoverage['/tree/node.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['444'] = [];
  _$jscoverage['/tree/node.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['452'] = [];
  _$jscoverage['/tree/node.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['453'] = [];
  _$jscoverage['/tree/node.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['457'] = [];
  _$jscoverage['/tree/node.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['457'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['463'] = [];
  _$jscoverage['/tree/node.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['463'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['463'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['463'][4] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['469'] = [];
  _$jscoverage['/tree/node.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['479'] = [];
  _$jscoverage['/tree/node.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['492'] = [];
  _$jscoverage['/tree/node.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['499'] = [];
  _$jscoverage['/tree/node.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['515'] = [];
  _$jscoverage['/tree/node.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['522'] = [];
  _$jscoverage['/tree/node.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['526'] = [];
  _$jscoverage['/tree/node.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['540'] = [];
  _$jscoverage['/tree/node.js'].branchData['540'][1] = new BranchData();
}
_$jscoverage['/tree/node.js'].branchData['540'][1].init(183, 11, 'index < len');
function visit68_540_1(result) {
  _$jscoverage['/tree/node.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['526'][1].init(18, 28, 'typeof setDepth === \'number\'');
function visit67_526_1(result) {
  _$jscoverage['/tree/node.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['522'][1].init(14, 22, 'setDepth !== undefined');
function visit66_522_1(result) {
  _$jscoverage['/tree/node.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['515'][1].init(52, 4, 'tree');
function visit65_515_1(result) {
  _$jscoverage['/tree/node.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['499'][1].init(298, 37, '!n && (parent = parent.get(\'parent\'))');
function visit64_499_1(result) {
  _$jscoverage['/tree/node.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['492'][1].init(97, 39, 'self.get(\'expanded\') && children.length');
function visit63_492_1(result) {
  _$jscoverage['/tree/node.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['479'][1].init(47, 5, '!prev');
function visit62_479_1(result) {
  _$jscoverage['/tree/node.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['469'][1].init(95, 41, '!self.get(\'expanded\') || !children.length');
function visit61_469_1(result) {
  _$jscoverage['/tree/node.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['463'][4].init(122, 20, 'isLeaf === undefined');
function visit60_463_4(result) {
  _$jscoverage['/tree/node.js'].branchData['463'][4].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['463'][3].init(122, 51, 'isLeaf === undefined && self.get(\'children\').length');
function visit59_463_3(result) {
  _$jscoverage['/tree/node.js'].branchData['463'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['463'][2].init(101, 16, 'isLeaf === false');
function visit58_463_2(result) {
  _$jscoverage['/tree/node.js'].branchData['463'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['463'][1].init(101, 73, 'isLeaf === false || (isLeaf === undefined && self.get(\'children\').length)');
function visit57_463_1(result) {
  _$jscoverage['/tree/node.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['457'][2].init(253, 18, 'lastChild === self');
function visit56_457_2(result) {
  _$jscoverage['/tree/node.js'].branchData['457'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['457'][1].init(239, 32, '!lastChild || lastChild === self');
function visit55_457_1(result) {
  _$jscoverage['/tree/node.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['453'][1].init(115, 41, 'children && children[children.length - 1]');
function visit54_453_1(result) {
  _$jscoverage['/tree/node.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['452'][1].init(56, 32, 'parent && parent.get(\'children\')');
function visit53_452_1(result) {
  _$jscoverage['/tree/node.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['444'][1].init(40, 17, 'e.target === self');
function visit52_444_1(result) {
  _$jscoverage['/tree/node.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['436'][1].init(40, 17, 'e.target === self');
function visit51_436_1(result) {
  _$jscoverage['/tree/node.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['429'][1].init(40, 17, 'e.target === self');
function visit50_429_1(result) {
  _$jscoverage['/tree/node.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['394'][1].init(105, 20, 'from && !from.isTree');
function visit49_394_1(result) {
  _$jscoverage['/tree/node.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['373'][1].init(29, 48, 'this.get(\'childrenEl\').css(\'display\') !== \'none\'');
function visit48_373_1(result) {
  _$jscoverage['/tree/node.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['315'][1].init(180, 43, 'el.hasClass(self.getBaseCssClass(\'folder\'))');
function visit47_315_1(result) {
  _$jscoverage['/tree/node.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['313'][1].init(64, 41, 'el.hasClass(self.getBaseCssClass(\'leaf\'))');
function visit46_313_1(result) {
  _$jscoverage['/tree/node.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['264'][2].init(281, 32, 'e && e.byPassSetTreeSelectedItem');
function visit45_264_2(result) {
  _$jscoverage['/tree/node.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['264'][1].init(279, 35, '!(e && e.byPassSetTreeSelectedItem)');
function visit44_264_1(result) {
  _$jscoverage['/tree/node.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['218'][1].init(76, 8, 'expanded');
function visit43_218_1(result) {
  _$jscoverage['/tree/node.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['213'][1].init(273, 10, 'isNodeLeaf');
function visit42_213_1(result) {
  _$jscoverage['/tree/node.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['200'][1].init(159, 25, 'self === self.get(\'tree\')');
function visit41_200_1(result) {
  _$jscoverage['/tree/node.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['184'][1].init(322, 39, 'target.equals(self.get(\'expandIconEl\'))');
function visit40_184_1(result) {
  _$jscoverage['/tree/node.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['162'][1].init(317, 11, 'index === 0');
function visit39_162_1(result) {
  _$jscoverage['/tree/node.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['157'][1].init(145, 7, '!parent');
function visit38_157_1(result) {
  _$jscoverage['/tree/node.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['146'][1].init(317, 29, 'index === siblings.length - 1');
function visit37_146_1(result) {
  _$jscoverage['/tree/node.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['141'][1].init(145, 7, '!parent');
function visit36_141_1(result) {
  _$jscoverage['/tree/node.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['129'][1].init(2165, 16, 'nodeToBeSelected');
function visit35_129_1(result) {
  _$jscoverage['/tree/node.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['116'][1].init(30, 9, '!expanded');
function visit34_116_1(result) {
  _$jscoverage['/tree/node.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['115'][2].init(63, 16, 'isLeaf === false');
function visit33_115_2(result) {
  _$jscoverage['/tree/node.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['115'][1].init(44, 35, 'children.length || isLeaf === false');
function visit32_115_1(result) {
  _$jscoverage['/tree/node.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['105'][3].init(75, 16, 'isLeaf === false');
function visit31_105_3(result) {
  _$jscoverage['/tree/node.js'].branchData['105'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['105'][2].init(56, 35, 'children.length || isLeaf === false');
function visit30_105_2(result) {
  _$jscoverage['/tree/node.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['105'][1].init(43, 49, 'expanded && (children.length || isLeaf === false)');
function visit29_105_1(result) {
  _$jscoverage['/tree/node.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/node.js'].functionData[0]++;
  _$jscoverage['/tree/node.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/node.js'].lineData[8]++;
  var Container = require('component/container');
  _$jscoverage['/tree/node.js'].lineData[9]++;
  var util = require('util');
  _$jscoverage['/tree/node.js'].lineData[11]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/tree/node.js'].lineData[14]++;
  var SELECTED_CLS = 'selected', EXPAND_EL_CLS = 'expand-icon', COMMON_EXPAND_EL_CLS = 'expand-icon-{t}', EXPAND_ICON_EL_FILE_CLS = [COMMON_EXPAND_EL_CLS].join(' '), EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [COMMON_EXPAND_EL_CLS + 'minus'].join(' '), EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [COMMON_EXPAND_EL_CLS + 'plus'].join(' '), ICON_EL_FILE_CLS = ['file-icon'].join(' '), ICON_EL_FOLDER_EXPAND_CLS = ['expanded-folder-icon'].join(' '), ICON_EL_FOLDER_COLLAPSE_CLS = ['collapsed-folder-icon'].join(' '), ROW_EL_CLS = 'row', CHILDREN_CLS = 'children', CHILDREN_CLS_L = 'lchildren';
  _$jscoverage['/tree/node.js'].lineData[29]++;
  var TreeNodeTpl = require('./node-xtpl');
  _$jscoverage['/tree/node.js'].lineData[30]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/tree/node.js'].lineData[37]++;
  return Container.extend([ContentBox], {
  beforeCreateDom: function(renderData) {
  _$jscoverage['/tree/node.js'].functionData[1]++;
  _$jscoverage['/tree/node.js'].lineData[39]++;
  util.mix(renderData.elAttrs, {
  role: 'tree-node', 
  'aria-labelledby': 'ks-content' + renderData.id, 
  'aria-expanded': renderData.expanded ? 'true' : 'false', 
  'aria-selected': renderData.selected ? 'true' : 'false', 
  'aria-level': renderData.depth, 
  title: renderData.tooltip});
}, 
  bindUI: function() {
  _$jscoverage['/tree/node.js'].functionData[2]++;
  _$jscoverage['/tree/node.js'].lineData[50]++;
  this.on('afterAddChild', onAddChild);
  _$jscoverage['/tree/node.js'].lineData[51]++;
  this.on('afterRemoveChild', onRemoveChild);
  _$jscoverage['/tree/node.js'].lineData[52]++;
  this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
}, 
  syncUI: function() {
  _$jscoverage['/tree/node.js'].functionData[3]++;
  _$jscoverage['/tree/node.js'].lineData[57]++;
  refreshCss(this);
  _$jscoverage['/tree/node.js'].lineData[58]++;
  syncAriaSetSize.call(this, {
  target: this});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[4]++;
  _$jscoverage['/tree/node.js'].lineData[64]++;
  var self = this, processed = true, tree = self.get('tree'), expanded = self.get('expanded'), nodeToBeSelected, isLeaf = self.get('isLeaf'), children = self.get('children'), keyCode = e.keyCode;
  _$jscoverage['/tree/node.js'].lineData[74]++;
  switch (keyCode) {
    case KeyCode.ENTER:
      _$jscoverage['/tree/node.js'].lineData[76]++;
      return self.handleClickInternal(e);
    case KeyCode.HOME:
      _$jscoverage['/tree/node.js'].lineData[81]++;
      nodeToBeSelected = tree;
      _$jscoverage['/tree/node.js'].lineData[82]++;
      break;
    case KeyCode.END:
      _$jscoverage['/tree/node.js'].lineData[87]++;
      nodeToBeSelected = getLastVisibleDescendant(tree);
      _$jscoverage['/tree/node.js'].lineData[88]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/tree/node.js'].lineData[93]++;
      nodeToBeSelected = getPreviousVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[94]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/tree/node.js'].lineData[99]++;
      nodeToBeSelected = getNextVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[100]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/tree/node.js'].lineData[105]++;
      if (visit29_105_1(expanded && (visit30_105_2(children.length || visit31_105_3(isLeaf === false))))) {
        _$jscoverage['/tree/node.js'].lineData[106]++;
        self.set('expanded', false);
      } else {
        _$jscoverage['/tree/node.js'].lineData[108]++;
        nodeToBeSelected = self.get('parent');
      }
      _$jscoverage['/tree/node.js'].lineData[110]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/tree/node.js'].lineData[115]++;
      if (visit32_115_1(children.length || visit33_115_2(isLeaf === false))) {
        _$jscoverage['/tree/node.js'].lineData[116]++;
        if (visit34_116_1(!expanded)) {
          _$jscoverage['/tree/node.js'].lineData[117]++;
          self.set('expanded', true);
        } else {
          _$jscoverage['/tree/node.js'].lineData[119]++;
          nodeToBeSelected = children[0];
        }
      }
      _$jscoverage['/tree/node.js'].lineData[122]++;
      break;
    default:
      _$jscoverage['/tree/node.js'].lineData[125]++;
      processed = false;
      _$jscoverage['/tree/node.js'].lineData[126]++;
      break;
  }
  _$jscoverage['/tree/node.js'].lineData[129]++;
  if (visit35_129_1(nodeToBeSelected)) {
    _$jscoverage['/tree/node.js'].lineData[130]++;
    nodeToBeSelected.select();
  }
  _$jscoverage['/tree/node.js'].lineData[133]++;
  return processed;
}, 
  next: function() {
  _$jscoverage['/tree/node.js'].functionData[5]++;
  _$jscoverage['/tree/node.js'].lineData[137]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[141]++;
  if (visit36_141_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[142]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[144]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[145]++;
  index = util.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[146]++;
  if (visit37_146_1(index === siblings.length - 1)) {
    _$jscoverage['/tree/node.js'].lineData[147]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[149]++;
  return siblings[index + 1];
}, 
  prev: function() {
  _$jscoverage['/tree/node.js'].functionData[6]++;
  _$jscoverage['/tree/node.js'].lineData[153]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[157]++;
  if (visit38_157_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[158]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[160]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[161]++;
  index = util.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[162]++;
  if (visit39_162_1(index === 0)) {
    _$jscoverage['/tree/node.js'].lineData[163]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[165]++;
  return siblings[index - 1];
}, 
  select: function() {
  _$jscoverage['/tree/node.js'].functionData[7]++;
  _$jscoverage['/tree/node.js'].lineData[172]++;
  this.set('selected', true);
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[8]++;
  _$jscoverage['/tree/node.js'].lineData[177]++;
  e.stopPropagation();
  _$jscoverage['/tree/node.js'].lineData[178]++;
  var self = this, target = $(e.target), expanded = self.get('expanded'), tree = self.get('tree');
  _$jscoverage['/tree/node.js'].lineData[182]++;
  tree.focus();
  _$jscoverage['/tree/node.js'].lineData[183]++;
  self.callSuper(e);
  _$jscoverage['/tree/node.js'].lineData[184]++;
  if (visit40_184_1(target.equals(self.get('expandIconEl')))) {
    _$jscoverage['/tree/node.js'].lineData[185]++;
    self.set('expanded', !expanded);
  } else {
    _$jscoverage['/tree/node.js'].lineData[187]++;
    self.select();
    _$jscoverage['/tree/node.js'].lineData[188]++;
    self.fire('click');
  }
  _$jscoverage['/tree/node.js'].lineData[190]++;
  return true;
}, 
  createChildren: function() {
  _$jscoverage['/tree/node.js'].functionData[9]++;
  _$jscoverage['/tree/node.js'].lineData[197]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[198]++;
  self.renderChildren.apply(self, arguments);
  _$jscoverage['/tree/node.js'].lineData[200]++;
  if (visit41_200_1(self === self.get('tree'))) {
    _$jscoverage['/tree/node.js'].lineData[201]++;
    updateSubTreeStatus(self, self, -1, 0);
  }
}, 
  refreshCss: function(isNodeSingleOrLast, isNodeLeaf) {
  _$jscoverage['/tree/node.js'].functionData[10]++;
  _$jscoverage['/tree/node.js'].lineData[206]++;
  var self = this, iconEl = self.get('iconEl'), iconElCss, expandElCss, expandIconEl = self.get('expandIconEl'), childrenEl = self.getChildrenContainerEl();
  _$jscoverage['/tree/node.js'].lineData[213]++;
  if (visit42_213_1(isNodeLeaf)) {
    _$jscoverage['/tree/node.js'].lineData[214]++;
    iconElCss = ICON_EL_FILE_CLS;
    _$jscoverage['/tree/node.js'].lineData[215]++;
    expandElCss = EXPAND_ICON_EL_FILE_CLS;
  } else {
    _$jscoverage['/tree/node.js'].lineData[217]++;
    var expanded = self.get('expanded');
    _$jscoverage['/tree/node.js'].lineData[218]++;
    if (visit43_218_1(expanded)) {
      _$jscoverage['/tree/node.js'].lineData[219]++;
      iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
      _$jscoverage['/tree/node.js'].lineData[220]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS;
    } else {
      _$jscoverage['/tree/node.js'].lineData[222]++;
      iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
      _$jscoverage['/tree/node.js'].lineData[223]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS;
    }
  }
  _$jscoverage['/tree/node.js'].lineData[227]++;
  iconEl[0].className = self.getBaseCssClasses(iconElCss);
  _$jscoverage['/tree/node.js'].lineData[228]++;
  expandIconEl[0].className = self.getBaseCssClasses([EXPAND_EL_CLS, util.substitute(expandElCss, {
  t: isNodeSingleOrLast ? 'l' : 't'})]);
  _$jscoverage['/tree/node.js'].lineData[236]++;
  childrenEl[0].className = self.getBaseCssClasses((isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS));
}, 
  _onSetDepth: function(v) {
  _$jscoverage['/tree/node.js'].functionData[11]++;
  _$jscoverage['/tree/node.js'].lineData[242]++;
  this.el.setAttribute('aria-level', v);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/tree/node.js'].functionData[12]++;
  _$jscoverage['/tree/node.js'].lineData[246]++;
  return this.get('childrenEl');
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node.js'].functionData[13]++;
  _$jscoverage['/tree/node.js'].lineData[250]++;
  var self = this, childrenEl = self.getChildrenContainerEl();
  _$jscoverage['/tree/node.js'].lineData[252]++;
  childrenEl[v ? 'show' : 'hide']();
  _$jscoverage['/tree/node.js'].lineData[253]++;
  self.el.setAttribute('aria-expanded', v);
  _$jscoverage['/tree/node.js'].lineData[254]++;
  refreshCss(self);
  _$jscoverage['/tree/node.js'].lineData[255]++;
  self.fire(v ? 'expand' : 'collapse');
}, 
  _onSetSelected: function(v, e) {
  _$jscoverage['/tree/node.js'].functionData[14]++;
  _$jscoverage['/tree/node.js'].lineData[259]++;
  var self = this, rowEl = self.get('rowEl');
  _$jscoverage['/tree/node.js'].lineData[261]++;
  rowEl[v ? 'addClass' : 'removeClass'](self.getBaseCssClasses(SELECTED_CLS));
  _$jscoverage['/tree/node.js'].lineData[262]++;
  self.el.setAttribute('aria-selected', v);
  _$jscoverage['/tree/node.js'].lineData[263]++;
  var tree = this.get('tree');
  _$jscoverage['/tree/node.js'].lineData[264]++;
  if (visit44_264_1(!(visit45_264_2(e && e.byPassSetTreeSelectedItem)))) {
    _$jscoverage['/tree/node.js'].lineData[265]++;
    tree.set('selectedItem', v ? this : null);
  }
}, 
  expandAll: function() {
  _$jscoverage['/tree/node.js'].functionData[15]++;
  _$jscoverage['/tree/node.js'].lineData[273]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[274]++;
  self.set('expanded', true);
  _$jscoverage['/tree/node.js'].lineData[275]++;
  util.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[16]++;
  _$jscoverage['/tree/node.js'].lineData[276]++;
  c.expandAll();
});
}, 
  collapseAll: function() {
  _$jscoverage['/tree/node.js'].functionData[17]++;
  _$jscoverage['/tree/node.js'].lineData[284]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[285]++;
  self.set('expanded', false);
  _$jscoverage['/tree/node.js'].lineData[286]++;
  util.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[18]++;
  _$jscoverage['/tree/node.js'].lineData[287]++;
  c.collapseAll();
});
}}, {
  ATTRS: {
  contentTpl: {
  value: TreeNodeTpl}, 
  handleGestureEvents: {
  value: false}, 
  isLeaf: {
  render: 1, 
  sync: 0, 
  parse: function(el) {
  _$jscoverage['/tree/node.js'].functionData[19]++;
  _$jscoverage['/tree/node.js'].lineData[312]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[313]++;
  if (visit46_313_1(el.hasClass(self.getBaseCssClass('leaf')))) {
    _$jscoverage['/tree/node.js'].lineData[314]++;
    return true;
  } else {
    _$jscoverage['/tree/node.js'].lineData[315]++;
    if (visit47_315_1(el.hasClass(self.getBaseCssClass('folder')))) {
      _$jscoverage['/tree/node.js'].lineData[316]++;
      return false;
    }
  }
  _$jscoverage['/tree/node.js'].lineData[318]++;
  return undefined;
}}, 
  rowEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[20]++;
  _$jscoverage['/tree/node.js'].lineData[324]++;
  return ('.' + this.getBaseCssClass(ROW_EL_CLS));
}}, 
  childrenEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[21]++;
  _$jscoverage['/tree/node.js'].lineData[330]++;
  return ('.' + this.getBaseCssClass(CHILDREN_CLS));
}}, 
  expandIconEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[22]++;
  _$jscoverage['/tree/node.js'].lineData[340]++;
  return ('.' + this.getBaseCssClass(EXPAND_EL_CLS));
}}, 
  iconEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[23]++;
  _$jscoverage['/tree/node.js'].lineData[350]++;
  return ('.' + this.getBaseCssClass('icon'));
}}, 
  selected: {
  render: 1, 
  sync: 0}, 
  expanded: {
  sync: 0, 
  value: false, 
  render: 1, 
  parse: function() {
  _$jscoverage['/tree/node.js'].functionData[24]++;
  _$jscoverage['/tree/node.js'].lineData[373]++;
  return visit48_373_1(this.get('childrenEl').css('display') !== 'none');
}}, 
  tooltip: {
  render: 1, 
  sync: 0}, 
  tree: {
  getter: function() {
  _$jscoverage['/tree/node.js'].functionData[25]++;
  _$jscoverage['/tree/node.js'].lineData[392]++;
  var self = this, from = self;
  _$jscoverage['/tree/node.js'].lineData[394]++;
  while (visit49_394_1(from && !from.isTree)) {
    _$jscoverage['/tree/node.js'].lineData[395]++;
    from = from.get('parent');
  }
  _$jscoverage['/tree/node.js'].lineData[397]++;
  return from;
}}, 
  depth: {
  render: 1, 
  sync: 0}, 
  focusable: {
  value: false}, 
  defaultChildCfg: {
  valueFn: function() {
  _$jscoverage['/tree/node.js'].functionData[26]++;
  _$jscoverage['/tree/node.js'].lineData[416]++;
  return {
  xclass: 'tree-node'};
}}}, 
  xclass: 'tree-node'});
  _$jscoverage['/tree/node.js'].lineData[427]++;
  function onAddChild(e) {
    _$jscoverage['/tree/node.js'].functionData[27]++;
    _$jscoverage['/tree/node.js'].lineData[428]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[429]++;
    if (visit50_429_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[430]++;
      updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[434]++;
  function onRemoveChild(e) {
    _$jscoverage['/tree/node.js'].functionData[28]++;
    _$jscoverage['/tree/node.js'].lineData[435]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[436]++;
    if (visit51_436_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[437]++;
      recursiveSetDepth(self.get('tree'), e.component);
      _$jscoverage['/tree/node.js'].lineData[438]++;
      refreshCssForSelfAndChildren(self, e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[442]++;
  function syncAriaSetSize(e) {
    _$jscoverage['/tree/node.js'].functionData[29]++;
    _$jscoverage['/tree/node.js'].lineData[443]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[444]++;
    if (visit52_444_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[445]++;
      self.el.setAttribute('aria-setsize', self.get('children').length);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[450]++;
  function isNodeSingleOrLast(self) {
    _$jscoverage['/tree/node.js'].functionData[30]++;
    _$jscoverage['/tree/node.js'].lineData[451]++;
    var parent = self.get('parent'), children = visit53_452_1(parent && parent.get('children')), lastChild = visit54_453_1(children && children[children.length - 1]);
    _$jscoverage['/tree/node.js'].lineData[457]++;
    return visit55_457_1(!lastChild || visit56_457_2(lastChild === self));
  }
  _$jscoverage['/tree/node.js'].lineData[460]++;
  function isNodeLeaf(self) {
    _$jscoverage['/tree/node.js'].functionData[31]++;
    _$jscoverage['/tree/node.js'].lineData[461]++;
    var isLeaf = self.get('isLeaf');
    _$jscoverage['/tree/node.js'].lineData[463]++;
    return !(visit57_463_1(visit58_463_2(isLeaf === false) || (visit59_463_3(visit60_463_4(isLeaf === undefined) && self.get('children').length))));
  }
  _$jscoverage['/tree/node.js'].lineData[466]++;
  function getLastVisibleDescendant(self) {
    _$jscoverage['/tree/node.js'].functionData[32]++;
    _$jscoverage['/tree/node.js'].lineData[467]++;
    var children = self.get('children');
    _$jscoverage['/tree/node.js'].lineData[469]++;
    if (visit61_469_1(!self.get('expanded') || !children.length)) {
      _$jscoverage['/tree/node.js'].lineData[470]++;
      return self;
    }
    _$jscoverage['/tree/node.js'].lineData[473]++;
    return getLastVisibleDescendant(children[children.length - 1]);
  }
  _$jscoverage['/tree/node.js'].lineData[477]++;
  function getPreviousVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[33]++;
    _$jscoverage['/tree/node.js'].lineData[478]++;
    var prev = self.prev();
    _$jscoverage['/tree/node.js'].lineData[479]++;
    if (visit62_479_1(!prev)) {
      _$jscoverage['/tree/node.js'].lineData[480]++;
      prev = self.get('parent');
    } else {
      _$jscoverage['/tree/node.js'].lineData[482]++;
      prev = getLastVisibleDescendant(prev);
    }
    _$jscoverage['/tree/node.js'].lineData[484]++;
    return prev;
  }
  _$jscoverage['/tree/node.js'].lineData[488]++;
  function getNextVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[34]++;
    _$jscoverage['/tree/node.js'].lineData[489]++;
    var children = self.get('children'), n, parent;
    _$jscoverage['/tree/node.js'].lineData[492]++;
    if (visit63_492_1(self.get('expanded') && children.length)) {
      _$jscoverage['/tree/node.js'].lineData[493]++;
      return children[0];
    }
    _$jscoverage['/tree/node.js'].lineData[497]++;
    n = self.next();
    _$jscoverage['/tree/node.js'].lineData[498]++;
    parent = self;
    _$jscoverage['/tree/node.js'].lineData[499]++;
    while (visit64_499_1(!n && (parent = parent.get('parent')))) {
      _$jscoverage['/tree/node.js'].lineData[500]++;
      n = parent.next();
    }
    _$jscoverage['/tree/node.js'].lineData[502]++;
    return n;
  }
  _$jscoverage['/tree/node.js'].lineData[509]++;
  function refreshCss(self) {
    _$jscoverage['/tree/node.js'].functionData[35]++;
    _$jscoverage['/tree/node.js'].lineData[510]++;
    self.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
  }
  _$jscoverage['/tree/node.js'].lineData[513]++;
  function updateSubTreeStatus(self, c, depth, index) {
    _$jscoverage['/tree/node.js'].functionData[36]++;
    _$jscoverage['/tree/node.js'].lineData[514]++;
    var tree = self.get('tree');
    _$jscoverage['/tree/node.js'].lineData[515]++;
    if (visit65_515_1(tree)) {
      _$jscoverage['/tree/node.js'].lineData[516]++;
      recursiveSetDepth(tree, c, depth + 1);
      _$jscoverage['/tree/node.js'].lineData[517]++;
      refreshCssForSelfAndChildren(self, index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[521]++;
  function recursiveSetDepth(tree, c, setDepth) {
    _$jscoverage['/tree/node.js'].functionData[37]++;
    _$jscoverage['/tree/node.js'].lineData[522]++;
    if (visit66_522_1(setDepth !== undefined)) {
      _$jscoverage['/tree/node.js'].lineData[523]++;
      c.set('depth', setDepth);
    }
    _$jscoverage['/tree/node.js'].lineData[525]++;
    util.each(c.get('children'), function(child) {
  _$jscoverage['/tree/node.js'].functionData[38]++;
  _$jscoverage['/tree/node.js'].lineData[526]++;
  if (visit67_526_1(typeof setDepth === 'number')) {
    _$jscoverage['/tree/node.js'].lineData[527]++;
    recursiveSetDepth(tree, child, setDepth + 1);
  } else {
    _$jscoverage['/tree/node.js'].lineData[529]++;
    recursiveSetDepth(tree, child);
  }
});
  }
  _$jscoverage['/tree/node.js'].lineData[534]++;
  function refreshCssForSelfAndChildren(self, index) {
    _$jscoverage['/tree/node.js'].functionData[39]++;
    _$jscoverage['/tree/node.js'].lineData[535]++;
    refreshCss(self);
    _$jscoverage['/tree/node.js'].lineData[536]++;
    index = Math.max(0, index - 1);
    _$jscoverage['/tree/node.js'].lineData[537]++;
    var children = self.get('children'), c, len = children.length;
    _$jscoverage['/tree/node.js'].lineData[540]++;
    for (; visit68_540_1(index < len); index++) {
      _$jscoverage['/tree/node.js'].lineData[541]++;
      c = children[index];
      _$jscoverage['/tree/node.js'].lineData[542]++;
      refreshCss(c);
      _$jscoverage['/tree/node.js'].lineData[543]++;
      c.el.setAttribute('aria-posinset', index + 1);
    }
  }
});
