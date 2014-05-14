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
if (! _$jscoverage['/color.js']) {
  _$jscoverage['/color.js'] = {};
  _$jscoverage['/color.js'].lineData = [];
  _$jscoverage['/color.js'].lineData[6] = 0;
  _$jscoverage['/color.js'].lineData[7] = 0;
  _$jscoverage['/color.js'].lineData[8] = 0;
  _$jscoverage['/color.js'].lineData[11] = 0;
  _$jscoverage['/color.js'].lineData[17] = 0;
  _$jscoverage['/color.js'].lineData[23] = 0;
  _$jscoverage['/color.js'].lineData[24] = 0;
  _$jscoverage['/color.js'].lineData[31] = 0;
  _$jscoverage['/color.js'].lineData[32] = 0;
  _$jscoverage['/color.js'].lineData[41] = 0;
  _$jscoverage['/color.js'].lineData[42] = 0;
  _$jscoverage['/color.js'].lineData[49] = 0;
  _$jscoverage['/color.js'].lineData[50] = 0;
  _$jscoverage['/color.js'].lineData[58] = 0;
  _$jscoverage['/color.js'].lineData[59] = 0;
  _$jscoverage['/color.js'].lineData[67] = 0;
  _$jscoverage['/color.js'].lineData[74] = 0;
  _$jscoverage['/color.js'].lineData[86] = 0;
  _$jscoverage['/color.js'].lineData[87] = 0;
  _$jscoverage['/color.js'].lineData[88] = 0;
  _$jscoverage['/color.js'].lineData[89] = 0;
  _$jscoverage['/color.js'].lineData[90] = 0;
  _$jscoverage['/color.js'].lineData[91] = 0;
  _$jscoverage['/color.js'].lineData[93] = 0;
  _$jscoverage['/color.js'].lineData[96] = 0;
  _$jscoverage['/color.js'].lineData[98] = 0;
  _$jscoverage['/color.js'].lineData[110] = 0;
  _$jscoverage['/color.js'].lineData[125] = 0;
  _$jscoverage['/color.js'].lineData[127] = 0;
  _$jscoverage['/color.js'].lineData[128] = 0;
  _$jscoverage['/color.js'].lineData[129] = 0;
  _$jscoverage['/color.js'].lineData[130] = 0;
  _$jscoverage['/color.js'].lineData[131] = 0;
  _$jscoverage['/color.js'].lineData[134] = 0;
  _$jscoverage['/color.js'].lineData[136] = 0;
  _$jscoverage['/color.js'].lineData[147] = 0;
  _$jscoverage['/color.js'].lineData[149] = 0;
  _$jscoverage['/color.js'].lineData[150] = 0;
  _$jscoverage['/color.js'].lineData[151] = 0;
  _$jscoverage['/color.js'].lineData[152] = 0;
  _$jscoverage['/color.js'].lineData[153] = 0;
  _$jscoverage['/color.js'].lineData[156] = 0;
  _$jscoverage['/color.js'].lineData[158] = 0;
  _$jscoverage['/color.js'].lineData[162] = 0;
  _$jscoverage['/color.js'].lineData[178] = 0;
  _$jscoverage['/color.js'].lineData[181] = 0;
  _$jscoverage['/color.js'].lineData[198] = 0;
  _$jscoverage['/color.js'].lineData[201] = 0;
  _$jscoverage['/color.js'].lineData[218] = 0;
  _$jscoverage['/color.js'].lineData[221] = 0;
  _$jscoverage['/color.js'].lineData[240] = 0;
  _$jscoverage['/color.js'].lineData[251] = 0;
  _$jscoverage['/color.js'].lineData[256] = 0;
  _$jscoverage['/color.js'].lineData[257] = 0;
  _$jscoverage['/color.js'].lineData[258] = 0;
  _$jscoverage['/color.js'].lineData[259] = 0;
  _$jscoverage['/color.js'].lineData[260] = 0;
  _$jscoverage['/color.js'].lineData[261] = 0;
  _$jscoverage['/color.js'].lineData[262] = 0;
  _$jscoverage['/color.js'].lineData[263] = 0;
  _$jscoverage['/color.js'].lineData[264] = 0;
  _$jscoverage['/color.js'].lineData[265] = 0;
  _$jscoverage['/color.js'].lineData[269] = 0;
  _$jscoverage['/color.js'].lineData[270] = 0;
  _$jscoverage['/color.js'].lineData[271] = 0;
  _$jscoverage['/color.js'].lineData[272] = 0;
  _$jscoverage['/color.js'].lineData[273] = 0;
  _$jscoverage['/color.js'].lineData[274] = 0;
  _$jscoverage['/color.js'].lineData[278] = 0;
  _$jscoverage['/color.js'].lineData[296] = 0;
  _$jscoverage['/color.js'].lineData[297] = 0;
  _$jscoverage['/color.js'].lineData[298] = 0;
  _$jscoverage['/color.js'].lineData[310] = 0;
  _$jscoverage['/color.js'].lineData[311] = 0;
  _$jscoverage['/color.js'].lineData[312] = 0;
  _$jscoverage['/color.js'].lineData[318] = 0;
  _$jscoverage['/color.js'].lineData[319] = 0;
  _$jscoverage['/color.js'].lineData[322] = 0;
  _$jscoverage['/color.js'].lineData[323] = 0;
  _$jscoverage['/color.js'].lineData[333] = 0;
  _$jscoverage['/color.js'].lineData[335] = 0;
  _$jscoverage['/color.js'].lineData[336] = 0;
  _$jscoverage['/color.js'].lineData[337] = 0;
  _$jscoverage['/color.js'].lineData[338] = 0;
  _$jscoverage['/color.js'].lineData[340] = 0;
  _$jscoverage['/color.js'].lineData[341] = 0;
  _$jscoverage['/color.js'].lineData[342] = 0;
  _$jscoverage['/color.js'].lineData[343] = 0;
  _$jscoverage['/color.js'].lineData[345] = 0;
  _$jscoverage['/color.js'].lineData[346] = 0;
  _$jscoverage['/color.js'].lineData[347] = 0;
  _$jscoverage['/color.js'].lineData[348] = 0;
  _$jscoverage['/color.js'].lineData[350] = 0;
  _$jscoverage['/color.js'].lineData[351] = 0;
  _$jscoverage['/color.js'].lineData[352] = 0;
  _$jscoverage['/color.js'].lineData[353] = 0;
  _$jscoverage['/color.js'].lineData[355] = 0;
  _$jscoverage['/color.js'].lineData[356] = 0;
  _$jscoverage['/color.js'].lineData[357] = 0;
  _$jscoverage['/color.js'].lineData[358] = 0;
  _$jscoverage['/color.js'].lineData[360] = 0;
  _$jscoverage['/color.js'].lineData[361] = 0;
  _$jscoverage['/color.js'].lineData[362] = 0;
  _$jscoverage['/color.js'].lineData[363] = 0;
  _$jscoverage['/color.js'].lineData[366] = 0;
  _$jscoverage['/color.js'].lineData[369] = 0;
  _$jscoverage['/color.js'].lineData[370] = 0;
  _$jscoverage['/color.js'].lineData[374] = 0;
  _$jscoverage['/color.js'].lineData[380] = 0;
  _$jscoverage['/color.js'].lineData[382] = 0;
  _$jscoverage['/color.js'].lineData[383] = 0;
  _$jscoverage['/color.js'].lineData[385] = 0;
  _$jscoverage['/color.js'].lineData[386] = 0;
  _$jscoverage['/color.js'].lineData[387] = 0;
  _$jscoverage['/color.js'].lineData[389] = 0;
  _$jscoverage['/color.js'].lineData[391] = 0;
  _$jscoverage['/color.js'].lineData[392] = 0;
  _$jscoverage['/color.js'].lineData[394] = 0;
  _$jscoverage['/color.js'].lineData[395] = 0;
  _$jscoverage['/color.js'].lineData[398] = 0;
  _$jscoverage['/color.js'].lineData[400] = 0;
  _$jscoverage['/color.js'].lineData[406] = 0;
  _$jscoverage['/color.js'].lineData[409] = 0;
  _$jscoverage['/color.js'].lineData[410] = 0;
  _$jscoverage['/color.js'].lineData[417] = 0;
  _$jscoverage['/color.js'].lineData[419] = 0;
  _$jscoverage['/color.js'].lineData[425] = 0;
  _$jscoverage['/color.js'].lineData[426] = 0;
  _$jscoverage['/color.js'].lineData[427] = 0;
  _$jscoverage['/color.js'].lineData[428] = 0;
  _$jscoverage['/color.js'].lineData[429] = 0;
  _$jscoverage['/color.js'].lineData[431] = 0;
  _$jscoverage['/color.js'].lineData[432] = 0;
  _$jscoverage['/color.js'].lineData[434] = 0;
  _$jscoverage['/color.js'].lineData[435] = 0;
  _$jscoverage['/color.js'].lineData[437] = 0;
  _$jscoverage['/color.js'].lineData[438] = 0;
  _$jscoverage['/color.js'].lineData[440] = 0;
  _$jscoverage['/color.js'].lineData[441] = 0;
  _$jscoverage['/color.js'].lineData[443] = 0;
  _$jscoverage['/color.js'].lineData[444] = 0;
  _$jscoverage['/color.js'].lineData[446] = 0;
  _$jscoverage['/color.js'].lineData[447] = 0;
  _$jscoverage['/color.js'].lineData[449] = 0;
  _$jscoverage['/color.js'].lineData[451] = 0;
  _$jscoverage['/color.js'].lineData[452] = 0;
  _$jscoverage['/color.js'].lineData[454] = 0;
  _$jscoverage['/color.js'].lineData[461] = 0;
  _$jscoverage['/color.js'].lineData[462] = 0;
  _$jscoverage['/color.js'].lineData[465] = 0;
  _$jscoverage['/color.js'].lineData[466] = 0;
  _$jscoverage['/color.js'].lineData[469] = 0;
  _$jscoverage['/color.js'].lineData[470] = 0;
  _$jscoverage['/color.js'].lineData[471] = 0;
  _$jscoverage['/color.js'].lineData[473] = 0;
  _$jscoverage['/color.js'].lineData[476] = 0;
  _$jscoverage['/color.js'].lineData[477] = 0;
  _$jscoverage['/color.js'].lineData[480] = 0;
  _$jscoverage['/color.js'].lineData[481] = 0;
  _$jscoverage['/color.js'].lineData[484] = 0;
  _$jscoverage['/color.js'].lineData[485] = 0;
}
if (! _$jscoverage['/color.js'].functionData) {
  _$jscoverage['/color.js'].functionData = [];
  _$jscoverage['/color.js'].functionData[0] = 0;
  _$jscoverage['/color.js'].functionData[1] = 0;
  _$jscoverage['/color.js'].functionData[2] = 0;
  _$jscoverage['/color.js'].functionData[3] = 0;
  _$jscoverage['/color.js'].functionData[4] = 0;
  _$jscoverage['/color.js'].functionData[5] = 0;
  _$jscoverage['/color.js'].functionData[6] = 0;
  _$jscoverage['/color.js'].functionData[7] = 0;
  _$jscoverage['/color.js'].functionData[8] = 0;
  _$jscoverage['/color.js'].functionData[9] = 0;
  _$jscoverage['/color.js'].functionData[10] = 0;
  _$jscoverage['/color.js'].functionData[11] = 0;
  _$jscoverage['/color.js'].functionData[12] = 0;
  _$jscoverage['/color.js'].functionData[13] = 0;
  _$jscoverage['/color.js'].functionData[14] = 0;
  _$jscoverage['/color.js'].functionData[15] = 0;
  _$jscoverage['/color.js'].functionData[16] = 0;
  _$jscoverage['/color.js'].functionData[17] = 0;
  _$jscoverage['/color.js'].functionData[18] = 0;
  _$jscoverage['/color.js'].functionData[19] = 0;
  _$jscoverage['/color.js'].functionData[20] = 0;
  _$jscoverage['/color.js'].functionData[21] = 0;
  _$jscoverage['/color.js'].functionData[22] = 0;
  _$jscoverage['/color.js'].functionData[23] = 0;
  _$jscoverage['/color.js'].functionData[24] = 0;
  _$jscoverage['/color.js'].functionData[25] = 0;
  _$jscoverage['/color.js'].functionData[26] = 0;
  _$jscoverage['/color.js'].functionData[27] = 0;
  _$jscoverage['/color.js'].functionData[28] = 0;
  _$jscoverage['/color.js'].functionData[29] = 0;
  _$jscoverage['/color.js'].functionData[30] = 0;
  _$jscoverage['/color.js'].functionData[31] = 0;
  _$jscoverage['/color.js'].functionData[32] = 0;
  _$jscoverage['/color.js'].functionData[33] = 0;
}
if (! _$jscoverage['/color.js'].branchData) {
  _$jscoverage['/color.js'].branchData = {};
  _$jscoverage['/color.js'].branchData['24'] = [];
  _$jscoverage['/color.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['32'] = [];
  _$jscoverage['/color.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['86'] = [];
  _$jscoverage['/color.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['87'] = [];
  _$jscoverage['/color.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['88'] = [];
  _$jscoverage['/color.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['90'] = [];
  _$jscoverage['/color.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['127'] = [];
  _$jscoverage['/color.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['127'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['130'] = [];
  _$jscoverage['/color.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['149'] = [];
  _$jscoverage['/color.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['149'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['152'] = [];
  _$jscoverage['/color.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['256'] = [];
  _$jscoverage['/color.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['256'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['256'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['256'][4] = new BranchData();
  _$jscoverage['/color.js'].branchData['256'][5] = new BranchData();
  _$jscoverage['/color.js'].branchData['258'] = [];
  _$jscoverage['/color.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['262'] = [];
  _$jscoverage['/color.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['270'] = [];
  _$jscoverage['/color.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['274'] = [];
  _$jscoverage['/color.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['278'] = [];
  _$jscoverage['/color.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['386'] = [];
  _$jscoverage['/color.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['398'] = [];
  _$jscoverage['/color.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['417'] = [];
  _$jscoverage['/color.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['417'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['417'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['470'] = [];
  _$jscoverage['/color.js'].branchData['470'][1] = new BranchData();
}
_$jscoverage['/color.js'].branchData['470'][1].init(14, 14, 'v.length !== 2');
function visit30_470_1(result) {
  _$jscoverage['/color.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['417'][3].init(272, 9, 'h == null');
function visit29_417_3(result) {
  _$jscoverage['/color.js'].branchData['417'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['417'][2].init(261, 7, 's === 0');
function visit28_417_2(result) {
  _$jscoverage['/color.js'].branchData['417'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['417'][1].init(261, 20, 's === 0 || h == null');
function visit27_417_1(result) {
  _$jscoverage['/color.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['398'][1].init(742, 9, 'max === 0');
function visit26_398_1(result) {
  _$jscoverage['/color.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['386'][1].init(71, 5, 'g < b');
function visit25_386_1(result) {
  _$jscoverage['/color.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['278'][1].init(972, 24, 'typeof r === \'undefined\'');
function visit24_278_1(result) {
  _$jscoverage['/color.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['274'][1].init(176, 26, 'parseFloat(values[4]) || 1');
function visit23_274_1(result) {
  _$jscoverage['/color.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['270'][1].init(67, 6, 'values');
function visit22_270_1(result) {
  _$jscoverage['/color.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['262'][1].init(164, 16, 'str.length === 4');
function visit21_262_1(result) {
  _$jscoverage['/color.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['258'][1].init(66, 6, 'values');
function visit20_258_1(result) {
  _$jscoverage['/color.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['256'][5].init(154, 24, 'str.substr(0, 1) === \'#\'');
function visit19_256_5(result) {
  _$jscoverage['/color.js'].branchData['256'][5].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['256'][4].init(133, 16, 'str.length === 7');
function visit18_256_4(result) {
  _$jscoverage['/color.js'].branchData['256'][4].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['256'][3].init(113, 16, 'str.length === 4');
function visit17_256_3(result) {
  _$jscoverage['/color.js'].branchData['256'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['256'][2].init(113, 36, 'str.length === 4 || str.length === 7');
function visit16_256_2(result) {
  _$jscoverage['/color.js'].branchData['256'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['256'][1].init(113, 65, '(str.length === 4 || str.length === 7) && str.substr(0, 1) === \'#\'');
function visit15_256_1(result) {
  _$jscoverage['/color.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['152'][1].init(26, 8, 'x in cfg');
function visit14_152_1(result) {
  _$jscoverage['/color.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['149'][3].init(90, 24, '\'s\' in cfg && \'l\' in cfg');
function visit13_149_3(result) {
  _$jscoverage['/color.js'].branchData['149'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['149'][2].init(76, 38, '\'h\' in cfg && \'s\' in cfg && \'l\' in cfg');
function visit12_149_2(result) {
  _$jscoverage['/color.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['149'][1].init(74, 41, '!(\'h\' in cfg && \'s\' in cfg && \'l\' in cfg)');
function visit11_149_1(result) {
  _$jscoverage['/color.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['130'][1].init(26, 8, 'x in cfg');
function visit10_130_1(result) {
  _$jscoverage['/color.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['127'][3].init(90, 24, '\'s\' in cfg && \'v\' in cfg');
function visit9_127_3(result) {
  _$jscoverage['/color.js'].branchData['127'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['127'][2].init(76, 38, '\'h\' in cfg && \'s\' in cfg && \'v\' in cfg');
function visit8_127_2(result) {
  _$jscoverage['/color.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['127'][1].init(74, 41, '!(\'h\' in cfg && \'s\' in cfg && \'v\' in cfg)');
function visit7_127_1(result) {
  _$jscoverage['/color.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['90'][1].init(191, 9, 'g === max');
function visit6_90_1(result) {
  _$jscoverage['/color.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['88'][1].init(102, 9, 'r === max');
function visit5_88_1(result) {
  _$jscoverage['/color.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['87'][1].init(23, 7, 'l < 0.5');
function visit4_87_1(result) {
  _$jscoverage['/color.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['86'][1].init(441, 11, 'min !== max');
function visit3_86_1(result) {
  _$jscoverage['/color.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['32'][1].init(81, 10, 'hsl.h || 0');
function visit2_32_1(result) {
  _$jscoverage['/color.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['24'][1].init(80, 10, 'hsl.h || 0');
function visit1_24_1(result) {
  _$jscoverage['/color.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/color.js'].functionData[0]++;
  _$jscoverage['/color.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/color.js'].lineData[8]++;
  var rgbaRe = /\s*rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*(?:,\s*([\d\.]+))?\)\s*/, hexRe = /\s*#([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)\s*/;
  _$jscoverage['/color.js'].lineData[11]++;
  var Attribute = require('attribute');
  _$jscoverage['/color.js'].lineData[17]++;
  var Color = module.exports = Attribute.extend({
  toHSL: function() {
  _$jscoverage['/color.js'].functionData[1]++;
  _$jscoverage['/color.js'].lineData[23]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[24]++;
  return 'hsl(' + (Math.round(visit1_24_1(hsl.h || 0))) + ', ' + percentage(hsl.s) + ', ' + percentage(hsl.l) + ')';
}, 
  toHSLA: function() {
  _$jscoverage['/color.js'].functionData[2]++;
  _$jscoverage['/color.js'].lineData[31]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[32]++;
  return 'hsla(' + (Math.round(visit2_32_1(hsl.h || 0))) + ', ' + percentage(hsl.s) + ', ' + percentage(hsl.l) + ', ' + this.get('a') + ')';
}, 
  toRGB: function() {
  _$jscoverage['/color.js'].functionData[3]++;
  _$jscoverage['/color.js'].lineData[41]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[42]++;
  return 'rgb(' + self.get('r') + ', ' + self.get('g') + ', ' + self.get('b') + ')';
}, 
  toRGBA: function() {
  _$jscoverage['/color.js'].functionData[4]++;
  _$jscoverage['/color.js'].lineData[49]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[50]++;
  return 'rgba(' + self.get('r') + ', ' + self.get('g') + ', ' + self.get('b') + ', ' + self.get('a') + ')';
}, 
  toHex: function() {
  _$jscoverage['/color.js'].functionData[5]++;
  _$jscoverage['/color.js'].lineData[58]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[59]++;
  return '#' + padding2(Number(self.get('r')).toString(16)) + padding2(Number(self.get('g')).toString(16)) + padding2(Number(self.get('b')).toString(16));
}, 
  toString: function() {
  _$jscoverage['/color.js'].functionData[6]++;
  _$jscoverage['/color.js'].lineData[67]++;
  return this.toRGBA();
}, 
  getHSL: function() {
  _$jscoverage['/color.js'].functionData[7]++;
  _$jscoverage['/color.js'].lineData[74]++;
  var self = this, r = self.get('r') / 255, g = self.get('g') / 255, b = self.get('b') / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, h, s = 0, l = 0.5 * (max + min);
  _$jscoverage['/color.js'].lineData[86]++;
  if (visit3_86_1(min !== max)) {
    _$jscoverage['/color.js'].lineData[87]++;
    s = (visit4_87_1(l < 0.5)) ? delta / (max + min) : delta / (2 - max - min);
    _$jscoverage['/color.js'].lineData[88]++;
    if (visit5_88_1(r === max)) {
      _$jscoverage['/color.js'].lineData[89]++;
      h = 60 * (g - b) / delta;
    } else {
      _$jscoverage['/color.js'].lineData[90]++;
      if (visit6_90_1(g === max)) {
        _$jscoverage['/color.js'].lineData[91]++;
        h = 120 + 60 * (b - r) / delta;
      } else {
        _$jscoverage['/color.js'].lineData[93]++;
        h = 240 + 60 * (r - g) / delta;
      }
    }
    _$jscoverage['/color.js'].lineData[96]++;
    h = (h + 360) % 360;
  }
  _$jscoverage['/color.js'].lineData[98]++;
  return {
  h: h, 
  s: s, 
  l: l};
}, 
  getHSV: function() {
  _$jscoverage['/color.js'].functionData[8]++;
  _$jscoverage['/color.js'].lineData[110]++;
  return rgb2hsv({
  r: this.get('r'), 
  g: this.get('g'), 
  b: this.get('b')});
}, 
  setHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[9]++;
  _$jscoverage['/color.js'].lineData[125]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[127]++;
  if (visit7_127_1(!(visit8_127_2('h' in cfg && visit9_127_3('s' in cfg && 'v' in cfg))))) {
    _$jscoverage['/color.js'].lineData[128]++;
    current = self.getHSV();
    _$jscoverage['/color.js'].lineData[129]++;
    util.each(['h', 's', 'v'], function(x) {
  _$jscoverage['/color.js'].functionData[10]++;
  _$jscoverage['/color.js'].lineData[130]++;
  if (visit10_130_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[131]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[134]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[136]++;
  self.set(hsv2rgb(cfg));
}, 
  setHSL: function(cfg) {
  _$jscoverage['/color.js'].functionData[11]++;
  _$jscoverage['/color.js'].lineData[147]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[149]++;
  if (visit11_149_1(!(visit12_149_2('h' in cfg && visit13_149_3('s' in cfg && 'l' in cfg))))) {
    _$jscoverage['/color.js'].lineData[150]++;
    current = self.getHSL();
    _$jscoverage['/color.js'].lineData[151]++;
    util.each(['h', 's', 'l'], function(x) {
  _$jscoverage['/color.js'].functionData[12]++;
  _$jscoverage['/color.js'].lineData[152]++;
  if (visit14_152_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[153]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[156]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[158]++;
  self.set(hsl2rgb(cfg));
}});
  _$jscoverage['/color.js'].lineData[162]++;
  util.mix(Color, {
  ATTRS: {
  r: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[13]++;
  _$jscoverage['/color.js'].lineData[178]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[14]++;
  _$jscoverage['/color.js'].lineData[181]++;
  return constrain255(v);
}}, 
  g: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[15]++;
  _$jscoverage['/color.js'].lineData[198]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[16]++;
  _$jscoverage['/color.js'].lineData[201]++;
  return constrain255(v);
}}, 
  b: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[17]++;
  _$jscoverage['/color.js'].lineData[218]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[18]++;
  _$jscoverage['/color.js'].lineData[221]++;
  return constrain255(v);
}}, 
  a: {
  value: 1, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[19]++;
  _$jscoverage['/color.js'].lineData[240]++;
  return constrain1(v);
}}}, 
  parse: function(str) {
  _$jscoverage['/color.js'].functionData[20]++;
  _$jscoverage['/color.js'].lineData[251]++;
  var values, r, g, b, a = 1;
  _$jscoverage['/color.js'].lineData[256]++;
  if (visit15_256_1((visit16_256_2(visit17_256_3(str.length === 4) || visit18_256_4(str.length === 7))) && visit19_256_5(str.substr(0, 1) === '#'))) {
    _$jscoverage['/color.js'].lineData[257]++;
    values = str.match(hexRe);
    _$jscoverage['/color.js'].lineData[258]++;
    if (visit20_258_1(values)) {
      _$jscoverage['/color.js'].lineData[259]++;
      r = parseHex(values[1]);
      _$jscoverage['/color.js'].lineData[260]++;
      g = parseHex(values[2]);
      _$jscoverage['/color.js'].lineData[261]++;
      b = parseHex(values[3]);
      _$jscoverage['/color.js'].lineData[262]++;
      if (visit21_262_1(str.length === 4)) {
        _$jscoverage['/color.js'].lineData[263]++;
        r = paddingHex(r);
        _$jscoverage['/color.js'].lineData[264]++;
        g = paddingHex(g);
        _$jscoverage['/color.js'].lineData[265]++;
        b = paddingHex(b);
      }
    }
  } else {
    _$jscoverage['/color.js'].lineData[269]++;
    values = str.match(rgbaRe);
    _$jscoverage['/color.js'].lineData[270]++;
    if (visit22_270_1(values)) {
      _$jscoverage['/color.js'].lineData[271]++;
      r = parseInt(values[1], 10);
      _$jscoverage['/color.js'].lineData[272]++;
      g = parseInt(values[2], 10);
      _$jscoverage['/color.js'].lineData[273]++;
      b = parseInt(values[3], 10);
      _$jscoverage['/color.js'].lineData[274]++;
      a = visit23_274_1(parseFloat(values[4]) || 1);
    }
  }
  _$jscoverage['/color.js'].lineData[278]++;
  return (visit24_278_1(typeof r === 'undefined')) ? undefined : new Color({
  r: r, 
  g: g, 
  b: b, 
  a: a});
}, 
  fromHSL: function(cfg) {
  _$jscoverage['/color.js'].functionData[21]++;
  _$jscoverage['/color.js'].lineData[296]++;
  var rgb = hsl2rgb(cfg);
  _$jscoverage['/color.js'].lineData[297]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[298]++;
  return new Color(rgb);
}, 
  fromHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[22]++;
  _$jscoverage['/color.js'].lineData[310]++;
  var rgb = hsv2rgb(cfg);
  _$jscoverage['/color.js'].lineData[311]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[312]++;
  return new Color(rgb);
}});
  _$jscoverage['/color.js'].lineData[318]++;
  function to255(v) {
    _$jscoverage['/color.js'].functionData[23]++;
    _$jscoverage['/color.js'].lineData[319]++;
    return v * 255;
  }
  _$jscoverage['/color.js'].lineData[322]++;
  function hsv2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[24]++;
    _$jscoverage['/color.js'].lineData[323]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), v = Math.max(0, Math.min(1, cfg.v)), r, g, b, i = Math.floor((h / 60) % 6), f = (h / 60) - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    _$jscoverage['/color.js'].lineData[333]++;
    switch (i) {
      case 0:
        _$jscoverage['/color.js'].lineData[335]++;
        r = v;
        _$jscoverage['/color.js'].lineData[336]++;
        g = t;
        _$jscoverage['/color.js'].lineData[337]++;
        b = p;
        _$jscoverage['/color.js'].lineData[338]++;
        break;
      case 1:
        _$jscoverage['/color.js'].lineData[340]++;
        r = q;
        _$jscoverage['/color.js'].lineData[341]++;
        g = v;
        _$jscoverage['/color.js'].lineData[342]++;
        b = p;
        _$jscoverage['/color.js'].lineData[343]++;
        break;
      case 2:
        _$jscoverage['/color.js'].lineData[345]++;
        r = p;
        _$jscoverage['/color.js'].lineData[346]++;
        g = v;
        _$jscoverage['/color.js'].lineData[347]++;
        b = t;
        _$jscoverage['/color.js'].lineData[348]++;
        break;
      case 3:
        _$jscoverage['/color.js'].lineData[350]++;
        r = p;
        _$jscoverage['/color.js'].lineData[351]++;
        g = q;
        _$jscoverage['/color.js'].lineData[352]++;
        b = v;
        _$jscoverage['/color.js'].lineData[353]++;
        break;
      case 4:
        _$jscoverage['/color.js'].lineData[355]++;
        r = t;
        _$jscoverage['/color.js'].lineData[356]++;
        g = p;
        _$jscoverage['/color.js'].lineData[357]++;
        b = v;
        _$jscoverage['/color.js'].lineData[358]++;
        break;
      case 5:
        _$jscoverage['/color.js'].lineData[360]++;
        r = v;
        _$jscoverage['/color.js'].lineData[361]++;
        g = p;
        _$jscoverage['/color.js'].lineData[362]++;
        b = q;
        _$jscoverage['/color.js'].lineData[363]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[366]++;
    return {
  r: constrain255(to255(r)), 
  g: constrain255(to255(g)), 
  b: constrain255(to255(b))};
  }
  _$jscoverage['/color.js'].lineData[369]++;
  function rgb2hsv(cfg) {
    _$jscoverage['/color.js'].functionData[25]++;
    _$jscoverage['/color.js'].lineData[370]++;
    var r = cfg.r / 255, g = cfg.g / 255, b = cfg.b / 255;
    _$jscoverage['/color.js'].lineData[374]++;
    var h, s, min = Math.min(Math.min(r, g), b), max = Math.max(Math.max(r, g), b), delta = max - min, hsv;
    _$jscoverage['/color.js'].lineData[380]++;
    switch (max) {
      case min:
        _$jscoverage['/color.js'].lineData[382]++;
        h = 0;
        _$jscoverage['/color.js'].lineData[383]++;
        break;
      case r:
        _$jscoverage['/color.js'].lineData[385]++;
        h = 60 * (g - b) / delta;
        _$jscoverage['/color.js'].lineData[386]++;
        if (visit25_386_1(g < b)) {
          _$jscoverage['/color.js'].lineData[387]++;
          h += 360;
        }
        _$jscoverage['/color.js'].lineData[389]++;
        break;
      case g:
        _$jscoverage['/color.js'].lineData[391]++;
        h = (60 * (b - r) / delta) + 120;
        _$jscoverage['/color.js'].lineData[392]++;
        break;
      case b:
        _$jscoverage['/color.js'].lineData[394]++;
        h = (60 * (r - g) / delta) + 240;
        _$jscoverage['/color.js'].lineData[395]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[398]++;
    s = (visit26_398_1(max === 0)) ? 0 : 1 - (min / max);
    _$jscoverage['/color.js'].lineData[400]++;
    hsv = {
  h: Math.round(h), 
  s: s, 
  v: max};
    _$jscoverage['/color.js'].lineData[406]++;
    return hsv;
  }
  _$jscoverage['/color.js'].lineData[409]++;
  function hsl2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[26]++;
    _$jscoverage['/color.js'].lineData[410]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), l = Math.max(0, Math.min(1, cfg.l)), C, X, m, rgb = [], abs = Math.abs, floor = Math.floor;
    _$jscoverage['/color.js'].lineData[417]++;
    if (visit27_417_1(visit28_417_2(s === 0) || visit29_417_3(h == null))) {
      _$jscoverage['/color.js'].lineData[419]++;
      rgb = [l, l, l];
    } else {
      _$jscoverage['/color.js'].lineData[425]++;
      h /= 60;
      _$jscoverage['/color.js'].lineData[426]++;
      C = s * (1 - abs(2 * l - 1));
      _$jscoverage['/color.js'].lineData[427]++;
      X = C * (1 - abs(h - 2 * floor(h / 2) - 1));
      _$jscoverage['/color.js'].lineData[428]++;
      m = l - C / 2;
      _$jscoverage['/color.js'].lineData[429]++;
      switch (floor(h)) {
        case 0:
          _$jscoverage['/color.js'].lineData[431]++;
          rgb = [C, X, 0];
          _$jscoverage['/color.js'].lineData[432]++;
          break;
        case 1:
          _$jscoverage['/color.js'].lineData[434]++;
          rgb = [X, C, 0];
          _$jscoverage['/color.js'].lineData[435]++;
          break;
        case 2:
          _$jscoverage['/color.js'].lineData[437]++;
          rgb = [0, C, X];
          _$jscoverage['/color.js'].lineData[438]++;
          break;
        case 3:
          _$jscoverage['/color.js'].lineData[440]++;
          rgb = [0, X, C];
          _$jscoverage['/color.js'].lineData[441]++;
          break;
        case 4:
          _$jscoverage['/color.js'].lineData[443]++;
          rgb = [X, 0, C];
          _$jscoverage['/color.js'].lineData[444]++;
          break;
        case 5:
          _$jscoverage['/color.js'].lineData[446]++;
          rgb = [C, 0, X];
          _$jscoverage['/color.js'].lineData[447]++;
          break;
      }
      _$jscoverage['/color.js'].lineData[449]++;
      rgb = [rgb[0] + m, rgb[1] + m, rgb[2] + m];
    }
    _$jscoverage['/color.js'].lineData[451]++;
    util.each(rgb, function(v, index) {
  _$jscoverage['/color.js'].functionData[27]++;
  _$jscoverage['/color.js'].lineData[452]++;
  rgb[index] = to255(v);
});
    _$jscoverage['/color.js'].lineData[454]++;
    return {
  r: rgb[0], 
  g: rgb[1], 
  b: rgb[2]};
  }
  _$jscoverage['/color.js'].lineData[461]++;
  function parseHex(v) {
    _$jscoverage['/color.js'].functionData[28]++;
    _$jscoverage['/color.js'].lineData[462]++;
    return parseInt(v, 16);
  }
  _$jscoverage['/color.js'].lineData[465]++;
  function paddingHex(v) {
    _$jscoverage['/color.js'].functionData[29]++;
    _$jscoverage['/color.js'].lineData[466]++;
    return v + v * 16;
  }
  _$jscoverage['/color.js'].lineData[469]++;
  function padding2(v) {
    _$jscoverage['/color.js'].functionData[30]++;
    _$jscoverage['/color.js'].lineData[470]++;
    if (visit30_470_1(v.length !== 2)) {
      _$jscoverage['/color.js'].lineData[471]++;
      v = '0' + v;
    }
    _$jscoverage['/color.js'].lineData[473]++;
    return v;
  }
  _$jscoverage['/color.js'].lineData[476]++;
  function percentage(v) {
    _$jscoverage['/color.js'].functionData[31]++;
    _$jscoverage['/color.js'].lineData[477]++;
    return Math.round(v * 100) + '%';
  }
  _$jscoverage['/color.js'].lineData[480]++;
  function constrain255(v) {
    _$jscoverage['/color.js'].functionData[32]++;
    _$jscoverage['/color.js'].lineData[481]++;
    return Math.max(0, Math.min(v, 255));
  }
  _$jscoverage['/color.js'].lineData[484]++;
  function constrain1(v) {
    _$jscoverage['/color.js'].functionData[33]++;
    _$jscoverage['/color.js'].lineData[485]++;
    return Math.max(0, Math.min(v, 1));
  }
});
