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
  _$jscoverage['/tree/node.js'].lineData[10] = 0;
  _$jscoverage['/tree/node.js'].lineData[13] = 0;
  _$jscoverage['/tree/node.js'].lineData[28] = 0;
  _$jscoverage['/tree/node.js'].lineData[29] = 0;
  _$jscoverage['/tree/node.js'].lineData[36] = 0;
  _$jscoverage['/tree/node.js'].lineData[38] = 0;
  _$jscoverage['/tree/node.js'].lineData[49] = 0;
  _$jscoverage['/tree/node.js'].lineData[50] = 0;
  _$jscoverage['/tree/node.js'].lineData[51] = 0;
  _$jscoverage['/tree/node.js'].lineData[56] = 0;
  _$jscoverage['/tree/node.js'].lineData[57] = 0;
  _$jscoverage['/tree/node.js'].lineData[63] = 0;
  _$jscoverage['/tree/node.js'].lineData[73] = 0;
  _$jscoverage['/tree/node.js'].lineData[75] = 0;
  _$jscoverage['/tree/node.js'].lineData[80] = 0;
  _$jscoverage['/tree/node.js'].lineData[81] = 0;
  _$jscoverage['/tree/node.js'].lineData[86] = 0;
  _$jscoverage['/tree/node.js'].lineData[87] = 0;
  _$jscoverage['/tree/node.js'].lineData[92] = 0;
  _$jscoverage['/tree/node.js'].lineData[93] = 0;
  _$jscoverage['/tree/node.js'].lineData[98] = 0;
  _$jscoverage['/tree/node.js'].lineData[99] = 0;
  _$jscoverage['/tree/node.js'].lineData[104] = 0;
  _$jscoverage['/tree/node.js'].lineData[105] = 0;
  _$jscoverage['/tree/node.js'].lineData[107] = 0;
  _$jscoverage['/tree/node.js'].lineData[109] = 0;
  _$jscoverage['/tree/node.js'].lineData[114] = 0;
  _$jscoverage['/tree/node.js'].lineData[115] = 0;
  _$jscoverage['/tree/node.js'].lineData[116] = 0;
  _$jscoverage['/tree/node.js'].lineData[118] = 0;
  _$jscoverage['/tree/node.js'].lineData[121] = 0;
  _$jscoverage['/tree/node.js'].lineData[124] = 0;
  _$jscoverage['/tree/node.js'].lineData[125] = 0;
  _$jscoverage['/tree/node.js'].lineData[128] = 0;
  _$jscoverage['/tree/node.js'].lineData[129] = 0;
  _$jscoverage['/tree/node.js'].lineData[132] = 0;
  _$jscoverage['/tree/node.js'].lineData[136] = 0;
  _$jscoverage['/tree/node.js'].lineData[140] = 0;
  _$jscoverage['/tree/node.js'].lineData[141] = 0;
  _$jscoverage['/tree/node.js'].lineData[143] = 0;
  _$jscoverage['/tree/node.js'].lineData[144] = 0;
  _$jscoverage['/tree/node.js'].lineData[145] = 0;
  _$jscoverage['/tree/node.js'].lineData[146] = 0;
  _$jscoverage['/tree/node.js'].lineData[148] = 0;
  _$jscoverage['/tree/node.js'].lineData[152] = 0;
  _$jscoverage['/tree/node.js'].lineData[156] = 0;
  _$jscoverage['/tree/node.js'].lineData[157] = 0;
  _$jscoverage['/tree/node.js'].lineData[159] = 0;
  _$jscoverage['/tree/node.js'].lineData[160] = 0;
  _$jscoverage['/tree/node.js'].lineData[161] = 0;
  _$jscoverage['/tree/node.js'].lineData[162] = 0;
  _$jscoverage['/tree/node.js'].lineData[164] = 0;
  _$jscoverage['/tree/node.js'].lineData[171] = 0;
  _$jscoverage['/tree/node.js'].lineData[176] = 0;
  _$jscoverage['/tree/node.js'].lineData[177] = 0;
  _$jscoverage['/tree/node.js'].lineData[181] = 0;
  _$jscoverage['/tree/node.js'].lineData[182] = 0;
  _$jscoverage['/tree/node.js'].lineData[183] = 0;
  _$jscoverage['/tree/node.js'].lineData[184] = 0;
  _$jscoverage['/tree/node.js'].lineData[186] = 0;
  _$jscoverage['/tree/node.js'].lineData[187] = 0;
  _$jscoverage['/tree/node.js'].lineData[189] = 0;
  _$jscoverage['/tree/node.js'].lineData[196] = 0;
  _$jscoverage['/tree/node.js'].lineData[197] = 0;
  _$jscoverage['/tree/node.js'].lineData[199] = 0;
  _$jscoverage['/tree/node.js'].lineData[200] = 0;
  _$jscoverage['/tree/node.js'].lineData[205] = 0;
  _$jscoverage['/tree/node.js'].lineData[212] = 0;
  _$jscoverage['/tree/node.js'].lineData[213] = 0;
  _$jscoverage['/tree/node.js'].lineData[214] = 0;
  _$jscoverage['/tree/node.js'].lineData[216] = 0;
  _$jscoverage['/tree/node.js'].lineData[217] = 0;
  _$jscoverage['/tree/node.js'].lineData[218] = 0;
  _$jscoverage['/tree/node.js'].lineData[219] = 0;
  _$jscoverage['/tree/node.js'].lineData[221] = 0;
  _$jscoverage['/tree/node.js'].lineData[222] = 0;
  _$jscoverage['/tree/node.js'].lineData[226] = 0;
  _$jscoverage['/tree/node.js'].lineData[227] = 0;
  _$jscoverage['/tree/node.js'].lineData[235] = 0;
  _$jscoverage['/tree/node.js'].lineData[241] = 0;
  _$jscoverage['/tree/node.js'].lineData[245] = 0;
  _$jscoverage['/tree/node.js'].lineData[249] = 0;
  _$jscoverage['/tree/node.js'].lineData[251] = 0;
  _$jscoverage['/tree/node.js'].lineData[252] = 0;
  _$jscoverage['/tree/node.js'].lineData[253] = 0;
  _$jscoverage['/tree/node.js'].lineData[254] = 0;
  _$jscoverage['/tree/node.js'].lineData[258] = 0;
  _$jscoverage['/tree/node.js'].lineData[260] = 0;
  _$jscoverage['/tree/node.js'].lineData[261] = 0;
  _$jscoverage['/tree/node.js'].lineData[262] = 0;
  _$jscoverage['/tree/node.js'].lineData[263] = 0;
  _$jscoverage['/tree/node.js'].lineData[264] = 0;
  _$jscoverage['/tree/node.js'].lineData[272] = 0;
  _$jscoverage['/tree/node.js'].lineData[273] = 0;
  _$jscoverage['/tree/node.js'].lineData[274] = 0;
  _$jscoverage['/tree/node.js'].lineData[275] = 0;
  _$jscoverage['/tree/node.js'].lineData[283] = 0;
  _$jscoverage['/tree/node.js'].lineData[284] = 0;
  _$jscoverage['/tree/node.js'].lineData[285] = 0;
  _$jscoverage['/tree/node.js'].lineData[286] = 0;
  _$jscoverage['/tree/node.js'].lineData[311] = 0;
  _$jscoverage['/tree/node.js'].lineData[312] = 0;
  _$jscoverage['/tree/node.js'].lineData[313] = 0;
  _$jscoverage['/tree/node.js'].lineData[314] = 0;
  _$jscoverage['/tree/node.js'].lineData[315] = 0;
  _$jscoverage['/tree/node.js'].lineData[317] = 0;
  _$jscoverage['/tree/node.js'].lineData[323] = 0;
  _$jscoverage['/tree/node.js'].lineData[329] = 0;
  _$jscoverage['/tree/node.js'].lineData[339] = 0;
  _$jscoverage['/tree/node.js'].lineData[349] = 0;
  _$jscoverage['/tree/node.js'].lineData[372] = 0;
  _$jscoverage['/tree/node.js'].lineData[391] = 0;
  _$jscoverage['/tree/node.js'].lineData[393] = 0;
  _$jscoverage['/tree/node.js'].lineData[394] = 0;
  _$jscoverage['/tree/node.js'].lineData[396] = 0;
  _$jscoverage['/tree/node.js'].lineData[424] = 0;
  _$jscoverage['/tree/node.js'].lineData[425] = 0;
  _$jscoverage['/tree/node.js'].lineData[426] = 0;
  _$jscoverage['/tree/node.js'].lineData[427] = 0;
  _$jscoverage['/tree/node.js'].lineData[431] = 0;
  _$jscoverage['/tree/node.js'].lineData[432] = 0;
  _$jscoverage['/tree/node.js'].lineData[433] = 0;
  _$jscoverage['/tree/node.js'].lineData[434] = 0;
  _$jscoverage['/tree/node.js'].lineData[435] = 0;
  _$jscoverage['/tree/node.js'].lineData[439] = 0;
  _$jscoverage['/tree/node.js'].lineData[440] = 0;
  _$jscoverage['/tree/node.js'].lineData[441] = 0;
  _$jscoverage['/tree/node.js'].lineData[442] = 0;
  _$jscoverage['/tree/node.js'].lineData[447] = 0;
  _$jscoverage['/tree/node.js'].lineData[448] = 0;
  _$jscoverage['/tree/node.js'].lineData[454] = 0;
  _$jscoverage['/tree/node.js'].lineData[457] = 0;
  _$jscoverage['/tree/node.js'].lineData[458] = 0;
  _$jscoverage['/tree/node.js'].lineData[460] = 0;
  _$jscoverage['/tree/node.js'].lineData[463] = 0;
  _$jscoverage['/tree/node.js'].lineData[464] = 0;
  _$jscoverage['/tree/node.js'].lineData[466] = 0;
  _$jscoverage['/tree/node.js'].lineData[467] = 0;
  _$jscoverage['/tree/node.js'].lineData[470] = 0;
  _$jscoverage['/tree/node.js'].lineData[474] = 0;
  _$jscoverage['/tree/node.js'].lineData[475] = 0;
  _$jscoverage['/tree/node.js'].lineData[476] = 0;
  _$jscoverage['/tree/node.js'].lineData[477] = 0;
  _$jscoverage['/tree/node.js'].lineData[479] = 0;
  _$jscoverage['/tree/node.js'].lineData[481] = 0;
  _$jscoverage['/tree/node.js'].lineData[485] = 0;
  _$jscoverage['/tree/node.js'].lineData[486] = 0;
  _$jscoverage['/tree/node.js'].lineData[489] = 0;
  _$jscoverage['/tree/node.js'].lineData[490] = 0;
  _$jscoverage['/tree/node.js'].lineData[494] = 0;
  _$jscoverage['/tree/node.js'].lineData[495] = 0;
  _$jscoverage['/tree/node.js'].lineData[496] = 0;
  _$jscoverage['/tree/node.js'].lineData[497] = 0;
  _$jscoverage['/tree/node.js'].lineData[499] = 0;
  _$jscoverage['/tree/node.js'].lineData[506] = 0;
  _$jscoverage['/tree/node.js'].lineData[507] = 0;
  _$jscoverage['/tree/node.js'].lineData[510] = 0;
  _$jscoverage['/tree/node.js'].lineData[511] = 0;
  _$jscoverage['/tree/node.js'].lineData[512] = 0;
  _$jscoverage['/tree/node.js'].lineData[513] = 0;
  _$jscoverage['/tree/node.js'].lineData[514] = 0;
  _$jscoverage['/tree/node.js'].lineData[518] = 0;
  _$jscoverage['/tree/node.js'].lineData[519] = 0;
  _$jscoverage['/tree/node.js'].lineData[520] = 0;
  _$jscoverage['/tree/node.js'].lineData[522] = 0;
  _$jscoverage['/tree/node.js'].lineData[523] = 0;
  _$jscoverage['/tree/node.js'].lineData[524] = 0;
  _$jscoverage['/tree/node.js'].lineData[526] = 0;
  _$jscoverage['/tree/node.js'].lineData[531] = 0;
  _$jscoverage['/tree/node.js'].lineData[532] = 0;
  _$jscoverage['/tree/node.js'].lineData[533] = 0;
  _$jscoverage['/tree/node.js'].lineData[534] = 0;
  _$jscoverage['/tree/node.js'].lineData[537] = 0;
  _$jscoverage['/tree/node.js'].lineData[538] = 0;
  _$jscoverage['/tree/node.js'].lineData[539] = 0;
  _$jscoverage['/tree/node.js'].lineData[540] = 0;
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
}
if (! _$jscoverage['/tree/node.js'].branchData) {
  _$jscoverage['/tree/node.js'].branchData = {};
  _$jscoverage['/tree/node.js'].branchData['104'] = [];
  _$jscoverage['/tree/node.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['104'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['114'] = [];
  _$jscoverage['/tree/node.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['115'] = [];
  _$jscoverage['/tree/node.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['128'] = [];
  _$jscoverage['/tree/node.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['140'] = [];
  _$jscoverage['/tree/node.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['145'] = [];
  _$jscoverage['/tree/node.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['156'] = [];
  _$jscoverage['/tree/node.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['161'] = [];
  _$jscoverage['/tree/node.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['183'] = [];
  _$jscoverage['/tree/node.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['199'] = [];
  _$jscoverage['/tree/node.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['212'] = [];
  _$jscoverage['/tree/node.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['217'] = [];
  _$jscoverage['/tree/node.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['263'] = [];
  _$jscoverage['/tree/node.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['263'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['312'] = [];
  _$jscoverage['/tree/node.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['314'] = [];
  _$jscoverage['/tree/node.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['372'] = [];
  _$jscoverage['/tree/node.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['393'] = [];
  _$jscoverage['/tree/node.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['426'] = [];
  _$jscoverage['/tree/node.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['433'] = [];
  _$jscoverage['/tree/node.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['441'] = [];
  _$jscoverage['/tree/node.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['449'] = [];
  _$jscoverage['/tree/node.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['450'] = [];
  _$jscoverage['/tree/node.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['454'] = [];
  _$jscoverage['/tree/node.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['454'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['460'] = [];
  _$jscoverage['/tree/node.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['460'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['460'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['460'][4] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['466'] = [];
  _$jscoverage['/tree/node.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['476'] = [];
  _$jscoverage['/tree/node.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['489'] = [];
  _$jscoverage['/tree/node.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['496'] = [];
  _$jscoverage['/tree/node.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['512'] = [];
  _$jscoverage['/tree/node.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['519'] = [];
  _$jscoverage['/tree/node.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['523'] = [];
  _$jscoverage['/tree/node.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['537'] = [];
  _$jscoverage['/tree/node.js'].branchData['537'][1] = new BranchData();
}
_$jscoverage['/tree/node.js'].branchData['537'][1].init(177, 11, 'index < len');
function visit69_537_1(result) {
  _$jscoverage['/tree/node.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['523'][1].init(17, 28, 'typeof setDepth === \'number\'');
function visit68_523_1(result) {
  _$jscoverage['/tree/node.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['519'][1].init(13, 22, 'setDepth !== undefined');
function visit67_519_1(result) {
  _$jscoverage['/tree/node.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['512'][1].init(50, 4, 'tree');
function visit66_512_1(result) {
  _$jscoverage['/tree/node.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['496'][1].init(287, 37, '!n && (parent = parent.get(\'parent\'))');
function visit65_496_1(result) {
  _$jscoverage['/tree/node.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['489'][1].init(93, 39, 'self.get(\'expanded\') && children.length');
function visit64_489_1(result) {
  _$jscoverage['/tree/node.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['476'][1].init(45, 5, '!prev');
function visit63_476_1(result) {
  _$jscoverage['/tree/node.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['466'][1].init(92, 41, '!self.get(\'expanded\') || !children.length');
function visit62_466_1(result) {
  _$jscoverage['/tree/node.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['460'][4].init(119, 20, 'isLeaf === undefined');
function visit61_460_4(result) {
  _$jscoverage['/tree/node.js'].branchData['460'][4].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['460'][3].init(119, 51, 'isLeaf === undefined && self.get(\'children\').length');
function visit60_460_3(result) {
  _$jscoverage['/tree/node.js'].branchData['460'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['460'][2].init(98, 16, 'isLeaf === false');
function visit59_460_2(result) {
  _$jscoverage['/tree/node.js'].branchData['460'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['460'][1].init(98, 73, 'isLeaf === false || (isLeaf === undefined && self.get(\'children\').length)');
function visit58_460_1(result) {
  _$jscoverage['/tree/node.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['454'][2].init(246, 18, 'lastChild === self');
function visit57_454_2(result) {
  _$jscoverage['/tree/node.js'].branchData['454'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['454'][1].init(232, 32, '!lastChild || lastChild === self');
function visit56_454_1(result) {
  _$jscoverage['/tree/node.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['450'][1].init(113, 41, 'children && children[children.length - 1]');
function visit55_450_1(result) {
  _$jscoverage['/tree/node.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['449'][1].init(55, 32, 'parent && parent.get(\'children\')');
function visit54_449_1(result) {
  _$jscoverage['/tree/node.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['441'][1].init(38, 17, 'e.target === self');
function visit53_441_1(result) {
  _$jscoverage['/tree/node.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['433'][1].init(38, 17, 'e.target === self');
function visit52_433_1(result) {
  _$jscoverage['/tree/node.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['426'][1].init(38, 17, 'e.target === self');
function visit51_426_1(result) {
  _$jscoverage['/tree/node.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['393'][1].init(102, 20, 'from && !from.isTree');
function visit50_393_1(result) {
  _$jscoverage['/tree/node.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['372'][1].init(28, 48, 'this.get(\'childrenEl\').css(\'display\') !== \'none\'');
function visit49_372_1(result) {
  _$jscoverage['/tree/node.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['314'][1].init(176, 43, 'el.hasClass(self.getBaseCssClass(\'folder\'))');
function visit48_314_1(result) {
  _$jscoverage['/tree/node.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['312'][1].init(62, 41, 'el.hasClass(self.getBaseCssClass(\'leaf\'))');
function visit47_312_1(result) {
  _$jscoverage['/tree/node.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['263'][2].init(275, 32, 'e && e.byPassSetTreeSelectedItem');
function visit46_263_2(result) {
  _$jscoverage['/tree/node.js'].branchData['263'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['263'][1].init(273, 35, '!(e && e.byPassSetTreeSelectedItem)');
function visit45_263_1(result) {
  _$jscoverage['/tree/node.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['217'][1].init(74, 8, 'expanded');
function visit44_217_1(result) {
  _$jscoverage['/tree/node.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['212'][1].init(265, 10, 'isNodeLeaf');
function visit43_212_1(result) {
  _$jscoverage['/tree/node.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['199'][1].init(155, 25, 'self === self.get(\'tree\')');
function visit42_199_1(result) {
  _$jscoverage['/tree/node.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['183'][1].init(313, 39, 'target.equals(self.get(\'expandIconEl\'))');
function visit41_183_1(result) {
  _$jscoverage['/tree/node.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['161'][1].init(304, 11, 'index === 0');
function visit40_161_1(result) {
  _$jscoverage['/tree/node.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['156'][1].init(140, 7, '!parent');
function visit39_156_1(result) {
  _$jscoverage['/tree/node.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['145'][1].init(304, 29, 'index === siblings.length - 1');
function visit38_145_1(result) {
  _$jscoverage['/tree/node.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['140'][1].init(140, 7, '!parent');
function visit37_140_1(result) {
  _$jscoverage['/tree/node.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['128'][1].init(2099, 16, 'nodeToBeSelected');
function visit36_128_1(result) {
  _$jscoverage['/tree/node.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['115'][1].init(29, 9, '!expanded');
function visit35_115_1(result) {
  _$jscoverage['/tree/node.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['114'][2].init(62, 16, 'isLeaf === false');
function visit34_114_2(result) {
  _$jscoverage['/tree/node.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['114'][1].init(43, 35, 'children.length || isLeaf === false');
function visit33_114_1(result) {
  _$jscoverage['/tree/node.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['104'][3].init(74, 16, 'isLeaf === false');
function visit32_104_3(result) {
  _$jscoverage['/tree/node.js'].branchData['104'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['104'][2].init(55, 35, 'children.length || isLeaf === false');
function visit31_104_2(result) {
  _$jscoverage['/tree/node.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['104'][1].init(42, 49, 'expanded && (children.length || isLeaf === false)');
function visit30_104_1(result) {
  _$jscoverage['/tree/node.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/node.js'].functionData[0]++;
  _$jscoverage['/tree/node.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/node.js'].lineData[8]++;
  var Container = require('component/container');
  _$jscoverage['/tree/node.js'].lineData[10]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/tree/node.js'].lineData[13]++;
  var SELECTED_CLS = 'selected', EXPAND_EL_CLS = 'expand-icon', COMMON_EXPAND_EL_CLS = 'expand-icon-{t}', EXPAND_ICON_EL_FILE_CLS = [COMMON_EXPAND_EL_CLS].join(' '), EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [COMMON_EXPAND_EL_CLS + 'minus'].join(' '), EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [COMMON_EXPAND_EL_CLS + 'plus'].join(' '), ICON_EL_FILE_CLS = ['file-icon'].join(' '), ICON_EL_FOLDER_EXPAND_CLS = ['expanded-folder-icon'].join(' '), ICON_EL_FOLDER_COLLAPSE_CLS = ['collapsed-folder-icon'].join(' '), ROW_EL_CLS = 'row', CHILDREN_CLS = 'children', CHILDREN_CLS_L = 'lchildren';
  _$jscoverage['/tree/node.js'].lineData[28]++;
  var TreeNodeTpl = require('./node-xtpl');
  _$jscoverage['/tree/node.js'].lineData[29]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/tree/node.js'].lineData[36]++;
  return Container.extend([ContentBox], {
  beforeCreateDom: function(renderData) {
  _$jscoverage['/tree/node.js'].functionData[1]++;
  _$jscoverage['/tree/node.js'].lineData[38]++;
  S.mix(renderData.elAttrs, {
  role: 'tree-node', 
  'aria-labelledby': 'ks-content' + renderData.id, 
  'aria-expanded': renderData.expanded ? 'true' : 'false', 
  'aria-selected': renderData.selected ? 'true' : 'false', 
  'aria-level': renderData.depth, 
  title: renderData.tooltip});
}, 
  bindUI: function() {
  _$jscoverage['/tree/node.js'].functionData[2]++;
  _$jscoverage['/tree/node.js'].lineData[49]++;
  this.on('afterAddChild', onAddChild);
  _$jscoverage['/tree/node.js'].lineData[50]++;
  this.on('afterRemoveChild', onRemoveChild);
  _$jscoverage['/tree/node.js'].lineData[51]++;
  this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
}, 
  syncUI: function() {
  _$jscoverage['/tree/node.js'].functionData[3]++;
  _$jscoverage['/tree/node.js'].lineData[56]++;
  refreshCss(this);
  _$jscoverage['/tree/node.js'].lineData[57]++;
  syncAriaSetSize.call(this, {
  target: this});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[4]++;
  _$jscoverage['/tree/node.js'].lineData[63]++;
  var self = this, processed = true, tree = self.get('tree'), expanded = self.get('expanded'), nodeToBeSelected, isLeaf = self.get('isLeaf'), children = self.get('children'), keyCode = e.keyCode;
  _$jscoverage['/tree/node.js'].lineData[73]++;
  switch (keyCode) {
    case KeyCode.ENTER:
      _$jscoverage['/tree/node.js'].lineData[75]++;
      return self.handleClickInternal(e);
    case KeyCode.HOME:
      _$jscoverage['/tree/node.js'].lineData[80]++;
      nodeToBeSelected = tree;
      _$jscoverage['/tree/node.js'].lineData[81]++;
      break;
    case KeyCode.END:
      _$jscoverage['/tree/node.js'].lineData[86]++;
      nodeToBeSelected = getLastVisibleDescendant(tree);
      _$jscoverage['/tree/node.js'].lineData[87]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/tree/node.js'].lineData[92]++;
      nodeToBeSelected = getPreviousVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[93]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/tree/node.js'].lineData[98]++;
      nodeToBeSelected = getNextVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[99]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/tree/node.js'].lineData[104]++;
      if (visit30_104_1(expanded && (visit31_104_2(children.length || visit32_104_3(isLeaf === false))))) {
        _$jscoverage['/tree/node.js'].lineData[105]++;
        self.set('expanded', false);
      } else {
        _$jscoverage['/tree/node.js'].lineData[107]++;
        nodeToBeSelected = self.get('parent');
      }
      _$jscoverage['/tree/node.js'].lineData[109]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/tree/node.js'].lineData[114]++;
      if (visit33_114_1(children.length || visit34_114_2(isLeaf === false))) {
        _$jscoverage['/tree/node.js'].lineData[115]++;
        if (visit35_115_1(!expanded)) {
          _$jscoverage['/tree/node.js'].lineData[116]++;
          self.set('expanded', true);
        } else {
          _$jscoverage['/tree/node.js'].lineData[118]++;
          nodeToBeSelected = children[0];
        }
      }
      _$jscoverage['/tree/node.js'].lineData[121]++;
      break;
    default:
      _$jscoverage['/tree/node.js'].lineData[124]++;
      processed = false;
      _$jscoverage['/tree/node.js'].lineData[125]++;
      break;
  }
  _$jscoverage['/tree/node.js'].lineData[128]++;
  if (visit36_128_1(nodeToBeSelected)) {
    _$jscoverage['/tree/node.js'].lineData[129]++;
    nodeToBeSelected.select();
  }
  _$jscoverage['/tree/node.js'].lineData[132]++;
  return processed;
}, 
  next: function() {
  _$jscoverage['/tree/node.js'].functionData[5]++;
  _$jscoverage['/tree/node.js'].lineData[136]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[140]++;
  if (visit37_140_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[141]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[143]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[144]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[145]++;
  if (visit38_145_1(index === siblings.length - 1)) {
    _$jscoverage['/tree/node.js'].lineData[146]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[148]++;
  return siblings[index + 1];
}, 
  prev: function() {
  _$jscoverage['/tree/node.js'].functionData[6]++;
  _$jscoverage['/tree/node.js'].lineData[152]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[156]++;
  if (visit39_156_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[157]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[159]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[160]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[161]++;
  if (visit40_161_1(index === 0)) {
    _$jscoverage['/tree/node.js'].lineData[162]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[164]++;
  return siblings[index - 1];
}, 
  select: function() {
  _$jscoverage['/tree/node.js'].functionData[7]++;
  _$jscoverage['/tree/node.js'].lineData[171]++;
  this.set('selected', true);
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[8]++;
  _$jscoverage['/tree/node.js'].lineData[176]++;
  e.stopPropagation();
  _$jscoverage['/tree/node.js'].lineData[177]++;
  var self = this, target = $(e.target), expanded = self.get('expanded'), tree = self.get('tree');
  _$jscoverage['/tree/node.js'].lineData[181]++;
  tree.focus();
  _$jscoverage['/tree/node.js'].lineData[182]++;
  self.callSuper(e);
  _$jscoverage['/tree/node.js'].lineData[183]++;
  if (visit41_183_1(target.equals(self.get('expandIconEl')))) {
    _$jscoverage['/tree/node.js'].lineData[184]++;
    self.set('expanded', !expanded);
  } else {
    _$jscoverage['/tree/node.js'].lineData[186]++;
    self.select();
    _$jscoverage['/tree/node.js'].lineData[187]++;
    self.fire('click');
  }
  _$jscoverage['/tree/node.js'].lineData[189]++;
  return true;
}, 
  createChildren: function() {
  _$jscoverage['/tree/node.js'].functionData[9]++;
  _$jscoverage['/tree/node.js'].lineData[196]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[197]++;
  self.renderChildren.apply(self, arguments);
  _$jscoverage['/tree/node.js'].lineData[199]++;
  if (visit42_199_1(self === self.get('tree'))) {
    _$jscoverage['/tree/node.js'].lineData[200]++;
    updateSubTreeStatus(self, self, -1, 0);
  }
}, 
  refreshCss: function(isNodeSingleOrLast, isNodeLeaf) {
  _$jscoverage['/tree/node.js'].functionData[10]++;
  _$jscoverage['/tree/node.js'].lineData[205]++;
  var self = this, iconEl = self.get('iconEl'), iconElCss, expandElCss, expandIconEl = self.get('expandIconEl'), childrenEl = self.getChildrenContainerEl();
  _$jscoverage['/tree/node.js'].lineData[212]++;
  if (visit43_212_1(isNodeLeaf)) {
    _$jscoverage['/tree/node.js'].lineData[213]++;
    iconElCss = ICON_EL_FILE_CLS;
    _$jscoverage['/tree/node.js'].lineData[214]++;
    expandElCss = EXPAND_ICON_EL_FILE_CLS;
  } else {
    _$jscoverage['/tree/node.js'].lineData[216]++;
    var expanded = self.get('expanded');
    _$jscoverage['/tree/node.js'].lineData[217]++;
    if (visit44_217_1(expanded)) {
      _$jscoverage['/tree/node.js'].lineData[218]++;
      iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
      _$jscoverage['/tree/node.js'].lineData[219]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS;
    } else {
      _$jscoverage['/tree/node.js'].lineData[221]++;
      iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
      _$jscoverage['/tree/node.js'].lineData[222]++;
      expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS;
    }
  }
  _$jscoverage['/tree/node.js'].lineData[226]++;
  iconEl[0].className = self.getBaseCssClasses(iconElCss);
  _$jscoverage['/tree/node.js'].lineData[227]++;
  expandIconEl[0].className = self.getBaseCssClasses([EXPAND_EL_CLS, S.substitute(expandElCss, {
  t: isNodeSingleOrLast ? 'l' : 't'})]);
  _$jscoverage['/tree/node.js'].lineData[235]++;
  childrenEl[0].className = self.getBaseCssClasses((isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS));
}, 
  _onSetDepth: function(v) {
  _$jscoverage['/tree/node.js'].functionData[11]++;
  _$jscoverage['/tree/node.js'].lineData[241]++;
  this.el.setAttribute('aria-level', v);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/tree/node.js'].functionData[12]++;
  _$jscoverage['/tree/node.js'].lineData[245]++;
  return this.get('childrenEl');
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node.js'].functionData[13]++;
  _$jscoverage['/tree/node.js'].lineData[249]++;
  var self = this, childrenEl = self.getChildrenContainerEl();
  _$jscoverage['/tree/node.js'].lineData[251]++;
  childrenEl[v ? 'show' : 'hide']();
  _$jscoverage['/tree/node.js'].lineData[252]++;
  self.el.setAttribute('aria-expanded', v);
  _$jscoverage['/tree/node.js'].lineData[253]++;
  refreshCss(self);
  _$jscoverage['/tree/node.js'].lineData[254]++;
  self.fire(v ? 'expand' : 'collapse');
}, 
  _onSetSelected: function(v, e) {
  _$jscoverage['/tree/node.js'].functionData[14]++;
  _$jscoverage['/tree/node.js'].lineData[258]++;
  var self = this, rowEl = self.get('rowEl');
  _$jscoverage['/tree/node.js'].lineData[260]++;
  rowEl[v ? 'addClass' : 'removeClass'](self.getBaseCssClasses(SELECTED_CLS));
  _$jscoverage['/tree/node.js'].lineData[261]++;
  self.el.setAttribute('aria-selected', v);
  _$jscoverage['/tree/node.js'].lineData[262]++;
  var tree = this.get('tree');
  _$jscoverage['/tree/node.js'].lineData[263]++;
  if (visit45_263_1(!(visit46_263_2(e && e.byPassSetTreeSelectedItem)))) {
    _$jscoverage['/tree/node.js'].lineData[264]++;
    tree.set('selectedItem', v ? this : null);
  }
}, 
  expandAll: function() {
  _$jscoverage['/tree/node.js'].functionData[15]++;
  _$jscoverage['/tree/node.js'].lineData[272]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[273]++;
  self.set('expanded', true);
  _$jscoverage['/tree/node.js'].lineData[274]++;
  S.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[16]++;
  _$jscoverage['/tree/node.js'].lineData[275]++;
  c.expandAll();
});
}, 
  collapseAll: function() {
  _$jscoverage['/tree/node.js'].functionData[17]++;
  _$jscoverage['/tree/node.js'].lineData[283]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[284]++;
  self.set('expanded', false);
  _$jscoverage['/tree/node.js'].lineData[285]++;
  S.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[18]++;
  _$jscoverage['/tree/node.js'].lineData[286]++;
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
  _$jscoverage['/tree/node.js'].lineData[311]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[312]++;
  if (visit47_312_1(el.hasClass(self.getBaseCssClass('leaf')))) {
    _$jscoverage['/tree/node.js'].lineData[313]++;
    return true;
  } else {
    _$jscoverage['/tree/node.js'].lineData[314]++;
    if (visit48_314_1(el.hasClass(self.getBaseCssClass('folder')))) {
      _$jscoverage['/tree/node.js'].lineData[315]++;
      return false;
    }
  }
  _$jscoverage['/tree/node.js'].lineData[317]++;
  return undefined;
}}, 
  rowEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[20]++;
  _$jscoverage['/tree/node.js'].lineData[323]++;
  return ('.' + this.getBaseCssClass(ROW_EL_CLS));
}}, 
  childrenEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[21]++;
  _$jscoverage['/tree/node.js'].lineData[329]++;
  return ('.' + this.getBaseCssClass(CHILDREN_CLS));
}}, 
  expandIconEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[22]++;
  _$jscoverage['/tree/node.js'].lineData[339]++;
  return ('.' + this.getBaseCssClass(EXPAND_EL_CLS));
}}, 
  iconEl: {
  selector: function() {
  _$jscoverage['/tree/node.js'].functionData[23]++;
  _$jscoverage['/tree/node.js'].lineData[349]++;
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
  _$jscoverage['/tree/node.js'].lineData[372]++;
  return visit49_372_1(this.get('childrenEl').css('display') !== 'none');
}}, 
  tooltip: {
  render: 1, 
  sync: 0}, 
  tree: {
  getter: function() {
  _$jscoverage['/tree/node.js'].functionData[25]++;
  _$jscoverage['/tree/node.js'].lineData[391]++;
  var self = this, from = self;
  _$jscoverage['/tree/node.js'].lineData[393]++;
  while (visit50_393_1(from && !from.isTree)) {
    _$jscoverage['/tree/node.js'].lineData[394]++;
    from = from.get('parent');
  }
  _$jscoverage['/tree/node.js'].lineData[396]++;
  return from;
}}, 
  depth: {
  render: 1, 
  sync: 0}, 
  focusable: {
  value: false}, 
  defaultChildCfg: {
  value: {
  xclass: 'tree-node'}}}, 
  xclass: 'tree-node'});
  _$jscoverage['/tree/node.js'].lineData[424]++;
  function onAddChild(e) {
    _$jscoverage['/tree/node.js'].functionData[26]++;
    _$jscoverage['/tree/node.js'].lineData[425]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[426]++;
    if (visit51_426_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[427]++;
      updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[431]++;
  function onRemoveChild(e) {
    _$jscoverage['/tree/node.js'].functionData[27]++;
    _$jscoverage['/tree/node.js'].lineData[432]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[433]++;
    if (visit52_433_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[434]++;
      recursiveSetDepth(self.get('tree'), e.component);
      _$jscoverage['/tree/node.js'].lineData[435]++;
      refreshCssForSelfAndChildren(self, e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[439]++;
  function syncAriaSetSize(e) {
    _$jscoverage['/tree/node.js'].functionData[28]++;
    _$jscoverage['/tree/node.js'].lineData[440]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[441]++;
    if (visit53_441_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[442]++;
      self.el.setAttribute('aria-setsize', self.get('children').length);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[447]++;
  function isNodeSingleOrLast(self) {
    _$jscoverage['/tree/node.js'].functionData[29]++;
    _$jscoverage['/tree/node.js'].lineData[448]++;
    var parent = self.get('parent'), children = visit54_449_1(parent && parent.get('children')), lastChild = visit55_450_1(children && children[children.length - 1]);
    _$jscoverage['/tree/node.js'].lineData[454]++;
    return visit56_454_1(!lastChild || visit57_454_2(lastChild === self));
  }
  _$jscoverage['/tree/node.js'].lineData[457]++;
  function isNodeLeaf(self) {
    _$jscoverage['/tree/node.js'].functionData[30]++;
    _$jscoverage['/tree/node.js'].lineData[458]++;
    var isLeaf = self.get('isLeaf');
    _$jscoverage['/tree/node.js'].lineData[460]++;
    return !(visit58_460_1(visit59_460_2(isLeaf === false) || (visit60_460_3(visit61_460_4(isLeaf === undefined) && self.get('children').length))));
  }
  _$jscoverage['/tree/node.js'].lineData[463]++;
  function getLastVisibleDescendant(self) {
    _$jscoverage['/tree/node.js'].functionData[31]++;
    _$jscoverage['/tree/node.js'].lineData[464]++;
    var children = self.get('children');
    _$jscoverage['/tree/node.js'].lineData[466]++;
    if (visit62_466_1(!self.get('expanded') || !children.length)) {
      _$jscoverage['/tree/node.js'].lineData[467]++;
      return self;
    }
    _$jscoverage['/tree/node.js'].lineData[470]++;
    return getLastVisibleDescendant(children[children.length - 1]);
  }
  _$jscoverage['/tree/node.js'].lineData[474]++;
  function getPreviousVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[32]++;
    _$jscoverage['/tree/node.js'].lineData[475]++;
    var prev = self.prev();
    _$jscoverage['/tree/node.js'].lineData[476]++;
    if (visit63_476_1(!prev)) {
      _$jscoverage['/tree/node.js'].lineData[477]++;
      prev = self.get('parent');
    } else {
      _$jscoverage['/tree/node.js'].lineData[479]++;
      prev = getLastVisibleDescendant(prev);
    }
    _$jscoverage['/tree/node.js'].lineData[481]++;
    return prev;
  }
  _$jscoverage['/tree/node.js'].lineData[485]++;
  function getNextVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[33]++;
    _$jscoverage['/tree/node.js'].lineData[486]++;
    var children = self.get('children'), n, parent;
    _$jscoverage['/tree/node.js'].lineData[489]++;
    if (visit64_489_1(self.get('expanded') && children.length)) {
      _$jscoverage['/tree/node.js'].lineData[490]++;
      return children[0];
    }
    _$jscoverage['/tree/node.js'].lineData[494]++;
    n = self.next();
    _$jscoverage['/tree/node.js'].lineData[495]++;
    parent = self;
    _$jscoverage['/tree/node.js'].lineData[496]++;
    while (visit65_496_1(!n && (parent = parent.get('parent')))) {
      _$jscoverage['/tree/node.js'].lineData[497]++;
      n = parent.next();
    }
    _$jscoverage['/tree/node.js'].lineData[499]++;
    return n;
  }
  _$jscoverage['/tree/node.js'].lineData[506]++;
  function refreshCss(self) {
    _$jscoverage['/tree/node.js'].functionData[34]++;
    _$jscoverage['/tree/node.js'].lineData[507]++;
    self.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
  }
  _$jscoverage['/tree/node.js'].lineData[510]++;
  function updateSubTreeStatus(self, c, depth, index) {
    _$jscoverage['/tree/node.js'].functionData[35]++;
    _$jscoverage['/tree/node.js'].lineData[511]++;
    var tree = self.get('tree');
    _$jscoverage['/tree/node.js'].lineData[512]++;
    if (visit66_512_1(tree)) {
      _$jscoverage['/tree/node.js'].lineData[513]++;
      recursiveSetDepth(tree, c, depth + 1);
      _$jscoverage['/tree/node.js'].lineData[514]++;
      refreshCssForSelfAndChildren(self, index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[518]++;
  function recursiveSetDepth(tree, c, setDepth) {
    _$jscoverage['/tree/node.js'].functionData[36]++;
    _$jscoverage['/tree/node.js'].lineData[519]++;
    if (visit67_519_1(setDepth !== undefined)) {
      _$jscoverage['/tree/node.js'].lineData[520]++;
      c.set('depth', setDepth);
    }
    _$jscoverage['/tree/node.js'].lineData[522]++;
    S.each(c.get('children'), function(child) {
  _$jscoverage['/tree/node.js'].functionData[37]++;
  _$jscoverage['/tree/node.js'].lineData[523]++;
  if (visit68_523_1(typeof setDepth === 'number')) {
    _$jscoverage['/tree/node.js'].lineData[524]++;
    recursiveSetDepth(tree, child, setDepth + 1);
  } else {
    _$jscoverage['/tree/node.js'].lineData[526]++;
    recursiveSetDepth(tree, child);
  }
});
  }
  _$jscoverage['/tree/node.js'].lineData[531]++;
  function refreshCssForSelfAndChildren(self, index) {
    _$jscoverage['/tree/node.js'].functionData[38]++;
    _$jscoverage['/tree/node.js'].lineData[532]++;
    refreshCss(self);
    _$jscoverage['/tree/node.js'].lineData[533]++;
    index = Math.max(0, index - 1);
    _$jscoverage['/tree/node.js'].lineData[534]++;
    var children = self.get('children'), c, len = children.length;
    _$jscoverage['/tree/node.js'].lineData[537]++;
    for (; visit69_537_1(index < len); index++) {
      _$jscoverage['/tree/node.js'].lineData[538]++;
      c = children[index];
      _$jscoverage['/tree/node.js'].lineData[539]++;
      refreshCss(c);
      _$jscoverage['/tree/node.js'].lineData[540]++;
      c.el.setAttribute('aria-posinset', index + 1);
    }
  }
});
