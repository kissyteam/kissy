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
if (! _$jscoverage['/promise.js']) {
  _$jscoverage['/promise.js'] = {};
  _$jscoverage['/promise.js'].lineData = [];
  _$jscoverage['/promise.js'].lineData[6] = 0;
  _$jscoverage['/promise.js'].lineData[7] = 0;
  _$jscoverage['/promise.js'].lineData[13] = 0;
  _$jscoverage['/promise.js'].lineData[14] = 0;
  _$jscoverage['/promise.js'].lineData[15] = 0;
  _$jscoverage['/promise.js'].lineData[24] = 0;
  _$jscoverage['/promise.js'].lineData[26] = 0;
  _$jscoverage['/promise.js'].lineData[28] = 0;
  _$jscoverage['/promise.js'].lineData[29] = 0;
  _$jscoverage['/promise.js'].lineData[32] = 0;
  _$jscoverage['/promise.js'].lineData[37] = 0;
  _$jscoverage['/promise.js'].lineData[38] = 0;
  _$jscoverage['/promise.js'].lineData[41] = 0;
  _$jscoverage['/promise.js'].lineData[42] = 0;
  _$jscoverage['/promise.js'].lineData[48] = 0;
  _$jscoverage['/promise.js'].lineData[49] = 0;
  _$jscoverage['/promise.js'].lineData[50] = 0;
  _$jscoverage['/promise.js'].lineData[61] = 0;
  _$jscoverage['/promise.js'].lineData[62] = 0;
  _$jscoverage['/promise.js'].lineData[63] = 0;
  _$jscoverage['/promise.js'].lineData[64] = 0;
  _$jscoverage['/promise.js'].lineData[72] = 0;
  _$jscoverage['/promise.js'].lineData[75] = 0;
  _$jscoverage['/promise.js'].lineData[84] = 0;
  _$jscoverage['/promise.js'].lineData[86] = 0;
  _$jscoverage['/promise.js'].lineData[87] = 0;
  _$jscoverage['/promise.js'].lineData[91] = 0;
  _$jscoverage['/promise.js'].lineData[92] = 0;
  _$jscoverage['/promise.js'].lineData[93] = 0;
  _$jscoverage['/promise.js'].lineData[94] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[98] = 0;
  _$jscoverage['/promise.js'].lineData[106] = 0;
  _$jscoverage['/promise.js'].lineData[113] = 0;
  _$jscoverage['/promise.js'].lineData[114] = 0;
  _$jscoverage['/promise.js'].lineData[115] = 0;
  _$jscoverage['/promise.js'].lineData[121] = 0;
  _$jscoverage['/promise.js'].lineData[122] = 0;
  _$jscoverage['/promise.js'].lineData[132] = 0;
  _$jscoverage['/promise.js'].lineData[133] = 0;
  _$jscoverage['/promise.js'].lineData[135] = 0;
  _$jscoverage['/promise.js'].lineData[136] = 0;
  _$jscoverage['/promise.js'].lineData[138] = 0;
  _$jscoverage['/promise.js'].lineData[139] = 0;
  _$jscoverage['/promise.js'].lineData[143] = 0;
  _$jscoverage['/promise.js'].lineData[156] = 0;
  _$jscoverage['/promise.js'].lineData[157] = 0;
  _$jscoverage['/promise.js'].lineData[159] = 0;
  _$jscoverage['/promise.js'].lineData[166] = 0;
  _$jscoverage['/promise.js'].lineData[167] = 0;
  _$jscoverage['/promise.js'].lineData[169] = 0;
  _$jscoverage['/promise.js'].lineData[177] = 0;
  _$jscoverage['/promise.js'].lineData[186] = 0;
  _$jscoverage['/promise.js'].lineData[187] = 0;
  _$jscoverage['/promise.js'].lineData[189] = 0;
  _$jscoverage['/promise.js'].lineData[205] = 0;
  _$jscoverage['/promise.js'].lineData[207] = 0;
  _$jscoverage['/promise.js'].lineData[208] = 0;
  _$jscoverage['/promise.js'].lineData[214] = 0;
  _$jscoverage['/promise.js'].lineData[224] = 0;
  _$jscoverage['/promise.js'].lineData[230] = 0;
  _$jscoverage['/promise.js'].lineData[241] = 0;
  _$jscoverage['/promise.js'].lineData[242] = 0;
  _$jscoverage['/promise.js'].lineData[243] = 0;
  _$jscoverage['/promise.js'].lineData[245] = 0;
  _$jscoverage['/promise.js'].lineData[246] = 0;
  _$jscoverage['/promise.js'].lineData[247] = 0;
  _$jscoverage['/promise.js'].lineData[248] = 0;
  _$jscoverage['/promise.js'].lineData[250] = 0;
  _$jscoverage['/promise.js'].lineData[253] = 0;
  _$jscoverage['/promise.js'].lineData[257] = 0;
  _$jscoverage['/promise.js'].lineData[258] = 0;
  _$jscoverage['/promise.js'].lineData[262] = 0;
  _$jscoverage['/promise.js'].lineData[263] = 0;
  _$jscoverage['/promise.js'].lineData[264] = 0;
  _$jscoverage['/promise.js'].lineData[271] = 0;
  _$jscoverage['/promise.js'].lineData[272] = 0;
  _$jscoverage['/promise.js'].lineData[276] = 0;
  _$jscoverage['/promise.js'].lineData[277] = 0;
  _$jscoverage['/promise.js'].lineData[278] = 0;
  _$jscoverage['/promise.js'].lineData[285] = 0;
  _$jscoverage['/promise.js'].lineData[286] = 0;
  _$jscoverage['/promise.js'].lineData[290] = 0;
  _$jscoverage['/promise.js'].lineData[291] = 0;
  _$jscoverage['/promise.js'].lineData[292] = 0;
  _$jscoverage['/promise.js'].lineData[293] = 0;
  _$jscoverage['/promise.js'].lineData[295] = 0;
  _$jscoverage['/promise.js'].lineData[296] = 0;
  _$jscoverage['/promise.js'].lineData[297] = 0;
  _$jscoverage['/promise.js'].lineData[299] = 0;
  _$jscoverage['/promise.js'].lineData[300] = 0;
  _$jscoverage['/promise.js'].lineData[303] = 0;
  _$jscoverage['/promise.js'].lineData[304] = 0;
  _$jscoverage['/promise.js'].lineData[305] = 0;
  _$jscoverage['/promise.js'].lineData[306] = 0;
  _$jscoverage['/promise.js'].lineData[307] = 0;
  _$jscoverage['/promise.js'].lineData[309] = 0;
  _$jscoverage['/promise.js'].lineData[311] = 0;
  _$jscoverage['/promise.js'].lineData[314] = 0;
  _$jscoverage['/promise.js'].lineData[319] = 0;
  _$jscoverage['/promise.js'].lineData[322] = 0;
  _$jscoverage['/promise.js'].lineData[324] = 0;
  _$jscoverage['/promise.js'].lineData[338] = 0;
  _$jscoverage['/promise.js'].lineData[339] = 0;
  _$jscoverage['/promise.js'].lineData[344] = 0;
  _$jscoverage['/promise.js'].lineData[345] = 0;
  _$jscoverage['/promise.js'].lineData[346] = 0;
  _$jscoverage['/promise.js'].lineData[348] = 0;
  _$jscoverage['/promise.js'].lineData[420] = 0;
  _$jscoverage['/promise.js'].lineData[421] = 0;
  _$jscoverage['/promise.js'].lineData[422] = 0;
  _$jscoverage['/promise.js'].lineData[424] = 0;
  _$jscoverage['/promise.js'].lineData[425] = 0;
  _$jscoverage['/promise.js'].lineData[426] = 0;
  _$jscoverage['/promise.js'].lineData[427] = 0;
  _$jscoverage['/promise.js'].lineData[428] = 0;
  _$jscoverage['/promise.js'].lineData[429] = 0;
  _$jscoverage['/promise.js'].lineData[432] = 0;
  _$jscoverage['/promise.js'].lineData[437] = 0;
  _$jscoverage['/promise.js'].lineData[441] = 0;
  _$jscoverage['/promise.js'].lineData[449] = 0;
  _$jscoverage['/promise.js'].lineData[450] = 0;
  _$jscoverage['/promise.js'].lineData[452] = 0;
  _$jscoverage['/promise.js'].lineData[453] = 0;
  _$jscoverage['/promise.js'].lineData[455] = 0;
  _$jscoverage['/promise.js'].lineData[456] = 0;
  _$jscoverage['/promise.js'].lineData[458] = 0;
  _$jscoverage['/promise.js'].lineData[460] = 0;
  _$jscoverage['/promise.js'].lineData[461] = 0;
  _$jscoverage['/promise.js'].lineData[463] = 0;
  _$jscoverage['/promise.js'].lineData[466] = 0;
  _$jscoverage['/promise.js'].lineData[467] = 0;
  _$jscoverage['/promise.js'].lineData[470] = 0;
  _$jscoverage['/promise.js'].lineData[471] = 0;
  _$jscoverage['/promise.js'].lineData[474] = 0;
}
if (! _$jscoverage['/promise.js'].functionData) {
  _$jscoverage['/promise.js'].functionData = [];
  _$jscoverage['/promise.js'].functionData[0] = 0;
  _$jscoverage['/promise.js'].functionData[1] = 0;
  _$jscoverage['/promise.js'].functionData[2] = 0;
  _$jscoverage['/promise.js'].functionData[3] = 0;
  _$jscoverage['/promise.js'].functionData[4] = 0;
  _$jscoverage['/promise.js'].functionData[5] = 0;
  _$jscoverage['/promise.js'].functionData[6] = 0;
  _$jscoverage['/promise.js'].functionData[7] = 0;
  _$jscoverage['/promise.js'].functionData[8] = 0;
  _$jscoverage['/promise.js'].functionData[9] = 0;
  _$jscoverage['/promise.js'].functionData[10] = 0;
  _$jscoverage['/promise.js'].functionData[11] = 0;
  _$jscoverage['/promise.js'].functionData[12] = 0;
  _$jscoverage['/promise.js'].functionData[13] = 0;
  _$jscoverage['/promise.js'].functionData[14] = 0;
  _$jscoverage['/promise.js'].functionData[15] = 0;
  _$jscoverage['/promise.js'].functionData[16] = 0;
  _$jscoverage['/promise.js'].functionData[17] = 0;
  _$jscoverage['/promise.js'].functionData[18] = 0;
  _$jscoverage['/promise.js'].functionData[19] = 0;
  _$jscoverage['/promise.js'].functionData[20] = 0;
  _$jscoverage['/promise.js'].functionData[21] = 0;
  _$jscoverage['/promise.js'].functionData[22] = 0;
  _$jscoverage['/promise.js'].functionData[23] = 0;
  _$jscoverage['/promise.js'].functionData[24] = 0;
  _$jscoverage['/promise.js'].functionData[25] = 0;
  _$jscoverage['/promise.js'].functionData[26] = 0;
  _$jscoverage['/promise.js'].functionData[27] = 0;
  _$jscoverage['/promise.js'].functionData[28] = 0;
  _$jscoverage['/promise.js'].functionData[29] = 0;
  _$jscoverage['/promise.js'].functionData[30] = 0;
  _$jscoverage['/promise.js'].functionData[31] = 0;
  _$jscoverage['/promise.js'].functionData[32] = 0;
  _$jscoverage['/promise.js'].functionData[33] = 0;
  _$jscoverage['/promise.js'].functionData[34] = 0;
  _$jscoverage['/promise.js'].functionData[35] = 0;
  _$jscoverage['/promise.js'].functionData[36] = 0;
  _$jscoverage['/promise.js'].functionData[37] = 0;
  _$jscoverage['/promise.js'].functionData[38] = 0;
  _$jscoverage['/promise.js'].functionData[39] = 0;
  _$jscoverage['/promise.js'].functionData[40] = 0;
  _$jscoverage['/promise.js'].functionData[41] = 0;
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['14'] = [];
  _$jscoverage['/promise.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['26'] = [];
  _$jscoverage['/promise.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['37'] = [];
  _$jscoverage['/promise.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['41'] = [];
  _$jscoverage['/promise.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['48'] = [];
  _$jscoverage['/promise.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['63'] = [];
  _$jscoverage['/promise.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['72'] = [];
  _$jscoverage['/promise.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['86'] = [];
  _$jscoverage['/promise.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['122'] = [];
  _$jscoverage['/promise.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['136'] = [];
  _$jscoverage['/promise.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['156'] = [];
  _$jscoverage['/promise.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['166'] = [];
  _$jscoverage['/promise.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['211'] = [];
  _$jscoverage['/promise.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['242'] = [];
  _$jscoverage['/promise.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['247'] = [];
  _$jscoverage['/promise.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['271'] = [];
  _$jscoverage['/promise.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['285'] = [];
  _$jscoverage['/promise.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['291'] = [];
  _$jscoverage['/promise.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['295'] = [];
  _$jscoverage['/promise.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['303'] = [];
  _$jscoverage['/promise.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['305'] = [];
  _$jscoverage['/promise.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['324'] = [];
  _$jscoverage['/promise.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['325'] = [];
  _$jscoverage['/promise.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['327'] = [];
  _$jscoverage['/promise.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['327'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['331'] = [];
  _$jscoverage['/promise.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['339'] = [];
  _$jscoverage['/promise.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['340'] = [];
  _$jscoverage['/promise.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['421'] = [];
  _$jscoverage['/promise.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['425'] = [];
  _$jscoverage['/promise.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['429'] = [];
  _$jscoverage['/promise.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['460'] = [];
  _$jscoverage['/promise.js'].branchData['460'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['460'][1].init(296, 11, 'result.done');
function visit574_460_1(result) {
  _$jscoverage['/promise.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['429'][1].init(76, 13, '--count === 0');
function visit573_429_1(result) {
  _$jscoverage['/promise.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['425'][1].init(178, 19, 'i < promises.length');
function visit572_425_1(result) {
  _$jscoverage['/promise.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['421'][1].init(60, 6, '!count');
function visit571_421_1(result) {
  _$jscoverage['/promise.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['340'][2].init(51, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit570_340_2(result) {
  _$jscoverage['/promise.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['340'][1].init(31, 91, '(obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit569_340_1(result) {
  _$jscoverage['/promise.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['339'][1].init(17, 123, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit568_339_1(result) {
  _$jscoverage['/promise.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['331'][1].init(-1, 206, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit567_331_1(result) {
  _$jscoverage['/promise.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['327'][2].init(154, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit566_327_2(result) {
  _$jscoverage['/promise.js'].branchData['327'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['327'][1].init(64, 405, '(obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit565_327_1(result) {
  _$jscoverage['/promise.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['325'][1].init(32, 470, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit564_325_1(result) {
  _$jscoverage['/promise.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['324'][1].init(53, 503, '!isRejected(obj) && isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit563_324_1(result) {
  _$jscoverage['/promise.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['305'][1].init(22, 4, 'done');
function visit562_305_1(result) {
  _$jscoverage['/promise.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['303'][1].init(1424, 25, 'value instanceof Promise');
function visit561_303_1(result) {
  _$jscoverage['/promise.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['295'][1].init(143, 24, 'value instanceof Promise');
function visit560_295_1(result) {
  _$jscoverage['/promise.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['291'][1].init(18, 4, 'done');
function visit559_291_1(result) {
  _$jscoverage['/promise.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['285'][1].init(83, 12, 'e.stack || e');
function visit558_285_1(result) {
  _$jscoverage['/promise.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['271'][1].init(168, 12, 'e.stack || e');
function visit557_271_1(result) {
  _$jscoverage['/promise.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['247'][1].init(161, 38, 'self[PROMISE_VALUE] instanceof Promise');
function visit556_247_1(result) {
  _$jscoverage['/promise.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['242'][1].init(14, 24, 'reason instanceof Reject');
function visit555_242_1(result) {
  _$jscoverage['/promise.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['211'][1].init(230, 21, 'fulfilled || rejected');
function visit554_211_1(result) {
  _$jscoverage['/promise.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['166'][1].init(18, 32, 'this[PROMISE_PROGRESS_LISTENERS]');
function visit553_166_1(result) {
  _$jscoverage['/promise.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['156'][1].init(18, 16, 'progressListener');
function visit552_156_1(result) {
  _$jscoverage['/promise.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['136'][1].init(125, 15, 'v === undefined');
function visit551_136_1(result) {
  _$jscoverage['/promise.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['122'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit550_122_1(result) {
  _$jscoverage['/promise.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['86'][1].init(86, 39, '!(pendings = promise[PROMISE_PENDINGS])');
function visit549_86_1(result) {
  _$jscoverage['/promise.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['72'][1].init(344, 24, 'promise || new Promise()');
function visit548_72_1(result) {
  _$jscoverage['/promise.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['63'][1].init(40, 24, '!(self instanceof Defer)');
function visit547_63_1(result) {
  _$jscoverage['/promise.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['48'][1].init(208, 9, 'fulfilled');
function visit546_48_1(result) {
  _$jscoverage['/promise.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['41'][1].init(334, 12, 'isPromise(v)');
function visit545_41_1(result) {
  _$jscoverage['/promise.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['37'][1].init(186, 8, 'pendings');
function visit544_37_1(result) {
  _$jscoverage['/promise.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['26'][1].init(47, 25, 'promise instanceof Reject');
function visit543_26_1(result) {
  _$jscoverage['/promise.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['14'][2].init(14, 30, 'typeof console !== \'undefined\'');
function visit542_14_2(result) {
  _$jscoverage['/promise.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['14'][1].init(14, 47, 'typeof console !== \'undefined\' && console.error');
function visit541_14_1(result) {
  _$jscoverage['/promise.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var PROMISE_VALUE = '__promise_value', processImmediate = S.setImmediate, logger = S.getLogger('s/promise'), PROMISE_PROGRESS_LISTENERS = '__promise_progress_listeners', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[13]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[14]++;
    if (visit541_14_1(visit542_14_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[15]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[24]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[26]++;
    if (visit543_26_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[28]++;
      processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[3]++;
  _$jscoverage['/promise.js'].lineData[29]++;
  rejected(promise[PROMISE_VALUE]);
});
    } else {
      _$jscoverage['/promise.js'].lineData[32]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[37]++;
      if (visit544_37_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[38]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[41]++;
        if (visit545_41_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[42]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[48]++;
          if (visit546_48_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[49]++;
            processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[50]++;
  fulfilled(v);
});
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[61]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[5]++;
    _$jscoverage['/promise.js'].lineData[62]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[63]++;
    if (visit547_63_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[64]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[72]++;
    self.promise = visit548_72_1(promise || new Promise());
  }
  _$jscoverage['/promise.js'].lineData[75]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[84]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[86]++;
  if (visit549_86_1(!(pendings = promise[PROMISE_PENDINGS]))) {
    _$jscoverage['/promise.js'].lineData[87]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[91]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[92]++;
  pendings = [].concat(pendings);
  _$jscoverage['/promise.js'].lineData[93]++;
  promise[PROMISE_PENDINGS] = undefined;
  _$jscoverage['/promise.js'].lineData[94]++;
  promise[PROMISE_PROGRESS_LISTENERS] = undefined;
  _$jscoverage['/promise.js'].lineData[95]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[96]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[98]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[106]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[9]++;
  _$jscoverage['/promise.js'].lineData[113]++;
  S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[10]++;
  _$jscoverage['/promise.js'].lineData[114]++;
  processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[115]++;
  listener(message);
});
});
}};
  _$jscoverage['/promise.js'].lineData[121]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[122]++;
    return visit550_122_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[132]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[13]++;
    _$jscoverage['/promise.js'].lineData[133]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[135]++;
    self[PROMISE_VALUE] = v;
    _$jscoverage['/promise.js'].lineData[136]++;
    if (visit551_136_1(v === undefined)) {
      _$jscoverage['/promise.js'].lineData[138]++;
      self[PROMISE_PENDINGS] = [];
      _$jscoverage['/promise.js'].lineData[139]++;
      self[PROMISE_PROGRESS_LISTENERS] = [];
    }
  }
  _$jscoverage['/promise.js'].lineData[143]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[156]++;
  if (visit552_156_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[157]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[159]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[166]++;
  if (visit553_166_1(this[PROMISE_PROGRESS_LISTENERS])) {
    _$jscoverage['/promise.js'].lineData[167]++;
    this[PROMISE_PROGRESS_LISTENERS].push(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[169]++;
  return this;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[177]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[186]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[187]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[189]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[205]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[207]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[208]++;
  throw e;
}, 0);
}, promiseToHandle = visit554_211_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[214]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[224]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[24]++;
  _$jscoverage['/promise.js'].lineData[230]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[241]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[25]++;
    _$jscoverage['/promise.js'].lineData[242]++;
    if (visit555_242_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[243]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[245]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[246]++;
    Promise.apply(self, arguments);
    _$jscoverage['/promise.js'].lineData[247]++;
    if (visit556_247_1(self[PROMISE_VALUE] instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[248]++;
      logger.error('assert.not(this.__promise_value instanceof promise) in Reject constructor');
    }
    _$jscoverage['/promise.js'].lineData[250]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[253]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[257]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[26]++;
    _$jscoverage['/promise.js'].lineData[258]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[262]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[27]++;
      _$jscoverage['/promise.js'].lineData[263]++;
      try {
        _$jscoverage['/promise.js'].lineData[264]++;
        return fulfilled ? fulfilled(value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[271]++;
  logError(visit557_271_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[272]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[276]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[28]++;
      _$jscoverage['/promise.js'].lineData[277]++;
      try {
        _$jscoverage['/promise.js'].lineData[278]++;
        return rejected ? rejected(reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[285]++;
  logError(visit558_285_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[286]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[290]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[29]++;
      _$jscoverage['/promise.js'].lineData[291]++;
      if (visit559_291_1(done)) {
        _$jscoverage['/promise.js'].lineData[292]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[293]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[295]++;
      if (visit560_295_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[296]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[297]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[299]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[300]++;
      defer.resolve(_fulfilled(value));
    }
    _$jscoverage['/promise.js'].lineData[303]++;
    if (visit561_303_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[304]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[30]++;
  _$jscoverage['/promise.js'].lineData[305]++;
  if (visit562_305_1(done)) {
    _$jscoverage['/promise.js'].lineData[306]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[307]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[309]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[311]++;
  defer.resolve(_rejected(reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[314]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[319]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[322]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[31]++;
    _$jscoverage['/promise.js'].lineData[324]++;
    return visit563_324_1(!isRejected(obj) && visit564_325_1(isPromise(obj) && visit565_327_1((visit566_327_2(obj[PROMISE_PENDINGS] === undefined)) && (visit567_331_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[338]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[32]++;
    _$jscoverage['/promise.js'].lineData[339]++;
    return visit568_339_1(isPromise(obj) && visit569_340_1((visit570_340_2(obj[PROMISE_PENDINGS] === undefined)) && (obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[344]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[345]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[346]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[348]++;
  S.mix(Promise, {
  when: when, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[33]++;
  _$jscoverage['/promise.js'].lineData[420]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[421]++;
  if (visit571_421_1(!count)) {
    _$jscoverage['/promise.js'].lineData[422]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[424]++;
  var defer = Defer();
  _$jscoverage['/promise.js'].lineData[425]++;
  for (var i = 0; visit572_425_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[426]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[34]++;
  _$jscoverage['/promise.js'].lineData[427]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[428]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[429]++;
  if (visit573_429_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[432]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[437]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[441]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[449]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[450]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[452]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[39]++;
    _$jscoverage['/promise.js'].lineData[453]++;
    var result;
    _$jscoverage['/promise.js'].lineData[455]++;
    try {
      _$jscoverage['/promise.js'].lineData[456]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[458]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[460]++;
    if (visit574_460_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[461]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[463]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[466]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[40]++;
    _$jscoverage['/promise.js'].lineData[467]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[470]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[41]++;
    _$jscoverage['/promise.js'].lineData[471]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[474]++;
  return next();
};
}});
})(KISSY);
