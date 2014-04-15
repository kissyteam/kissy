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
  _$jscoverage['/color.js'].lineData[10] = 0;
  _$jscoverage['/color.js'].lineData[16] = 0;
  _$jscoverage['/color.js'].lineData[22] = 0;
  _$jscoverage['/color.js'].lineData[23] = 0;
  _$jscoverage['/color.js'].lineData[30] = 0;
  _$jscoverage['/color.js'].lineData[31] = 0;
  _$jscoverage['/color.js'].lineData[40] = 0;
  _$jscoverage['/color.js'].lineData[41] = 0;
  _$jscoverage['/color.js'].lineData[48] = 0;
  _$jscoverage['/color.js'].lineData[49] = 0;
  _$jscoverage['/color.js'].lineData[57] = 0;
  _$jscoverage['/color.js'].lineData[58] = 0;
  _$jscoverage['/color.js'].lineData[66] = 0;
  _$jscoverage['/color.js'].lineData[73] = 0;
  _$jscoverage['/color.js'].lineData[85] = 0;
  _$jscoverage['/color.js'].lineData[86] = 0;
  _$jscoverage['/color.js'].lineData[87] = 0;
  _$jscoverage['/color.js'].lineData[88] = 0;
  _$jscoverage['/color.js'].lineData[89] = 0;
  _$jscoverage['/color.js'].lineData[90] = 0;
  _$jscoverage['/color.js'].lineData[92] = 0;
  _$jscoverage['/color.js'].lineData[95] = 0;
  _$jscoverage['/color.js'].lineData[97] = 0;
  _$jscoverage['/color.js'].lineData[109] = 0;
  _$jscoverage['/color.js'].lineData[124] = 0;
  _$jscoverage['/color.js'].lineData[126] = 0;
  _$jscoverage['/color.js'].lineData[127] = 0;
  _$jscoverage['/color.js'].lineData[128] = 0;
  _$jscoverage['/color.js'].lineData[129] = 0;
  _$jscoverage['/color.js'].lineData[130] = 0;
  _$jscoverage['/color.js'].lineData[133] = 0;
  _$jscoverage['/color.js'].lineData[135] = 0;
  _$jscoverage['/color.js'].lineData[146] = 0;
  _$jscoverage['/color.js'].lineData[148] = 0;
  _$jscoverage['/color.js'].lineData[149] = 0;
  _$jscoverage['/color.js'].lineData[150] = 0;
  _$jscoverage['/color.js'].lineData[151] = 0;
  _$jscoverage['/color.js'].lineData[152] = 0;
  _$jscoverage['/color.js'].lineData[155] = 0;
  _$jscoverage['/color.js'].lineData[157] = 0;
  _$jscoverage['/color.js'].lineData[161] = 0;
  _$jscoverage['/color.js'].lineData[177] = 0;
  _$jscoverage['/color.js'].lineData[180] = 0;
  _$jscoverage['/color.js'].lineData[197] = 0;
  _$jscoverage['/color.js'].lineData[200] = 0;
  _$jscoverage['/color.js'].lineData[217] = 0;
  _$jscoverage['/color.js'].lineData[220] = 0;
  _$jscoverage['/color.js'].lineData[239] = 0;
  _$jscoverage['/color.js'].lineData[250] = 0;
  _$jscoverage['/color.js'].lineData[255] = 0;
  _$jscoverage['/color.js'].lineData[256] = 0;
  _$jscoverage['/color.js'].lineData[257] = 0;
  _$jscoverage['/color.js'].lineData[258] = 0;
  _$jscoverage['/color.js'].lineData[259] = 0;
  _$jscoverage['/color.js'].lineData[260] = 0;
  _$jscoverage['/color.js'].lineData[261] = 0;
  _$jscoverage['/color.js'].lineData[262] = 0;
  _$jscoverage['/color.js'].lineData[263] = 0;
  _$jscoverage['/color.js'].lineData[264] = 0;
  _$jscoverage['/color.js'].lineData[268] = 0;
  _$jscoverage['/color.js'].lineData[269] = 0;
  _$jscoverage['/color.js'].lineData[270] = 0;
  _$jscoverage['/color.js'].lineData[271] = 0;
  _$jscoverage['/color.js'].lineData[272] = 0;
  _$jscoverage['/color.js'].lineData[273] = 0;
  _$jscoverage['/color.js'].lineData[277] = 0;
  _$jscoverage['/color.js'].lineData[295] = 0;
  _$jscoverage['/color.js'].lineData[296] = 0;
  _$jscoverage['/color.js'].lineData[297] = 0;
  _$jscoverage['/color.js'].lineData[309] = 0;
  _$jscoverage['/color.js'].lineData[310] = 0;
  _$jscoverage['/color.js'].lineData[311] = 0;
  _$jscoverage['/color.js'].lineData[317] = 0;
  _$jscoverage['/color.js'].lineData[318] = 0;
  _$jscoverage['/color.js'].lineData[321] = 0;
  _$jscoverage['/color.js'].lineData[322] = 0;
  _$jscoverage['/color.js'].lineData[332] = 0;
  _$jscoverage['/color.js'].lineData[334] = 0;
  _$jscoverage['/color.js'].lineData[335] = 0;
  _$jscoverage['/color.js'].lineData[336] = 0;
  _$jscoverage['/color.js'].lineData[337] = 0;
  _$jscoverage['/color.js'].lineData[339] = 0;
  _$jscoverage['/color.js'].lineData[340] = 0;
  _$jscoverage['/color.js'].lineData[341] = 0;
  _$jscoverage['/color.js'].lineData[342] = 0;
  _$jscoverage['/color.js'].lineData[344] = 0;
  _$jscoverage['/color.js'].lineData[345] = 0;
  _$jscoverage['/color.js'].lineData[346] = 0;
  _$jscoverage['/color.js'].lineData[347] = 0;
  _$jscoverage['/color.js'].lineData[349] = 0;
  _$jscoverage['/color.js'].lineData[350] = 0;
  _$jscoverage['/color.js'].lineData[351] = 0;
  _$jscoverage['/color.js'].lineData[352] = 0;
  _$jscoverage['/color.js'].lineData[354] = 0;
  _$jscoverage['/color.js'].lineData[355] = 0;
  _$jscoverage['/color.js'].lineData[356] = 0;
  _$jscoverage['/color.js'].lineData[357] = 0;
  _$jscoverage['/color.js'].lineData[359] = 0;
  _$jscoverage['/color.js'].lineData[360] = 0;
  _$jscoverage['/color.js'].lineData[361] = 0;
  _$jscoverage['/color.js'].lineData[362] = 0;
  _$jscoverage['/color.js'].lineData[365] = 0;
  _$jscoverage['/color.js'].lineData[368] = 0;
  _$jscoverage['/color.js'].lineData[369] = 0;
  _$jscoverage['/color.js'].lineData[373] = 0;
  _$jscoverage['/color.js'].lineData[379] = 0;
  _$jscoverage['/color.js'].lineData[381] = 0;
  _$jscoverage['/color.js'].lineData[382] = 0;
  _$jscoverage['/color.js'].lineData[384] = 0;
  _$jscoverage['/color.js'].lineData[385] = 0;
  _$jscoverage['/color.js'].lineData[386] = 0;
  _$jscoverage['/color.js'].lineData[388] = 0;
  _$jscoverage['/color.js'].lineData[390] = 0;
  _$jscoverage['/color.js'].lineData[391] = 0;
  _$jscoverage['/color.js'].lineData[393] = 0;
  _$jscoverage['/color.js'].lineData[394] = 0;
  _$jscoverage['/color.js'].lineData[397] = 0;
  _$jscoverage['/color.js'].lineData[399] = 0;
  _$jscoverage['/color.js'].lineData[405] = 0;
  _$jscoverage['/color.js'].lineData[408] = 0;
  _$jscoverage['/color.js'].lineData[409] = 0;
  _$jscoverage['/color.js'].lineData[416] = 0;
  _$jscoverage['/color.js'].lineData[418] = 0;
  _$jscoverage['/color.js'].lineData[424] = 0;
  _$jscoverage['/color.js'].lineData[425] = 0;
  _$jscoverage['/color.js'].lineData[426] = 0;
  _$jscoverage['/color.js'].lineData[427] = 0;
  _$jscoverage['/color.js'].lineData[428] = 0;
  _$jscoverage['/color.js'].lineData[430] = 0;
  _$jscoverage['/color.js'].lineData[431] = 0;
  _$jscoverage['/color.js'].lineData[433] = 0;
  _$jscoverage['/color.js'].lineData[434] = 0;
  _$jscoverage['/color.js'].lineData[436] = 0;
  _$jscoverage['/color.js'].lineData[437] = 0;
  _$jscoverage['/color.js'].lineData[439] = 0;
  _$jscoverage['/color.js'].lineData[440] = 0;
  _$jscoverage['/color.js'].lineData[442] = 0;
  _$jscoverage['/color.js'].lineData[443] = 0;
  _$jscoverage['/color.js'].lineData[445] = 0;
  _$jscoverage['/color.js'].lineData[446] = 0;
  _$jscoverage['/color.js'].lineData[448] = 0;
  _$jscoverage['/color.js'].lineData[450] = 0;
  _$jscoverage['/color.js'].lineData[451] = 0;
  _$jscoverage['/color.js'].lineData[453] = 0;
  _$jscoverage['/color.js'].lineData[460] = 0;
  _$jscoverage['/color.js'].lineData[461] = 0;
  _$jscoverage['/color.js'].lineData[464] = 0;
  _$jscoverage['/color.js'].lineData[465] = 0;
  _$jscoverage['/color.js'].lineData[468] = 0;
  _$jscoverage['/color.js'].lineData[469] = 0;
  _$jscoverage['/color.js'].lineData[470] = 0;
  _$jscoverage['/color.js'].lineData[472] = 0;
  _$jscoverage['/color.js'].lineData[475] = 0;
  _$jscoverage['/color.js'].lineData[476] = 0;
  _$jscoverage['/color.js'].lineData[479] = 0;
  _$jscoverage['/color.js'].lineData[480] = 0;
  _$jscoverage['/color.js'].lineData[483] = 0;
  _$jscoverage['/color.js'].lineData[484] = 0;
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
  _$jscoverage['/color.js'].branchData['23'] = [];
  _$jscoverage['/color.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['31'] = [];
  _$jscoverage['/color.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['85'] = [];
  _$jscoverage['/color.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['86'] = [];
  _$jscoverage['/color.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['87'] = [];
  _$jscoverage['/color.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['89'] = [];
  _$jscoverage['/color.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['126'] = [];
  _$jscoverage['/color.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['126'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['129'] = [];
  _$jscoverage['/color.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['148'] = [];
  _$jscoverage['/color.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['148'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['151'] = [];
  _$jscoverage['/color.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['255'] = [];
  _$jscoverage['/color.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['255'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['255'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['255'][4] = new BranchData();
  _$jscoverage['/color.js'].branchData['255'][5] = new BranchData();
  _$jscoverage['/color.js'].branchData['257'] = [];
  _$jscoverage['/color.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['261'] = [];
  _$jscoverage['/color.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['269'] = [];
  _$jscoverage['/color.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['273'] = [];
  _$jscoverage['/color.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['277'] = [];
  _$jscoverage['/color.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['385'] = [];
  _$jscoverage['/color.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['397'] = [];
  _$jscoverage['/color.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['416'] = [];
  _$jscoverage['/color.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['416'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['416'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['469'] = [];
  _$jscoverage['/color.js'].branchData['469'][1] = new BranchData();
}
_$jscoverage['/color.js'].branchData['469'][1].init(14, 14, 'v.length !== 2');
function visit30_469_1(result) {
  _$jscoverage['/color.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['416'][3].init(272, 9, 'h == null');
function visit29_416_3(result) {
  _$jscoverage['/color.js'].branchData['416'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['416'][2].init(261, 7, 's === 0');
function visit28_416_2(result) {
  _$jscoverage['/color.js'].branchData['416'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['416'][1].init(261, 20, 's === 0 || h == null');
function visit27_416_1(result) {
  _$jscoverage['/color.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['397'][1].init(742, 9, 'max === 0');
function visit26_397_1(result) {
  _$jscoverage['/color.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['385'][1].init(71, 5, 'g < b');
function visit25_385_1(result) {
  _$jscoverage['/color.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['277'][1].init(972, 24, 'typeof r === \'undefined\'');
function visit24_277_1(result) {
  _$jscoverage['/color.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['273'][1].init(176, 26, 'parseFloat(values[4]) || 1');
function visit23_273_1(result) {
  _$jscoverage['/color.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['269'][1].init(67, 6, 'values');
function visit22_269_1(result) {
  _$jscoverage['/color.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['261'][1].init(164, 16, 'str.length === 4');
function visit21_261_1(result) {
  _$jscoverage['/color.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['257'][1].init(66, 6, 'values');
function visit20_257_1(result) {
  _$jscoverage['/color.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['255'][5].init(154, 24, 'str.substr(0, 1) === \'#\'');
function visit19_255_5(result) {
  _$jscoverage['/color.js'].branchData['255'][5].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['255'][4].init(133, 16, 'str.length === 7');
function visit18_255_4(result) {
  _$jscoverage['/color.js'].branchData['255'][4].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['255'][3].init(113, 16, 'str.length === 4');
function visit17_255_3(result) {
  _$jscoverage['/color.js'].branchData['255'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['255'][2].init(113, 36, 'str.length === 4 || str.length === 7');
function visit16_255_2(result) {
  _$jscoverage['/color.js'].branchData['255'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['255'][1].init(113, 65, '(str.length === 4 || str.length === 7) && str.substr(0, 1) === \'#\'');
function visit15_255_1(result) {
  _$jscoverage['/color.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['151'][1].init(26, 8, 'x in cfg');
function visit14_151_1(result) {
  _$jscoverage['/color.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['148'][3].init(90, 24, '\'s\' in cfg && \'l\' in cfg');
function visit13_148_3(result) {
  _$jscoverage['/color.js'].branchData['148'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['148'][2].init(76, 38, '\'h\' in cfg && \'s\' in cfg && \'l\' in cfg');
function visit12_148_2(result) {
  _$jscoverage['/color.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['148'][1].init(74, 41, '!(\'h\' in cfg && \'s\' in cfg && \'l\' in cfg)');
function visit11_148_1(result) {
  _$jscoverage['/color.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['129'][1].init(26, 8, 'x in cfg');
function visit10_129_1(result) {
  _$jscoverage['/color.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['126'][3].init(90, 24, '\'s\' in cfg && \'v\' in cfg');
function visit9_126_3(result) {
  _$jscoverage['/color.js'].branchData['126'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['126'][2].init(76, 38, '\'h\' in cfg && \'s\' in cfg && \'v\' in cfg');
function visit8_126_2(result) {
  _$jscoverage['/color.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['126'][1].init(74, 41, '!(\'h\' in cfg && \'s\' in cfg && \'v\' in cfg)');
function visit7_126_1(result) {
  _$jscoverage['/color.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['89'][1].init(191, 9, 'g === max');
function visit6_89_1(result) {
  _$jscoverage['/color.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['87'][1].init(102, 9, 'r === max');
function visit5_87_1(result) {
  _$jscoverage['/color.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['86'][1].init(23, 7, 'l < 0.5');
function visit4_86_1(result) {
  _$jscoverage['/color.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['85'][1].init(441, 11, 'min !== max');
function visit3_85_1(result) {
  _$jscoverage['/color.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['31'][1].init(81, 10, 'hsl.h || 0');
function visit2_31_1(result) {
  _$jscoverage['/color.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['23'][1].init(80, 10, 'hsl.h || 0');
function visit1_23_1(result) {
  _$jscoverage['/color.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/color.js'].functionData[0]++;
  _$jscoverage['/color.js'].lineData[7]++;
  var rgbaRe = /\s*rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*(?:,\s*([\d\.]+))?\)\s*/, hexRe = /\s*#([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)\s*/;
  _$jscoverage['/color.js'].lineData[10]++;
  var Attribute = require('attribute');
  _$jscoverage['/color.js'].lineData[16]++;
  var Color = module.exports = Attribute.extend({
  toHSL: function() {
  _$jscoverage['/color.js'].functionData[1]++;
  _$jscoverage['/color.js'].lineData[22]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[23]++;
  return 'hsl(' + (Math.round(visit1_23_1(hsl.h || 0))) + ', ' + percentage(hsl.s) + ', ' + percentage(hsl.l) + ')';
}, 
  toHSLA: function() {
  _$jscoverage['/color.js'].functionData[2]++;
  _$jscoverage['/color.js'].lineData[30]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[31]++;
  return 'hsla(' + (Math.round(visit2_31_1(hsl.h || 0))) + ', ' + percentage(hsl.s) + ', ' + percentage(hsl.l) + ', ' + this.get('a') + ')';
}, 
  toRGB: function() {
  _$jscoverage['/color.js'].functionData[3]++;
  _$jscoverage['/color.js'].lineData[40]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[41]++;
  return 'rgb(' + self.get('r') + ', ' + self.get('g') + ', ' + self.get('b') + ')';
}, 
  toRGBA: function() {
  _$jscoverage['/color.js'].functionData[4]++;
  _$jscoverage['/color.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[49]++;
  return 'rgba(' + self.get('r') + ', ' + self.get('g') + ', ' + self.get('b') + ', ' + self.get('a') + ')';
}, 
  toHex: function() {
  _$jscoverage['/color.js'].functionData[5]++;
  _$jscoverage['/color.js'].lineData[57]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[58]++;
  return '#' + padding2(Number(self.get('r')).toString(16)) + padding2(Number(self.get('g')).toString(16)) + padding2(Number(self.get('b')).toString(16));
}, 
  toString: function() {
  _$jscoverage['/color.js'].functionData[6]++;
  _$jscoverage['/color.js'].lineData[66]++;
  return this.toRGBA();
}, 
  getHSL: function() {
  _$jscoverage['/color.js'].functionData[7]++;
  _$jscoverage['/color.js'].lineData[73]++;
  var self = this, r = self.get('r') / 255, g = self.get('g') / 255, b = self.get('b') / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, h, s = 0, l = 0.5 * (max + min);
  _$jscoverage['/color.js'].lineData[85]++;
  if (visit3_85_1(min !== max)) {
    _$jscoverage['/color.js'].lineData[86]++;
    s = (visit4_86_1(l < 0.5)) ? delta / (max + min) : delta / (2 - max - min);
    _$jscoverage['/color.js'].lineData[87]++;
    if (visit5_87_1(r === max)) {
      _$jscoverage['/color.js'].lineData[88]++;
      h = 60 * (g - b) / delta;
    } else {
      _$jscoverage['/color.js'].lineData[89]++;
      if (visit6_89_1(g === max)) {
        _$jscoverage['/color.js'].lineData[90]++;
        h = 120 + 60 * (b - r) / delta;
      } else {
        _$jscoverage['/color.js'].lineData[92]++;
        h = 240 + 60 * (r - g) / delta;
      }
    }
    _$jscoverage['/color.js'].lineData[95]++;
    h = (h + 360) % 360;
  }
  _$jscoverage['/color.js'].lineData[97]++;
  return {
  h: h, 
  s: s, 
  l: l};
}, 
  getHSV: function() {
  _$jscoverage['/color.js'].functionData[8]++;
  _$jscoverage['/color.js'].lineData[109]++;
  return rgb2hsv({
  r: this.get('r'), 
  g: this.get('g'), 
  b: this.get('b')});
}, 
  setHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[9]++;
  _$jscoverage['/color.js'].lineData[124]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[126]++;
  if (visit7_126_1(!(visit8_126_2('h' in cfg && visit9_126_3('s' in cfg && 'v' in cfg))))) {
    _$jscoverage['/color.js'].lineData[127]++;
    current = self.getHSV();
    _$jscoverage['/color.js'].lineData[128]++;
    S.each(['h', 's', 'v'], function(x) {
  _$jscoverage['/color.js'].functionData[10]++;
  _$jscoverage['/color.js'].lineData[129]++;
  if (visit10_129_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[130]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[133]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[135]++;
  self.set(hsv2rgb(cfg));
}, 
  setHSL: function(cfg) {
  _$jscoverage['/color.js'].functionData[11]++;
  _$jscoverage['/color.js'].lineData[146]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[148]++;
  if (visit11_148_1(!(visit12_148_2('h' in cfg && visit13_148_3('s' in cfg && 'l' in cfg))))) {
    _$jscoverage['/color.js'].lineData[149]++;
    current = self.getHSL();
    _$jscoverage['/color.js'].lineData[150]++;
    S.each(['h', 's', 'l'], function(x) {
  _$jscoverage['/color.js'].functionData[12]++;
  _$jscoverage['/color.js'].lineData[151]++;
  if (visit14_151_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[152]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[155]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[157]++;
  self.set(hsl2rgb(cfg));
}});
  _$jscoverage['/color.js'].lineData[161]++;
  S.mix(Color, {
  ATTRS: {
  r: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[13]++;
  _$jscoverage['/color.js'].lineData[177]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[14]++;
  _$jscoverage['/color.js'].lineData[180]++;
  return constrain255(v);
}}, 
  g: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[15]++;
  _$jscoverage['/color.js'].lineData[197]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[16]++;
  _$jscoverage['/color.js'].lineData[200]++;
  return constrain255(v);
}}, 
  b: {
  getter: function(v) {
  _$jscoverage['/color.js'].functionData[17]++;
  _$jscoverage['/color.js'].lineData[217]++;
  return Math.round(v);
}, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[18]++;
  _$jscoverage['/color.js'].lineData[220]++;
  return constrain255(v);
}}, 
  a: {
  value: 1, 
  setter: function(v) {
  _$jscoverage['/color.js'].functionData[19]++;
  _$jscoverage['/color.js'].lineData[239]++;
  return constrain1(v);
}}}, 
  parse: function(str) {
  _$jscoverage['/color.js'].functionData[20]++;
  _$jscoverage['/color.js'].lineData[250]++;
  var values, r, g, b, a = 1;
  _$jscoverage['/color.js'].lineData[255]++;
  if (visit15_255_1((visit16_255_2(visit17_255_3(str.length === 4) || visit18_255_4(str.length === 7))) && visit19_255_5(str.substr(0, 1) === '#'))) {
    _$jscoverage['/color.js'].lineData[256]++;
    values = str.match(hexRe);
    _$jscoverage['/color.js'].lineData[257]++;
    if (visit20_257_1(values)) {
      _$jscoverage['/color.js'].lineData[258]++;
      r = parseHex(values[1]);
      _$jscoverage['/color.js'].lineData[259]++;
      g = parseHex(values[2]);
      _$jscoverage['/color.js'].lineData[260]++;
      b = parseHex(values[3]);
      _$jscoverage['/color.js'].lineData[261]++;
      if (visit21_261_1(str.length === 4)) {
        _$jscoverage['/color.js'].lineData[262]++;
        r = paddingHex(r);
        _$jscoverage['/color.js'].lineData[263]++;
        g = paddingHex(g);
        _$jscoverage['/color.js'].lineData[264]++;
        b = paddingHex(b);
      }
    }
  } else {
    _$jscoverage['/color.js'].lineData[268]++;
    values = str.match(rgbaRe);
    _$jscoverage['/color.js'].lineData[269]++;
    if (visit22_269_1(values)) {
      _$jscoverage['/color.js'].lineData[270]++;
      r = parseInt(values[1], 10);
      _$jscoverage['/color.js'].lineData[271]++;
      g = parseInt(values[2], 10);
      _$jscoverage['/color.js'].lineData[272]++;
      b = parseInt(values[3], 10);
      _$jscoverage['/color.js'].lineData[273]++;
      a = visit23_273_1(parseFloat(values[4]) || 1);
    }
  }
  _$jscoverage['/color.js'].lineData[277]++;
  return (visit24_277_1(typeof r === 'undefined')) ? undefined : new Color({
  r: r, 
  g: g, 
  b: b, 
  a: a});
}, 
  fromHSL: function(cfg) {
  _$jscoverage['/color.js'].functionData[21]++;
  _$jscoverage['/color.js'].lineData[295]++;
  var rgb = hsl2rgb(cfg);
  _$jscoverage['/color.js'].lineData[296]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[297]++;
  return new Color(rgb);
}, 
  fromHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[22]++;
  _$jscoverage['/color.js'].lineData[309]++;
  var rgb = hsv2rgb(cfg);
  _$jscoverage['/color.js'].lineData[310]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[311]++;
  return new Color(rgb);
}});
  _$jscoverage['/color.js'].lineData[317]++;
  function to255(v) {
    _$jscoverage['/color.js'].functionData[23]++;
    _$jscoverage['/color.js'].lineData[318]++;
    return v * 255;
  }
  _$jscoverage['/color.js'].lineData[321]++;
  function hsv2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[24]++;
    _$jscoverage['/color.js'].lineData[322]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), v = Math.max(0, Math.min(1, cfg.v)), r, g, b, i = Math.floor((h / 60) % 6), f = (h / 60) - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    _$jscoverage['/color.js'].lineData[332]++;
    switch (i) {
      case 0:
        _$jscoverage['/color.js'].lineData[334]++;
        r = v;
        _$jscoverage['/color.js'].lineData[335]++;
        g = t;
        _$jscoverage['/color.js'].lineData[336]++;
        b = p;
        _$jscoverage['/color.js'].lineData[337]++;
        break;
      case 1:
        _$jscoverage['/color.js'].lineData[339]++;
        r = q;
        _$jscoverage['/color.js'].lineData[340]++;
        g = v;
        _$jscoverage['/color.js'].lineData[341]++;
        b = p;
        _$jscoverage['/color.js'].lineData[342]++;
        break;
      case 2:
        _$jscoverage['/color.js'].lineData[344]++;
        r = p;
        _$jscoverage['/color.js'].lineData[345]++;
        g = v;
        _$jscoverage['/color.js'].lineData[346]++;
        b = t;
        _$jscoverage['/color.js'].lineData[347]++;
        break;
      case 3:
        _$jscoverage['/color.js'].lineData[349]++;
        r = p;
        _$jscoverage['/color.js'].lineData[350]++;
        g = q;
        _$jscoverage['/color.js'].lineData[351]++;
        b = v;
        _$jscoverage['/color.js'].lineData[352]++;
        break;
      case 4:
        _$jscoverage['/color.js'].lineData[354]++;
        r = t;
        _$jscoverage['/color.js'].lineData[355]++;
        g = p;
        _$jscoverage['/color.js'].lineData[356]++;
        b = v;
        _$jscoverage['/color.js'].lineData[357]++;
        break;
      case 5:
        _$jscoverage['/color.js'].lineData[359]++;
        r = v;
        _$jscoverage['/color.js'].lineData[360]++;
        g = p;
        _$jscoverage['/color.js'].lineData[361]++;
        b = q;
        _$jscoverage['/color.js'].lineData[362]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[365]++;
    return {
  r: constrain255(to255(r)), 
  g: constrain255(to255(g)), 
  b: constrain255(to255(b))};
  }
  _$jscoverage['/color.js'].lineData[368]++;
  function rgb2hsv(cfg) {
    _$jscoverage['/color.js'].functionData[25]++;
    _$jscoverage['/color.js'].lineData[369]++;
    var r = cfg.r / 255, g = cfg.g / 255, b = cfg.b / 255;
    _$jscoverage['/color.js'].lineData[373]++;
    var h, s, min = Math.min(Math.min(r, g), b), max = Math.max(Math.max(r, g), b), delta = max - min, hsv;
    _$jscoverage['/color.js'].lineData[379]++;
    switch (max) {
      case min:
        _$jscoverage['/color.js'].lineData[381]++;
        h = 0;
        _$jscoverage['/color.js'].lineData[382]++;
        break;
      case r:
        _$jscoverage['/color.js'].lineData[384]++;
        h = 60 * (g - b) / delta;
        _$jscoverage['/color.js'].lineData[385]++;
        if (visit25_385_1(g < b)) {
          _$jscoverage['/color.js'].lineData[386]++;
          h += 360;
        }
        _$jscoverage['/color.js'].lineData[388]++;
        break;
      case g:
        _$jscoverage['/color.js'].lineData[390]++;
        h = (60 * (b - r) / delta) + 120;
        _$jscoverage['/color.js'].lineData[391]++;
        break;
      case b:
        _$jscoverage['/color.js'].lineData[393]++;
        h = (60 * (r - g) / delta) + 240;
        _$jscoverage['/color.js'].lineData[394]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[397]++;
    s = (visit26_397_1(max === 0)) ? 0 : 1 - (min / max);
    _$jscoverage['/color.js'].lineData[399]++;
    hsv = {
  h: Math.round(h), 
  s: s, 
  v: max};
    _$jscoverage['/color.js'].lineData[405]++;
    return hsv;
  }
  _$jscoverage['/color.js'].lineData[408]++;
  function hsl2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[26]++;
    _$jscoverage['/color.js'].lineData[409]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), l = Math.max(0, Math.min(1, cfg.l)), C, X, m, rgb = [], abs = Math.abs, floor = Math.floor;
    _$jscoverage['/color.js'].lineData[416]++;
    if (visit27_416_1(visit28_416_2(s === 0) || visit29_416_3(h == null))) {
      _$jscoverage['/color.js'].lineData[418]++;
      rgb = [l, l, l];
    } else {
      _$jscoverage['/color.js'].lineData[424]++;
      h /= 60;
      _$jscoverage['/color.js'].lineData[425]++;
      C = s * (1 - abs(2 * l - 1));
      _$jscoverage['/color.js'].lineData[426]++;
      X = C * (1 - abs(h - 2 * floor(h / 2) - 1));
      _$jscoverage['/color.js'].lineData[427]++;
      m = l - C / 2;
      _$jscoverage['/color.js'].lineData[428]++;
      switch (floor(h)) {
        case 0:
          _$jscoverage['/color.js'].lineData[430]++;
          rgb = [C, X, 0];
          _$jscoverage['/color.js'].lineData[431]++;
          break;
        case 1:
          _$jscoverage['/color.js'].lineData[433]++;
          rgb = [X, C, 0];
          _$jscoverage['/color.js'].lineData[434]++;
          break;
        case 2:
          _$jscoverage['/color.js'].lineData[436]++;
          rgb = [0, C, X];
          _$jscoverage['/color.js'].lineData[437]++;
          break;
        case 3:
          _$jscoverage['/color.js'].lineData[439]++;
          rgb = [0, X, C];
          _$jscoverage['/color.js'].lineData[440]++;
          break;
        case 4:
          _$jscoverage['/color.js'].lineData[442]++;
          rgb = [X, 0, C];
          _$jscoverage['/color.js'].lineData[443]++;
          break;
        case 5:
          _$jscoverage['/color.js'].lineData[445]++;
          rgb = [C, 0, X];
          _$jscoverage['/color.js'].lineData[446]++;
          break;
      }
      _$jscoverage['/color.js'].lineData[448]++;
      rgb = [rgb[0] + m, rgb[1] + m, rgb[2] + m];
    }
    _$jscoverage['/color.js'].lineData[450]++;
    S.each(rgb, function(v, index) {
  _$jscoverage['/color.js'].functionData[27]++;
  _$jscoverage['/color.js'].lineData[451]++;
  rgb[index] = to255(v);
});
    _$jscoverage['/color.js'].lineData[453]++;
    return {
  r: rgb[0], 
  g: rgb[1], 
  b: rgb[2]};
  }
  _$jscoverage['/color.js'].lineData[460]++;
  function parseHex(v) {
    _$jscoverage['/color.js'].functionData[28]++;
    _$jscoverage['/color.js'].lineData[461]++;
    return parseInt(v, 16);
  }
  _$jscoverage['/color.js'].lineData[464]++;
  function paddingHex(v) {
    _$jscoverage['/color.js'].functionData[29]++;
    _$jscoverage['/color.js'].lineData[465]++;
    return v + v * 16;
  }
  _$jscoverage['/color.js'].lineData[468]++;
  function padding2(v) {
    _$jscoverage['/color.js'].functionData[30]++;
    _$jscoverage['/color.js'].lineData[469]++;
    if (visit30_469_1(v.length !== 2)) {
      _$jscoverage['/color.js'].lineData[470]++;
      v = '0' + v;
    }
    _$jscoverage['/color.js'].lineData[472]++;
    return v;
  }
  _$jscoverage['/color.js'].lineData[475]++;
  function percentage(v) {
    _$jscoverage['/color.js'].functionData[31]++;
    _$jscoverage['/color.js'].lineData[476]++;
    return Math.round(v * 100) + '%';
  }
  _$jscoverage['/color.js'].lineData[479]++;
  function constrain255(v) {
    _$jscoverage['/color.js'].functionData[32]++;
    _$jscoverage['/color.js'].lineData[480]++;
    return Math.max(0, Math.min(v, 255));
  }
  _$jscoverage['/color.js'].lineData[483]++;
  function constrain1(v) {
    _$jscoverage['/color.js'].functionData[33]++;
    _$jscoverage['/color.js'].lineData[484]++;
    return Math.max(0, Math.min(v, 1));
  }
});
