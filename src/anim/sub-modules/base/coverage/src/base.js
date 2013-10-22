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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[43] = 0;
  _$jscoverage['/base.js'].lineData[46] = 0;
  _$jscoverage['/base.js'].lineData[47] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[285] = 0;
  _$jscoverage['/base.js'].lineData[286] = 0;
  _$jscoverage['/base.js'].lineData[289] = 0;
  _$jscoverage['/base.js'].lineData[290] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[294] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[314] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[324] = 0;
  _$jscoverage['/base.js'].lineData[325] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['30'] = [];
  _$jscoverage['/base.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['37'] = [];
  _$jscoverage['/base.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['46'] = [];
  _$jscoverage['/base.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['67'] = [];
  _$jscoverage['/base.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['73'] = [];
  _$jscoverage['/base.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['81'] = [];
  _$jscoverage['/base.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['96'] = [];
  _$jscoverage['/base.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['99'] = [];
  _$jscoverage['/base.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['112'] = [];
  _$jscoverage['/base.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['114'] = [];
  _$jscoverage['/base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['123'] = [];
  _$jscoverage['/base.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'] = [];
  _$jscoverage['/base.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['135'] = [];
  _$jscoverage['/base.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'] = [];
  _$jscoverage['/base.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['152'] = [];
  _$jscoverage['/base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['158'] = [];
  _$jscoverage['/base.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['192'] = [];
  _$jscoverage['/base.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'] = [];
  _$jscoverage['/base.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'] = [];
  _$jscoverage['/base.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['261'] = [];
  _$jscoverage['/base.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['266'] = [];
  _$jscoverage['/base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['285'] = [];
  _$jscoverage['/base.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['289'] = [];
  _$jscoverage['/base.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['294'] = [];
  _$jscoverage['/base.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['295'] = [];
  _$jscoverage['/base.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['307'] = [];
  _$jscoverage['/base.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['312'] = [];
  _$jscoverage['/base.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['315'] = [];
  _$jscoverage['/base.js'].branchData['315'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['315'][1].init(129, 9, 'q && q[0]');
function visit68_315_1(result) {
  _$jscoverage['/base.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['312'][1].init(920, 15, 'queue !== false');
function visit67_312_1(result) {
  _$jscoverage['/base.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['307'][1].init(801, 6, 'finish');
function visit66_307_1(result) {
  _$jscoverage['/base.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['295'][1].init(22, 15, 'queue !== false');
function visit65_295_1(result) {
  _$jscoverage['/base.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['294'][1].init(379, 37, '!self.isRunning() && !self.isPaused()');
function visit64_294_1(result) {
  _$jscoverage['/base.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['289'][1].init(231, 18, 'self.__waitTimeout');
function visit63_289_1(result) {
  _$jscoverage['/base.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['285'][1].init(149, 14, 'self.__stopped');
function visit62_285_1(result) {
  _$jscoverage['/base.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['266'][1].init(107, 13, 'q.length == 1');
function visit61_266_1(result) {
  _$jscoverage['/base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['261'][1].init(114, 15, 'queue === false');
function visit60_261_1(result) {
  _$jscoverage['/base.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][1].init(234, 18, 'self.__waitTimeout');
function visit59_232_1(result) {
  _$jscoverage['/base.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(48, 15, 'self.isPaused()');
function visit58_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][1].init(263, 18, 'self.__waitTimeout');
function visit57_198_1(result) {
  _$jscoverage['/base.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['192'][1].init(48, 16, 'self.isRunning()');
function visit56_192_1(result) {
  _$jscoverage['/base.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['158'][1].init(4051, 27, 'S.isEmptyObject(_propsData)');
function visit55_158_1(result) {
  _$jscoverage['/base.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['152'][1].init(2658, 14, 'exit === false');
function visit54_152_1(result) {
  _$jscoverage['/base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][1].init(562, 13, 'val == \'hide\'');
function visit53_138_1(result) {
  _$jscoverage['/base.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['135'][1].init(420, 15, 'val == \'toggle\'');
function visit52_135_1(result) {
  _$jscoverage['/base.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][5].init(57, 13, 'val == \'show\'');
function visit51_128_5(result) {
  _$jscoverage['/base.js'].branchData['128'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][4].init(57, 24, 'val == \'show\' && !hidden');
function visit50_128_4(result) {
  _$jscoverage['/base.js'].branchData['128'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][3].init(30, 13, 'val == \'hide\'');
function visit49_128_3(result) {
  _$jscoverage['/base.js'].branchData['128'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][2].init(30, 23, 'val == \'hide\' && hidden');
function visit48_128_2(result) {
  _$jscoverage['/base.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(30, 51, 'val == \'hide\' && hidden || val == \'show\' && !hidden');
function visit47_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][1].init(99, 16, 'specialVals[val]');
function visit46_127_1(result) {
  _$jscoverage['/base.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['123'][1].init(1321, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit45_123_1(result) {
  _$jscoverage['/base.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['114'][1].init(30, 10, 'S.UA[\'ie\']');
function visit44_114_1(result) {
  _$jscoverage['/base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit43_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['112'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit42_112_2(result) {
  _$jscoverage['/base.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['112'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit41_112_1(result) {
  _$jscoverage['/base.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['99'][1].init(177, 21, 'to.width || to.height');
function visit40_99_1(result) {
  _$jscoverage['/base.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['96'][1].init(1213, 38, 'node.nodeType == NodeType.ELEMENT_NODE');
function visit39_96_1(result) {
  _$jscoverage['/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['81'][1].init(22, 21, '!S.isPlainObject(val)');
function visit38_81_1(result) {
  _$jscoverage['/base.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['73'][1].init(467, 34, 'self.fire(\'beforeStart\') === false');
function visit37_73_1(result) {
  _$jscoverage['/base.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['67'][1].init(276, 17, 'config.delay || 0');
function visit36_67_1(result) {
  _$jscoverage['/base.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['46'][1].init(88, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit35_46_1(result) {
  _$jscoverage['/base.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['37'][1].init(491, 26, 'complete = config.complete');
function visit34_37_1(result) {
  _$jscoverage['/base.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['30'][1].init(296, 22, '!S.isPlainObject(node)');
function visit33_30_1(result) {
  _$jscoverage['/base.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('anim/base', function(S, Dom, Utils, CustomEvent, Q) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var NodeType = Dom.NodeType, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[20]++;
  function AnimBase(config) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[21]++;
    var self = this, complete;
    _$jscoverage['/base.js'].lineData[23]++;
    AnimBase.superclass.constructor.apply(this, arguments);
    _$jscoverage['/base.js'].lineData[28]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[29]++;
    var node = config.node;
    _$jscoverage['/base.js'].lineData[30]++;
    if (visit33_30_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[31]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[33]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[34]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[35]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[37]++;
    if (visit34_37_1(complete = config.complete)) {
      _$jscoverage['/base.js'].lineData[38]++;
      self.on('complete', complete);
    }
  }
  _$jscoverage['/base.js'].lineData[42]++;
  function onComplete(self) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[43]++;
    var _backupProps;
    _$jscoverage['/base.js'].lineData[46]++;
    if (visit35_46_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[47]++;
      Dom.css(self.node, _backupProps);
    }
  }
  _$jscoverage['/base.js'].lineData[51]++;
  S.extend(AnimBase, CustomEvent.Target, {
  prepareFx: function() {
  _$jscoverage['/base.js'].functionData[3]++;
}, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[60]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit36_67_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[71]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[73]++;
  if (visit37_73_1(self.fire('beforeStart') === false)) {
    _$jscoverage['/base.js'].lineData[75]++;
    self.stop(0);
    _$jscoverage['/base.js'].lineData[76]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[80]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[81]++;
  if (visit38_81_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[82]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[86]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[96]++;
  if (visit39_96_1(node.nodeType == NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[99]++;
    if (visit40_99_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[104]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[105]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[110]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[112]++;
      if (visit41_112_1(visit42_112_2(Dom.css(node, 'display') === 'inline') && visit43_113_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[114]++;
        if (visit44_114_1(S.UA['ie'])) {
          _$jscoverage['/base.js'].lineData[115]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[117]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[122]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[123]++;
    hidden = (visit45_123_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[124]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[125]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[127]++;
  if (visit46_127_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[128]++;
    if (visit47_128_1(visit48_128_2(visit49_128_3(val == 'hide') && hidden) || visit50_128_4(visit51_128_5(val == 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[130]++;
      self.stop(1);
      _$jscoverage['/base.js'].lineData[131]++;
      return exit = false;
    }
    _$jscoverage['/base.js'].lineData[134]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[135]++;
    if (visit52_135_1(val == 'toggle')) {
      _$jscoverage['/base.js'].lineData[136]++;
      val = hidden ? 'show' : 'hide';
    } else {
      _$jscoverage['/base.js'].lineData[138]++;
      if (visit53_138_1(val == 'hide')) {
        _$jscoverage['/base.js'].lineData[139]++;
        _propData.value = 0;
        _$jscoverage['/base.js'].lineData[141]++;
        _backupProps.display = 'none';
      } else {
        _$jscoverage['/base.js'].lineData[143]++;
        _propData.value = Dom.css(node, prop);
        _$jscoverage['/base.js'].lineData[145]++;
        Dom.css(node, prop, 0);
        _$jscoverage['/base.js'].lineData[146]++;
        Dom.show(node);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[149]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[152]++;
    if (visit54_152_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[153]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[157]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[158]++;
  if (visit55_158_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[159]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[160]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[161]++;
  self.stop(1);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[164]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[165]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[174]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[182]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[191]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[192]++;
  if (visit56_192_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[194]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[195]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[196]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[197]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[198]++;
    if (visit57_198_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[199]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[201]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[204]++;
  return self;
}, 
  doStop: function() {
  _$jscoverage['/base.js'].functionData[11]++;
}, 
  doStart: function() {
  _$jscoverage['/base.js'].functionData[12]++;
}, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[226]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[227]++;
  if (visit58_227_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[229]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[230]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[231]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[232]++;
    if (visit59_232_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[233]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[234]++;
  self.stop(1);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[237]++;
      self['beforeResume']();
      _$jscoverage['/base.js'].lineData[238]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[241]++;
  return self;
}, 
  'beforeResume': function() {
  _$jscoverage['/base.js'].functionData[15]++;
}, 
  run: function() {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[257]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[261]++;
  if (visit60_261_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[262]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[265]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[266]++;
    if (visit61_266_1(q.length == 1)) {
      _$jscoverage['/base.js'].lineData[267]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[271]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[280]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[285]++;
  if (visit62_285_1(self.__stopped)) {
    _$jscoverage['/base.js'].lineData[286]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[289]++;
  if (visit63_289_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[290]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[291]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[294]++;
  if (visit64_294_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[295]++;
    if (visit65_295_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[297]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[299]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[302]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[303]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[304]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[305]++;
  self.__stopped = 1;
  _$jscoverage['/base.js'].lineData[307]++;
  if (visit66_307_1(finish)) {
    _$jscoverage['/base.js'].lineData[308]++;
    onComplete(self);
    _$jscoverage['/base.js'].lineData[309]++;
    self.fire('complete');
  }
  _$jscoverage['/base.js'].lineData[312]++;
  if (visit67_312_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[314]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[315]++;
    if (visit68_315_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[316]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[319]++;
  self.fire('end');
  _$jscoverage['/base.js'].lineData[320]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[324]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[325]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[327]++;
  return AnimBase;
}, {
  requires: ['dom', './base/utils', 'event/custom', './base/queue']});
