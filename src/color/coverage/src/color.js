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
  _$jscoverage['/color.js'].lineData[14] = 0;
  _$jscoverage['/color.js'].lineData[20] = 0;
  _$jscoverage['/color.js'].lineData[21] = 0;
  _$jscoverage['/color.js'].lineData[28] = 0;
  _$jscoverage['/color.js'].lineData[29] = 0;
  _$jscoverage['/color.js'].lineData[38] = 0;
  _$jscoverage['/color.js'].lineData[39] = 0;
  _$jscoverage['/color.js'].lineData[46] = 0;
  _$jscoverage['/color.js'].lineData[47] = 0;
  _$jscoverage['/color.js'].lineData[55] = 0;
  _$jscoverage['/color.js'].lineData[56] = 0;
  _$jscoverage['/color.js'].lineData[64] = 0;
  _$jscoverage['/color.js'].lineData[71] = 0;
  _$jscoverage['/color.js'].lineData[83] = 0;
  _$jscoverage['/color.js'].lineData[84] = 0;
  _$jscoverage['/color.js'].lineData[85] = 0;
  _$jscoverage['/color.js'].lineData[86] = 0;
  _$jscoverage['/color.js'].lineData[87] = 0;
  _$jscoverage['/color.js'].lineData[88] = 0;
  _$jscoverage['/color.js'].lineData[90] = 0;
  _$jscoverage['/color.js'].lineData[93] = 0;
  _$jscoverage['/color.js'].lineData[95] = 0;
  _$jscoverage['/color.js'].lineData[107] = 0;
  _$jscoverage['/color.js'].lineData[122] = 0;
  _$jscoverage['/color.js'].lineData[124] = 0;
  _$jscoverage['/color.js'].lineData[126] = 0;
  _$jscoverage['/color.js'].lineData[127] = 0;
  _$jscoverage['/color.js'].lineData[128] = 0;
  _$jscoverage['/color.js'].lineData[129] = 0;
  _$jscoverage['/color.js'].lineData[132] = 0;
  _$jscoverage['/color.js'].lineData[134] = 0;
  _$jscoverage['/color.js'].lineData[146] = 0;
  _$jscoverage['/color.js'].lineData[148] = 0;
  _$jscoverage['/color.js'].lineData[150] = 0;
  _$jscoverage['/color.js'].lineData[151] = 0;
  _$jscoverage['/color.js'].lineData[152] = 0;
  _$jscoverage['/color.js'].lineData[153] = 0;
  _$jscoverage['/color.js'].lineData[156] = 0;
  _$jscoverage['/color.js'].lineData[160] = 0;
  _$jscoverage['/color.js'].lineData[178] = 0;
  _$jscoverage['/color.js'].lineData[181] = 0;
  _$jscoverage['/color.js'].lineData[198] = 0;
  _$jscoverage['/color.js'].lineData[201] = 0;
  _$jscoverage['/color.js'].lineData[218] = 0;
  _$jscoverage['/color.js'].lineData[221] = 0;
  _$jscoverage['/color.js'].lineData[240] = 0;
  _$jscoverage['/color.js'].lineData[252] = 0;
  _$jscoverage['/color.js'].lineData[257] = 0;
  _$jscoverage['/color.js'].lineData[258] = 0;
  _$jscoverage['/color.js'].lineData[259] = 0;
  _$jscoverage['/color.js'].lineData[260] = 0;
  _$jscoverage['/color.js'].lineData[261] = 0;
  _$jscoverage['/color.js'].lineData[262] = 0;
  _$jscoverage['/color.js'].lineData[263] = 0;
  _$jscoverage['/color.js'].lineData[264] = 0;
  _$jscoverage['/color.js'].lineData[265] = 0;
  _$jscoverage['/color.js'].lineData[266] = 0;
  _$jscoverage['/color.js'].lineData[271] = 0;
  _$jscoverage['/color.js'].lineData[272] = 0;
  _$jscoverage['/color.js'].lineData[273] = 0;
  _$jscoverage['/color.js'].lineData[274] = 0;
  _$jscoverage['/color.js'].lineData[275] = 0;
  _$jscoverage['/color.js'].lineData[276] = 0;
  _$jscoverage['/color.js'].lineData[280] = 0;
  _$jscoverage['/color.js'].lineData[298] = 0;
  _$jscoverage['/color.js'].lineData[299] = 0;
  _$jscoverage['/color.js'].lineData[300] = 0;
  _$jscoverage['/color.js'].lineData[312] = 0;
  _$jscoverage['/color.js'].lineData[313] = 0;
  _$jscoverage['/color.js'].lineData[314] = 0;
  _$jscoverage['/color.js'].lineData[320] = 0;
  _$jscoverage['/color.js'].lineData[321] = 0;
  _$jscoverage['/color.js'].lineData[325] = 0;
  _$jscoverage['/color.js'].lineData[326] = 0;
  _$jscoverage['/color.js'].lineData[336] = 0;
  _$jscoverage['/color.js'].lineData[338] = 0;
  _$jscoverage['/color.js'].lineData[339] = 0;
  _$jscoverage['/color.js'].lineData[340] = 0;
  _$jscoverage['/color.js'].lineData[341] = 0;
  _$jscoverage['/color.js'].lineData[343] = 0;
  _$jscoverage['/color.js'].lineData[344] = 0;
  _$jscoverage['/color.js'].lineData[345] = 0;
  _$jscoverage['/color.js'].lineData[346] = 0;
  _$jscoverage['/color.js'].lineData[348] = 0;
  _$jscoverage['/color.js'].lineData[349] = 0;
  _$jscoverage['/color.js'].lineData[350] = 0;
  _$jscoverage['/color.js'].lineData[351] = 0;
  _$jscoverage['/color.js'].lineData[353] = 0;
  _$jscoverage['/color.js'].lineData[354] = 0;
  _$jscoverage['/color.js'].lineData[355] = 0;
  _$jscoverage['/color.js'].lineData[356] = 0;
  _$jscoverage['/color.js'].lineData[358] = 0;
  _$jscoverage['/color.js'].lineData[359] = 0;
  _$jscoverage['/color.js'].lineData[360] = 0;
  _$jscoverage['/color.js'].lineData[361] = 0;
  _$jscoverage['/color.js'].lineData[363] = 0;
  _$jscoverage['/color.js'].lineData[364] = 0;
  _$jscoverage['/color.js'].lineData[365] = 0;
  _$jscoverage['/color.js'].lineData[366] = 0;
  _$jscoverage['/color.js'].lineData[369] = 0;
  _$jscoverage['/color.js'].lineData[372] = 0;
  _$jscoverage['/color.js'].lineData[373] = 0;
  _$jscoverage['/color.js'].lineData[377] = 0;
  _$jscoverage['/color.js'].lineData[383] = 0;
  _$jscoverage['/color.js'].lineData[385] = 0;
  _$jscoverage['/color.js'].lineData[386] = 0;
  _$jscoverage['/color.js'].lineData[388] = 0;
  _$jscoverage['/color.js'].lineData[389] = 0;
  _$jscoverage['/color.js'].lineData[390] = 0;
  _$jscoverage['/color.js'].lineData[392] = 0;
  _$jscoverage['/color.js'].lineData[394] = 0;
  _$jscoverage['/color.js'].lineData[395] = 0;
  _$jscoverage['/color.js'].lineData[397] = 0;
  _$jscoverage['/color.js'].lineData[398] = 0;
  _$jscoverage['/color.js'].lineData[401] = 0;
  _$jscoverage['/color.js'].lineData[403] = 0;
  _$jscoverage['/color.js'].lineData[409] = 0;
  _$jscoverage['/color.js'].lineData[412] = 0;
  _$jscoverage['/color.js'].lineData[413] = 0;
  _$jscoverage['/color.js'].lineData[420] = 0;
  _$jscoverage['/color.js'].lineData[422] = 0;
  _$jscoverage['/color.js'].lineData[428] = 0;
  _$jscoverage['/color.js'].lineData[429] = 0;
  _$jscoverage['/color.js'].lineData[430] = 0;
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
  _$jscoverage['/color.js'].lineData[450] = 0;
  _$jscoverage['/color.js'].lineData[452] = 0;
  _$jscoverage['/color.js'].lineData[454] = 0;
  _$jscoverage['/color.js'].lineData[455] = 0;
  _$jscoverage['/color.js'].lineData[457] = 0;
  _$jscoverage['/color.js'].lineData[464] = 0;
  _$jscoverage['/color.js'].lineData[465] = 0;
  _$jscoverage['/color.js'].lineData[468] = 0;
  _$jscoverage['/color.js'].lineData[469] = 0;
  _$jscoverage['/color.js'].lineData[472] = 0;
  _$jscoverage['/color.js'].lineData[473] = 0;
  _$jscoverage['/color.js'].lineData[474] = 0;
  _$jscoverage['/color.js'].lineData[476] = 0;
  _$jscoverage['/color.js'].lineData[479] = 0;
  _$jscoverage['/color.js'].lineData[480] = 0;
  _$jscoverage['/color.js'].lineData[483] = 0;
  _$jscoverage['/color.js'].lineData[484] = 0;
  _$jscoverage['/color.js'].lineData[487] = 0;
  _$jscoverage['/color.js'].lineData[488] = 0;
  _$jscoverage['/color.js'].lineData[494] = 0;
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
  _$jscoverage['/color.js'].branchData['21'] = [];
  _$jscoverage['/color.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['29'] = [];
  _$jscoverage['/color.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['83'] = [];
  _$jscoverage['/color.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['84'] = [];
  _$jscoverage['/color.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['85'] = [];
  _$jscoverage['/color.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['87'] = [];
  _$jscoverage['/color.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['124'] = [];
  _$jscoverage['/color.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['128'] = [];
  _$jscoverage['/color.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['148'] = [];
  _$jscoverage['/color.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['152'] = [];
  _$jscoverage['/color.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['257'] = [];
  _$jscoverage['/color.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['257'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['257'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['257'][4] = new BranchData();
  _$jscoverage['/color.js'].branchData['257'][5] = new BranchData();
  _$jscoverage['/color.js'].branchData['259'] = [];
  _$jscoverage['/color.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['263'] = [];
  _$jscoverage['/color.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['272'] = [];
  _$jscoverage['/color.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['276'] = [];
  _$jscoverage['/color.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['280'] = [];
  _$jscoverage['/color.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['389'] = [];
  _$jscoverage['/color.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['401'] = [];
  _$jscoverage['/color.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['420'] = [];
  _$jscoverage['/color.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/color.js'].branchData['420'][2] = new BranchData();
  _$jscoverage['/color.js'].branchData['420'][3] = new BranchData();
  _$jscoverage['/color.js'].branchData['473'] = [];
  _$jscoverage['/color.js'].branchData['473'][1] = new BranchData();
}
_$jscoverage['/color.js'].branchData['473'][1].init(14, 13, 'v.length != 2');
function visit28_473_1(result) {
  _$jscoverage['/color.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['420'][3].init(271, 9, 'h == null');
function visit27_420_3(result) {
  _$jscoverage['/color.js'].branchData['420'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['420'][2].init(261, 6, 's == 0');
function visit26_420_2(result) {
  _$jscoverage['/color.js'].branchData['420'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['420'][1].init(261, 19, 's == 0 || h == null');
function visit25_420_1(result) {
  _$jscoverage['/color.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['401'][1].init(742, 9, 'max === 0');
function visit24_401_1(result) {
  _$jscoverage['/color.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['389'][1].init(71, 5, 'g < b');
function visit23_389_1(result) {
  _$jscoverage['/color.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['280'][1].init(970, 23, 'typeof r == \'undefined\'');
function visit22_280_1(result) {
  _$jscoverage['/color.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['276'][1].init(164, 26, 'parseFloat(values[4]) || 1');
function visit21_276_1(result) {
  _$jscoverage['/color.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['272'][1].init(67, 6, 'values');
function visit20_272_1(result) {
  _$jscoverage['/color.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['263'][1].init(164, 15, 'str.length == 4');
function visit19_263_1(result) {
  _$jscoverage['/color.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['259'][1].init(66, 6, 'values');
function visit18_259_1(result) {
  _$jscoverage['/color.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['257'][5].init(152, 24, 'str.substr(0, 1) === \'#\'');
function visit17_257_5(result) {
  _$jscoverage['/color.js'].branchData['257'][5].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['257'][4].init(132, 15, 'str.length == 7');
function visit16_257_4(result) {
  _$jscoverage['/color.js'].branchData['257'][4].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['257'][3].init(113, 15, 'str.length == 4');
function visit15_257_3(result) {
  _$jscoverage['/color.js'].branchData['257'][3].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['257'][2].init(113, 34, 'str.length == 4 || str.length == 7');
function visit14_257_2(result) {
  _$jscoverage['/color.js'].branchData['257'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['257'][1].init(113, 63, '(str.length == 4 || str.length == 7) && str.substr(0, 1) === \'#\'');
function visit13_257_1(result) {
  _$jscoverage['/color.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['152'][1].init(26, 8, 'x in cfg');
function visit12_152_1(result) {
  _$jscoverage['/color.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['148'][2].init(88, 24, '"s" in cfg && "l" in cfg');
function visit11_148_2(result) {
  _$jscoverage['/color.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['148'][1].init(74, 38, '"h" in cfg && "s" in cfg && "l" in cfg');
function visit10_148_1(result) {
  _$jscoverage['/color.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['128'][1].init(26, 8, 'x in cfg');
function visit9_128_1(result) {
  _$jscoverage['/color.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['124'][2].init(88, 24, '"s" in cfg && "v" in cfg');
function visit8_124_2(result) {
  _$jscoverage['/color.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['124'][1].init(74, 38, '"h" in cfg && "s" in cfg && "v" in cfg');
function visit7_124_1(result) {
  _$jscoverage['/color.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['87'][1].init(190, 8, 'g == max');
function visit6_87_1(result) {
  _$jscoverage['/color.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['85'][1].init(102, 8, 'r == max');
function visit5_85_1(result) {
  _$jscoverage['/color.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['84'][1].init(23, 7, 'l < 0.5');
function visit4_84_1(result) {
  _$jscoverage['/color.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['83'][1].init(441, 10, 'min != max');
function visit3_83_1(result) {
  _$jscoverage['/color.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['29'][1].init(81, 10, 'hsl.h || 0');
function visit2_29_1(result) {
  _$jscoverage['/color.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].branchData['21'][1].init(80, 10, 'hsl.h || 0');
function visit1_21_1(result) {
  _$jscoverage['/color.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/color.js'].lineData[6]++;
KISSY.add("color", function(S, Base) {
  _$jscoverage['/color.js'].functionData[0]++;
  _$jscoverage['/color.js'].lineData[7]++;
  var rgbaRe = /\s*rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*(?:,\s*([\d\.]+))?\)\s*/, hexRe = /\s*#([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)\s*/;
  _$jscoverage['/color.js'].lineData[14]++;
  var Color = Base.extend({
  toHSL: function() {
  _$jscoverage['/color.js'].functionData[1]++;
  _$jscoverage['/color.js'].lineData[20]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[21]++;
  return "hsl(" + (Math.round(visit1_21_1(hsl.h || 0))) + ", " + percentage(hsl.s) + ", " + percentage(hsl.l) + ")";
}, 
  'toHSLA': function() {
  _$jscoverage['/color.js'].functionData[2]++;
  _$jscoverage['/color.js'].lineData[28]++;
  var hsl = this.getHSL();
  _$jscoverage['/color.js'].lineData[29]++;
  return "hsla(" + (Math.round(visit2_29_1(hsl.h || 0))) + ", " + percentage(hsl.s) + ", " + percentage(hsl.l) + ", " + this.get('a') + ")";
}, 
  toRGB: function() {
  _$jscoverage['/color.js'].functionData[3]++;
  _$jscoverage['/color.js'].lineData[38]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[39]++;
  return "rgb(" + self.get("r") + ", " + self.get("g") + ", " + self.get("b") + ")";
}, 
  toRGBA: function() {
  _$jscoverage['/color.js'].functionData[4]++;
  _$jscoverage['/color.js'].lineData[46]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[47]++;
  return "rgba(" + self.get("r") + ", " + self.get("g") + ", " + self.get("b") + ", " + self.get("a") + ")";
}, 
  toHex: function() {
  _$jscoverage['/color.js'].functionData[5]++;
  _$jscoverage['/color.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/color.js'].lineData[56]++;
  return "#" + padding2(Number(self.get("r")).toString(16)) + padding2(Number(self.get("g")).toString(16)) + padding2(Number(self.get("b")).toString(16));
}, 
  toString: function() {
  _$jscoverage['/color.js'].functionData[6]++;
  _$jscoverage['/color.js'].lineData[64]++;
  return this.toRGBA();
}, 
  getHSL: function() {
  _$jscoverage['/color.js'].functionData[7]++;
  _$jscoverage['/color.js'].lineData[71]++;
  var self = this, r = self.get("r") / 255, g = self.get("g") / 255, b = self.get("b") / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, h, s = 0, l = 0.5 * (max + min);
  _$jscoverage['/color.js'].lineData[83]++;
  if (visit3_83_1(min != max)) {
    _$jscoverage['/color.js'].lineData[84]++;
    s = (visit4_84_1(l < 0.5)) ? delta / (max + min) : delta / (2 - max - min);
    _$jscoverage['/color.js'].lineData[85]++;
    if (visit5_85_1(r == max)) {
      _$jscoverage['/color.js'].lineData[86]++;
      h = 60 * (g - b) / delta;
    } else {
      _$jscoverage['/color.js'].lineData[87]++;
      if (visit6_87_1(g == max)) {
        _$jscoverage['/color.js'].lineData[88]++;
        h = 120 + 60 * (b - r) / delta;
      } else {
        _$jscoverage['/color.js'].lineData[90]++;
        h = 240 + 60 * (r - g) / delta;
      }
    }
    _$jscoverage['/color.js'].lineData[93]++;
    h = (h + 360) % 360;
  }
  _$jscoverage['/color.js'].lineData[95]++;
  return {
  h: h, 
  s: s, 
  l: l};
}, 
  getHSV: function() {
  _$jscoverage['/color.js'].functionData[8]++;
  _$jscoverage['/color.js'].lineData[107]++;
  return rgb2hsv({
  r: this.get("r"), 
  g: this.get("g"), 
  b: this.get("b")});
}, 
  setHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[9]++;
  _$jscoverage['/color.js'].lineData[122]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[124]++;
  if (visit7_124_1("h" in cfg && visit8_124_2("s" in cfg && "v" in cfg))) {
  } else {
    _$jscoverage['/color.js'].lineData[126]++;
    current = self.getHSV();
    _$jscoverage['/color.js'].lineData[127]++;
    S.each(["h", "s", "v"], function(x) {
  _$jscoverage['/color.js'].functionData[10]++;
  _$jscoverage['/color.js'].lineData[128]++;
  if (visit9_128_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[129]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[132]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[134]++;
  self.set(hsv2rgb(cfg));
}, 
  'setHSL': function(cfg) {
  _$jscoverage['/color.js'].functionData[11]++;
  _$jscoverage['/color.js'].lineData[146]++;
  var self = this, current;
  _$jscoverage['/color.js'].lineData[148]++;
  if (visit10_148_1("h" in cfg && visit11_148_2("s" in cfg && "l" in cfg))) {
  } else {
    _$jscoverage['/color.js'].lineData[150]++;
    current = self.getHSL();
    _$jscoverage['/color.js'].lineData[151]++;
    S.each(["h", "s", "l"], function(x) {
  _$jscoverage['/color.js'].functionData[12]++;
  _$jscoverage['/color.js'].lineData[152]++;
  if (visit12_152_1(x in cfg)) {
    _$jscoverage['/color.js'].lineData[153]++;
    current[x] = cfg[x];
  }
});
    _$jscoverage['/color.js'].lineData[156]++;
    cfg = current;
  }
  _$jscoverage['/color.js'].lineData[160]++;
  self.set(hsl2rgb(cfg));
}}, {
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
  _$jscoverage['/color.js'].lineData[252]++;
  var values, r, g, b, a = 1;
  _$jscoverage['/color.js'].lineData[257]++;
  if (visit13_257_1((visit14_257_2(visit15_257_3(str.length == 4) || visit16_257_4(str.length == 7))) && visit17_257_5(str.substr(0, 1) === '#'))) {
    _$jscoverage['/color.js'].lineData[258]++;
    values = str.match(hexRe);
    _$jscoverage['/color.js'].lineData[259]++;
    if (visit18_259_1(values)) {
      _$jscoverage['/color.js'].lineData[260]++;
      r = parseHex(values[1]);
      _$jscoverage['/color.js'].lineData[261]++;
      g = parseHex(values[2]);
      _$jscoverage['/color.js'].lineData[262]++;
      b = parseHex(values[3]);
      _$jscoverage['/color.js'].lineData[263]++;
      if (visit19_263_1(str.length == 4)) {
        _$jscoverage['/color.js'].lineData[264]++;
        r = paddingHex(r);
        _$jscoverage['/color.js'].lineData[265]++;
        g = paddingHex(g);
        _$jscoverage['/color.js'].lineData[266]++;
        b = paddingHex(b);
      }
    }
  } else {
    _$jscoverage['/color.js'].lineData[271]++;
    values = str.match(rgbaRe);
    _$jscoverage['/color.js'].lineData[272]++;
    if (visit20_272_1(values)) {
      _$jscoverage['/color.js'].lineData[273]++;
      r = parseInt(values[1]);
      _$jscoverage['/color.js'].lineData[274]++;
      g = parseInt(values[2]);
      _$jscoverage['/color.js'].lineData[275]++;
      b = parseInt(values[3]);
      _$jscoverage['/color.js'].lineData[276]++;
      a = visit21_276_1(parseFloat(values[4]) || 1);
    }
  }
  _$jscoverage['/color.js'].lineData[280]++;
  return (visit22_280_1(typeof r == 'undefined')) ? undefined : new Color({
  r: r, 
  g: g, 
  b: b, 
  a: a});
}, 
  'fromHSL': function(cfg) {
  _$jscoverage['/color.js'].functionData[21]++;
  _$jscoverage['/color.js'].lineData[298]++;
  var rgb = hsl2rgb(cfg);
  _$jscoverage['/color.js'].lineData[299]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[300]++;
  return new Color(rgb);
}, 
  fromHSV: function(cfg) {
  _$jscoverage['/color.js'].functionData[22]++;
  _$jscoverage['/color.js'].lineData[312]++;
  var rgb = hsv2rgb(cfg);
  _$jscoverage['/color.js'].lineData[313]++;
  rgb.a = cfg.a;
  _$jscoverage['/color.js'].lineData[314]++;
  return new Color(rgb);
}});
  _$jscoverage['/color.js'].lineData[320]++;
  function to255(v) {
    _$jscoverage['/color.js'].functionData[23]++;
    _$jscoverage['/color.js'].lineData[321]++;
    return v * 255;
  }
  _$jscoverage['/color.js'].lineData[325]++;
  function hsv2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[24]++;
    _$jscoverage['/color.js'].lineData[326]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), v = Math.max(0, Math.min(1, cfg.v)), r, g, b, i = Math.floor((h / 60) % 6), f = (h / 60) - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    _$jscoverage['/color.js'].lineData[336]++;
    switch (i) {
      case 0:
        _$jscoverage['/color.js'].lineData[338]++;
        r = v;
        _$jscoverage['/color.js'].lineData[339]++;
        g = t;
        _$jscoverage['/color.js'].lineData[340]++;
        b = p;
        _$jscoverage['/color.js'].lineData[341]++;
        break;
      case 1:
        _$jscoverage['/color.js'].lineData[343]++;
        r = q;
        _$jscoverage['/color.js'].lineData[344]++;
        g = v;
        _$jscoverage['/color.js'].lineData[345]++;
        b = p;
        _$jscoverage['/color.js'].lineData[346]++;
        break;
      case 2:
        _$jscoverage['/color.js'].lineData[348]++;
        r = p;
        _$jscoverage['/color.js'].lineData[349]++;
        g = v;
        _$jscoverage['/color.js'].lineData[350]++;
        b = t;
        _$jscoverage['/color.js'].lineData[351]++;
        break;
      case 3:
        _$jscoverage['/color.js'].lineData[353]++;
        r = p;
        _$jscoverage['/color.js'].lineData[354]++;
        g = q;
        _$jscoverage['/color.js'].lineData[355]++;
        b = v;
        _$jscoverage['/color.js'].lineData[356]++;
        break;
      case 4:
        _$jscoverage['/color.js'].lineData[358]++;
        r = t;
        _$jscoverage['/color.js'].lineData[359]++;
        g = p;
        _$jscoverage['/color.js'].lineData[360]++;
        b = v;
        _$jscoverage['/color.js'].lineData[361]++;
        break;
      case 5:
        _$jscoverage['/color.js'].lineData[363]++;
        r = v;
        _$jscoverage['/color.js'].lineData[364]++;
        g = p;
        _$jscoverage['/color.js'].lineData[365]++;
        b = q;
        _$jscoverage['/color.js'].lineData[366]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[369]++;
    return {
  r: constrain255(to255(r)), 
  g: constrain255(to255(g)), 
  b: constrain255(to255(b))};
  }
  _$jscoverage['/color.js'].lineData[372]++;
  function rgb2hsv(cfg) {
    _$jscoverage['/color.js'].functionData[25]++;
    _$jscoverage['/color.js'].lineData[373]++;
    var r = cfg.r / 255, g = cfg.g / 255, b = cfg.b / 255;
    _$jscoverage['/color.js'].lineData[377]++;
    var h, s, min = Math.min(Math.min(r, g), b), max = Math.max(Math.max(r, g), b), delta = max - min, hsv;
    _$jscoverage['/color.js'].lineData[383]++;
    switch (max) {
      case min:
        _$jscoverage['/color.js'].lineData[385]++;
        h = 0;
        _$jscoverage['/color.js'].lineData[386]++;
        break;
      case r:
        _$jscoverage['/color.js'].lineData[388]++;
        h = 60 * (g - b) / delta;
        _$jscoverage['/color.js'].lineData[389]++;
        if (visit23_389_1(g < b)) {
          _$jscoverage['/color.js'].lineData[390]++;
          h += 360;
        }
        _$jscoverage['/color.js'].lineData[392]++;
        break;
      case g:
        _$jscoverage['/color.js'].lineData[394]++;
        h = (60 * (b - r) / delta) + 120;
        _$jscoverage['/color.js'].lineData[395]++;
        break;
      case b:
        _$jscoverage['/color.js'].lineData[397]++;
        h = (60 * (r - g) / delta) + 240;
        _$jscoverage['/color.js'].lineData[398]++;
        break;
    }
    _$jscoverage['/color.js'].lineData[401]++;
    s = (visit24_401_1(max === 0)) ? 0 : 1 - (min / max);
    _$jscoverage['/color.js'].lineData[403]++;
    hsv = {
  h: Math.round(h), 
  s: s, 
  v: max};
    _$jscoverage['/color.js'].lineData[409]++;
    return hsv;
  }
  _$jscoverage['/color.js'].lineData[412]++;
  function hsl2rgb(cfg) {
    _$jscoverage['/color.js'].functionData[26]++;
    _$jscoverage['/color.js'].lineData[413]++;
    var h = Math.min(Math.round(cfg.h), 359), s = Math.max(0, Math.min(1, cfg.s)), l = Math.max(0, Math.min(1, cfg.l)), C, X, m, rgb = [], abs = Math.abs, floor = Math.floor;
    _$jscoverage['/color.js'].lineData[420]++;
    if (visit25_420_1(visit26_420_2(s == 0) || visit27_420_3(h == null))) {
      _$jscoverage['/color.js'].lineData[422]++;
      rgb = [l, l, l];
    } else {
      _$jscoverage['/color.js'].lineData[428]++;
      h /= 60;
      _$jscoverage['/color.js'].lineData[429]++;
      C = s * (1 - abs(2 * l - 1));
      _$jscoverage['/color.js'].lineData[430]++;
      X = C * (1 - abs(h - 2 * floor(h / 2) - 1));
      _$jscoverage['/color.js'].lineData[431]++;
      m = l - C / 2;
      _$jscoverage['/color.js'].lineData[432]++;
      switch (floor(h)) {
        case 0:
          _$jscoverage['/color.js'].lineData[434]++;
          rgb = [C, X, 0];
          _$jscoverage['/color.js'].lineData[435]++;
          break;
        case 1:
          _$jscoverage['/color.js'].lineData[437]++;
          rgb = [X, C, 0];
          _$jscoverage['/color.js'].lineData[438]++;
          break;
        case 2:
          _$jscoverage['/color.js'].lineData[440]++;
          rgb = [0, C, X];
          _$jscoverage['/color.js'].lineData[441]++;
          break;
        case 3:
          _$jscoverage['/color.js'].lineData[443]++;
          rgb = [0, X, C];
          _$jscoverage['/color.js'].lineData[444]++;
          break;
        case 4:
          _$jscoverage['/color.js'].lineData[446]++;
          rgb = [X, 0, C];
          _$jscoverage['/color.js'].lineData[447]++;
          break;
        case 5:
          _$jscoverage['/color.js'].lineData[449]++;
          rgb = [C, 0, X];
          _$jscoverage['/color.js'].lineData[450]++;
          break;
      }
      _$jscoverage['/color.js'].lineData[452]++;
      rgb = [rgb[0] + m, rgb[1] + m, rgb[2] + m];
    }
    _$jscoverage['/color.js'].lineData[454]++;
    S.each(rgb, function(v, index) {
  _$jscoverage['/color.js'].functionData[27]++;
  _$jscoverage['/color.js'].lineData[455]++;
  rgb[index] = to255(v);
});
    _$jscoverage['/color.js'].lineData[457]++;
    return {
  r: rgb[0], 
  g: rgb[1], 
  b: rgb[2]};
  }
  _$jscoverage['/color.js'].lineData[464]++;
  function parseHex(v) {
    _$jscoverage['/color.js'].functionData[28]++;
    _$jscoverage['/color.js'].lineData[465]++;
    return parseInt(v, 16);
  }
  _$jscoverage['/color.js'].lineData[468]++;
  function paddingHex(v) {
    _$jscoverage['/color.js'].functionData[29]++;
    _$jscoverage['/color.js'].lineData[469]++;
    return v + v * 16;
  }
  _$jscoverage['/color.js'].lineData[472]++;
  function padding2(v) {
    _$jscoverage['/color.js'].functionData[30]++;
    _$jscoverage['/color.js'].lineData[473]++;
    if (visit28_473_1(v.length != 2)) {
      _$jscoverage['/color.js'].lineData[474]++;
      v = "0" + v;
    }
    _$jscoverage['/color.js'].lineData[476]++;
    return v;
  }
  _$jscoverage['/color.js'].lineData[479]++;
  function percentage(v) {
    _$jscoverage['/color.js'].functionData[31]++;
    _$jscoverage['/color.js'].lineData[480]++;
    return Math.round(v * 100) + "%";
  }
  _$jscoverage['/color.js'].lineData[483]++;
  function constrain255(v) {
    _$jscoverage['/color.js'].functionData[32]++;
    _$jscoverage['/color.js'].lineData[484]++;
    return Math.max(0, Math.min(v, 255));
  }
  _$jscoverage['/color.js'].lineData[487]++;
  function constrain1(v) {
    _$jscoverage['/color.js'].functionData[33]++;
    _$jscoverage['/color.js'].lineData[488]++;
    return Math.max(0, Math.min(v, 1));
  }
  _$jscoverage['/color.js'].lineData[494]++;
  return Color;
}, {
  requires: ['base']});
