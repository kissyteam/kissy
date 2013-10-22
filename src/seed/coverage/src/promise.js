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
  _$jscoverage['/promise.js'].lineData[73] = 0;
  _$jscoverage['/promise.js'].lineData[76] = 0;
  _$jscoverage['/promise.js'].lineData[85] = 0;
  _$jscoverage['/promise.js'].lineData[87] = 0;
  _$jscoverage['/promise.js'].lineData[88] = 0;
  _$jscoverage['/promise.js'].lineData[92] = 0;
  _$jscoverage['/promise.js'].lineData[93] = 0;
  _$jscoverage['/promise.js'].lineData[94] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[97] = 0;
  _$jscoverage['/promise.js'].lineData[99] = 0;
  _$jscoverage['/promise.js'].lineData[107] = 0;
  _$jscoverage['/promise.js'].lineData[114] = 0;
  _$jscoverage['/promise.js'].lineData[115] = 0;
  _$jscoverage['/promise.js'].lineData[116] = 0;
  _$jscoverage['/promise.js'].lineData[122] = 0;
  _$jscoverage['/promise.js'].lineData[123] = 0;
  _$jscoverage['/promise.js'].lineData[133] = 0;
  _$jscoverage['/promise.js'].lineData[134] = 0;
  _$jscoverage['/promise.js'].lineData[136] = 0;
  _$jscoverage['/promise.js'].lineData[137] = 0;
  _$jscoverage['/promise.js'].lineData[139] = 0;
  _$jscoverage['/promise.js'].lineData[140] = 0;
  _$jscoverage['/promise.js'].lineData[144] = 0;
  _$jscoverage['/promise.js'].lineData[157] = 0;
  _$jscoverage['/promise.js'].lineData[158] = 0;
  _$jscoverage['/promise.js'].lineData[160] = 0;
  _$jscoverage['/promise.js'].lineData[167] = 0;
  _$jscoverage['/promise.js'].lineData[168] = 0;
  _$jscoverage['/promise.js'].lineData[170] = 0;
  _$jscoverage['/promise.js'].lineData[178] = 0;
  _$jscoverage['/promise.js'].lineData[187] = 0;
  _$jscoverage['/promise.js'].lineData[188] = 0;
  _$jscoverage['/promise.js'].lineData[190] = 0;
  _$jscoverage['/promise.js'].lineData[206] = 0;
  _$jscoverage['/promise.js'].lineData[208] = 0;
  _$jscoverage['/promise.js'].lineData[209] = 0;
  _$jscoverage['/promise.js'].lineData[215] = 0;
  _$jscoverage['/promise.js'].lineData[225] = 0;
  _$jscoverage['/promise.js'].lineData[231] = 0;
  _$jscoverage['/promise.js'].lineData[242] = 0;
  _$jscoverage['/promise.js'].lineData[243] = 0;
  _$jscoverage['/promise.js'].lineData[244] = 0;
  _$jscoverage['/promise.js'].lineData[246] = 0;
  _$jscoverage['/promise.js'].lineData[247] = 0;
  _$jscoverage['/promise.js'].lineData[248] = 0;
  _$jscoverage['/promise.js'].lineData[249] = 0;
  _$jscoverage['/promise.js'].lineData[251] = 0;
  _$jscoverage['/promise.js'].lineData[254] = 0;
  _$jscoverage['/promise.js'].lineData[258] = 0;
  _$jscoverage['/promise.js'].lineData[259] = 0;
  _$jscoverage['/promise.js'].lineData[263] = 0;
  _$jscoverage['/promise.js'].lineData[264] = 0;
  _$jscoverage['/promise.js'].lineData[265] = 0;
  _$jscoverage['/promise.js'].lineData[272] = 0;
  _$jscoverage['/promise.js'].lineData[273] = 0;
  _$jscoverage['/promise.js'].lineData[277] = 0;
  _$jscoverage['/promise.js'].lineData[278] = 0;
  _$jscoverage['/promise.js'].lineData[279] = 0;
  _$jscoverage['/promise.js'].lineData[286] = 0;
  _$jscoverage['/promise.js'].lineData[287] = 0;
  _$jscoverage['/promise.js'].lineData[291] = 0;
  _$jscoverage['/promise.js'].lineData[292] = 0;
  _$jscoverage['/promise.js'].lineData[293] = 0;
  _$jscoverage['/promise.js'].lineData[294] = 0;
  _$jscoverage['/promise.js'].lineData[296] = 0;
  _$jscoverage['/promise.js'].lineData[297] = 0;
  _$jscoverage['/promise.js'].lineData[298] = 0;
  _$jscoverage['/promise.js'].lineData[300] = 0;
  _$jscoverage['/promise.js'].lineData[301] = 0;
  _$jscoverage['/promise.js'].lineData[304] = 0;
  _$jscoverage['/promise.js'].lineData[305] = 0;
  _$jscoverage['/promise.js'].lineData[306] = 0;
  _$jscoverage['/promise.js'].lineData[307] = 0;
  _$jscoverage['/promise.js'].lineData[308] = 0;
  _$jscoverage['/promise.js'].lineData[310] = 0;
  _$jscoverage['/promise.js'].lineData[312] = 0;
  _$jscoverage['/promise.js'].lineData[315] = 0;
  _$jscoverage['/promise.js'].lineData[320] = 0;
  _$jscoverage['/promise.js'].lineData[323] = 0;
  _$jscoverage['/promise.js'].lineData[325] = 0;
  _$jscoverage['/promise.js'].lineData[339] = 0;
  _$jscoverage['/promise.js'].lineData[340] = 0;
  _$jscoverage['/promise.js'].lineData[345] = 0;
  _$jscoverage['/promise.js'].lineData[346] = 0;
  _$jscoverage['/promise.js'].lineData[347] = 0;
  _$jscoverage['/promise.js'].lineData[349] = 0;
  _$jscoverage['/promise.js'].lineData[421] = 0;
  _$jscoverage['/promise.js'].lineData[422] = 0;
  _$jscoverage['/promise.js'].lineData[423] = 0;
  _$jscoverage['/promise.js'].lineData[425] = 0;
  _$jscoverage['/promise.js'].lineData[426] = 0;
  _$jscoverage['/promise.js'].lineData[427] = 0;
  _$jscoverage['/promise.js'].lineData[428] = 0;
  _$jscoverage['/promise.js'].lineData[429] = 0;
  _$jscoverage['/promise.js'].lineData[430] = 0;
  _$jscoverage['/promise.js'].lineData[433] = 0;
  _$jscoverage['/promise.js'].lineData[438] = 0;
  _$jscoverage['/promise.js'].lineData[442] = 0;
  _$jscoverage['/promise.js'].lineData[450] = 0;
  _$jscoverage['/promise.js'].lineData[451] = 0;
  _$jscoverage['/promise.js'].lineData[453] = 0;
  _$jscoverage['/promise.js'].lineData[454] = 0;
  _$jscoverage['/promise.js'].lineData[456] = 0;
  _$jscoverage['/promise.js'].lineData[457] = 0;
  _$jscoverage['/promise.js'].lineData[459] = 0;
  _$jscoverage['/promise.js'].lineData[461] = 0;
  _$jscoverage['/promise.js'].lineData[462] = 0;
  _$jscoverage['/promise.js'].lineData[464] = 0;
  _$jscoverage['/promise.js'].lineData[467] = 0;
  _$jscoverage['/promise.js'].lineData[468] = 0;
  _$jscoverage['/promise.js'].lineData[471] = 0;
  _$jscoverage['/promise.js'].lineData[472] = 0;
  _$jscoverage['/promise.js'].lineData[475] = 0;
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
  _$jscoverage['/promise.js'].branchData['87'] = [];
  _$jscoverage['/promise.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['123'] = [];
  _$jscoverage['/promise.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['137'] = [];
  _$jscoverage['/promise.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['157'] = [];
  _$jscoverage['/promise.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['167'] = [];
  _$jscoverage['/promise.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['212'] = [];
  _$jscoverage['/promise.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['243'] = [];
  _$jscoverage['/promise.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['248'] = [];
  _$jscoverage['/promise.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['272'] = [];
  _$jscoverage['/promise.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['286'] = [];
  _$jscoverage['/promise.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['292'] = [];
  _$jscoverage['/promise.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['296'] = [];
  _$jscoverage['/promise.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['304'] = [];
  _$jscoverage['/promise.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['306'] = [];
  _$jscoverage['/promise.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['325'] = [];
  _$jscoverage['/promise.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['326'] = [];
  _$jscoverage['/promise.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['328'] = [];
  _$jscoverage['/promise.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['328'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['332'] = [];
  _$jscoverage['/promise.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['340'] = [];
  _$jscoverage['/promise.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['341'] = [];
  _$jscoverage['/promise.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['341'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['422'] = [];
  _$jscoverage['/promise.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['426'] = [];
  _$jscoverage['/promise.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['430'] = [];
  _$jscoverage['/promise.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['461'] = [];
  _$jscoverage['/promise.js'].branchData['461'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['461'][1].init(296, 11, 'result.done');
function visit574_461_1(result) {
  _$jscoverage['/promise.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['430'][1].init(76, 13, '--count === 0');
function visit573_430_1(result) {
  _$jscoverage['/promise.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['426'][1].init(178, 19, 'i < promises.length');
function visit572_426_1(result) {
  _$jscoverage['/promise.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['422'][1].init(60, 6, '!count');
function visit571_422_1(result) {
  _$jscoverage['/promise.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['341'][2].init(51, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit570_341_2(result) {
  _$jscoverage['/promise.js'].branchData['341'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['341'][1].init(31, 91, '(obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit569_341_1(result) {
  _$jscoverage['/promise.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['340'][1].init(17, 123, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit568_340_1(result) {
  _$jscoverage['/promise.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['332'][1].init(-1, 206, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit567_332_1(result) {
  _$jscoverage['/promise.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['328'][2].init(154, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit566_328_2(result) {
  _$jscoverage['/promise.js'].branchData['328'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['328'][1].init(64, 405, '(obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit565_328_1(result) {
  _$jscoverage['/promise.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['326'][1].init(32, 470, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit564_326_1(result) {
  _$jscoverage['/promise.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['325'][1].init(53, 503, '!isRejected(obj) && isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit563_325_1(result) {
  _$jscoverage['/promise.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['306'][1].init(22, 4, 'done');
function visit562_306_1(result) {
  _$jscoverage['/promise.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['304'][1].init(1457, 25, 'value instanceof Promise');
function visit561_304_1(result) {
  _$jscoverage['/promise.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['296'][1].init(143, 24, 'value instanceof Promise');
function visit560_296_1(result) {
  _$jscoverage['/promise.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['292'][1].init(18, 4, 'done');
function visit559_292_1(result) {
  _$jscoverage['/promise.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['286'][1].init(83, 12, 'e.stack || e');
function visit558_286_1(result) {
  _$jscoverage['/promise.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['272'][1].init(168, 12, 'e.stack || e');
function visit557_272_1(result) {
  _$jscoverage['/promise.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['248'][1].init(161, 38, 'self[PROMISE_VALUE] instanceof Promise');
function visit556_248_1(result) {
  _$jscoverage['/promise.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['243'][1].init(14, 24, 'reason instanceof Reject');
function visit555_243_1(result) {
  _$jscoverage['/promise.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['212'][1].init(230, 21, 'fulfilled || rejected');
function visit554_212_1(result) {
  _$jscoverage['/promise.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['167'][1].init(18, 32, 'this[PROMISE_PROGRESS_LISTENERS]');
function visit553_167_1(result) {
  _$jscoverage['/promise.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['157'][1].init(18, 16, 'progressListener');
function visit552_157_1(result) {
  _$jscoverage['/promise.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['137'][1].init(125, 15, 'v === undefined');
function visit551_137_1(result) {
  _$jscoverage['/promise.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['123'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit550_123_1(result) {
  _$jscoverage['/promise.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['87'][1].init(86, 39, '!(pendings = promise[PROMISE_PENDINGS])');
function visit549_87_1(result) {
  _$jscoverage['/promise.js'].branchData['87'][1].ranCondition(result);
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
  rejected.call(promise, promise[PROMISE_VALUE]);
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
  fulfilled.call(promise, v);
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
    _$jscoverage['/promise.js'].lineData[73]++;
    self.promise.defer = self;
  }
  _$jscoverage['/promise.js'].lineData[76]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[85]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[87]++;
  if (visit549_87_1(!(pendings = promise[PROMISE_PENDINGS]))) {
    _$jscoverage['/promise.js'].lineData[88]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[92]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[93]++;
  pendings = [].concat(pendings);
  _$jscoverage['/promise.js'].lineData[94]++;
  promise[PROMISE_PENDINGS] = undefined;
  _$jscoverage['/promise.js'].lineData[95]++;
  promise[PROMISE_PROGRESS_LISTENERS] = undefined;
  _$jscoverage['/promise.js'].lineData[96]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[97]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[99]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[107]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[9]++;
  _$jscoverage['/promise.js'].lineData[114]++;
  S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[10]++;
  _$jscoverage['/promise.js'].lineData[115]++;
  processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[116]++;
  listener(message);
});
});
}};
  _$jscoverage['/promise.js'].lineData[122]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[123]++;
    return visit550_123_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[133]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[13]++;
    _$jscoverage['/promise.js'].lineData[134]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[136]++;
    self[PROMISE_VALUE] = v;
    _$jscoverage['/promise.js'].lineData[137]++;
    if (visit551_137_1(v === undefined)) {
      _$jscoverage['/promise.js'].lineData[139]++;
      self[PROMISE_PENDINGS] = [];
      _$jscoverage['/promise.js'].lineData[140]++;
      self[PROMISE_PROGRESS_LISTENERS] = [];
    }
  }
  _$jscoverage['/promise.js'].lineData[144]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[157]++;
  if (visit552_157_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[158]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[160]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[167]++;
  if (visit553_167_1(this[PROMISE_PROGRESS_LISTENERS])) {
    _$jscoverage['/promise.js'].lineData[168]++;
    this[PROMISE_PROGRESS_LISTENERS].push(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[170]++;
  return this;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[178]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[187]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[188]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[190]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[206]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[208]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[209]++;
  throw e;
}, 0);
}, promiseToHandle = visit554_212_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[215]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[225]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[24]++;
  _$jscoverage['/promise.js'].lineData[231]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[242]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[25]++;
    _$jscoverage['/promise.js'].lineData[243]++;
    if (visit555_243_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[244]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[246]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[247]++;
    Promise.apply(self, arguments);
    _$jscoverage['/promise.js'].lineData[248]++;
    if (visit556_248_1(self[PROMISE_VALUE] instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[249]++;
      logger.error('assert.not(this.__promise_value instanceof promise) in Reject constructor');
    }
    _$jscoverage['/promise.js'].lineData[251]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[254]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[258]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[26]++;
    _$jscoverage['/promise.js'].lineData[259]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[263]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[27]++;
      _$jscoverage['/promise.js'].lineData[264]++;
      try {
        _$jscoverage['/promise.js'].lineData[265]++;
        return fulfilled ? fulfilled.call(this, value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[272]++;
  logError(visit557_272_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[273]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[277]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[28]++;
      _$jscoverage['/promise.js'].lineData[278]++;
      try {
        _$jscoverage['/promise.js'].lineData[279]++;
        return rejected ? rejected.call(this, reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[286]++;
  logError(visit558_286_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[287]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[291]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[29]++;
      _$jscoverage['/promise.js'].lineData[292]++;
      if (visit559_292_1(done)) {
        _$jscoverage['/promise.js'].lineData[293]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[294]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[296]++;
      if (visit560_296_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[297]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[298]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[300]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[301]++;
      defer.resolve(_fulfilled.call(this, value));
    }
    _$jscoverage['/promise.js'].lineData[304]++;
    if (visit561_304_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[305]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[30]++;
  _$jscoverage['/promise.js'].lineData[306]++;
  if (visit562_306_1(done)) {
    _$jscoverage['/promise.js'].lineData[307]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[308]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[310]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[312]++;
  defer.resolve(_rejected.call(this, reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[315]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[320]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[323]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[31]++;
    _$jscoverage['/promise.js'].lineData[325]++;
    return visit563_325_1(!isRejected(obj) && visit564_326_1(isPromise(obj) && visit565_328_1((visit566_328_2(obj[PROMISE_PENDINGS] === undefined)) && (visit567_332_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[339]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[32]++;
    _$jscoverage['/promise.js'].lineData[340]++;
    return visit568_340_1(isPromise(obj) && visit569_341_1((visit570_341_2(obj[PROMISE_PENDINGS] === undefined)) && (obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[345]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[346]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[347]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[349]++;
  S.mix(Promise, {
  when: when, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[33]++;
  _$jscoverage['/promise.js'].lineData[421]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[422]++;
  if (visit571_422_1(!count)) {
    _$jscoverage['/promise.js'].lineData[423]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[425]++;
  var defer = Defer();
  _$jscoverage['/promise.js'].lineData[426]++;
  for (var i = 0; visit572_426_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[427]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[34]++;
  _$jscoverage['/promise.js'].lineData[428]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[429]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[430]++;
  if (visit573_430_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[433]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[438]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[442]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[450]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[451]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[453]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[39]++;
    _$jscoverage['/promise.js'].lineData[454]++;
    var result;
    _$jscoverage['/promise.js'].lineData[456]++;
    try {
      _$jscoverage['/promise.js'].lineData[457]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[459]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[461]++;
    if (visit574_461_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[462]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[464]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[467]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[40]++;
    _$jscoverage['/promise.js'].lineData[468]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[471]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[41]++;
    _$jscoverage['/promise.js'].lineData[472]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[475]++;
  return next();
};
}});
})(KISSY);
