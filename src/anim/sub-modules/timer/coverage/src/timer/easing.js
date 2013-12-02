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
if (! _$jscoverage['/timer/easing.js']) {
  _$jscoverage['/timer/easing.js'] = {};
  _$jscoverage['/timer/easing.js'].lineData = [];
  _$jscoverage['/timer/easing.js'].lineData[6] = 0;
  _$jscoverage['/timer/easing.js'].lineData[17] = 0;
  _$jscoverage['/timer/easing.js'].lineData[24] = 0;
  _$jscoverage['/timer/easing.js'].lineData[25] = 0;
  _$jscoverage['/timer/easing.js'].lineData[33] = 0;
  _$jscoverage['/timer/easing.js'].lineData[38] = 0;
  _$jscoverage['/timer/easing.js'].lineData[52] = 0;
  _$jscoverage['/timer/easing.js'].lineData[66] = 0;
  _$jscoverage['/timer/easing.js'].lineData[67] = 0;
  _$jscoverage['/timer/easing.js'].lineData[68] = 0;
  _$jscoverage['/timer/easing.js'].lineData[75] = 0;
  _$jscoverage['/timer/easing.js'].lineData[82] = 0;
  _$jscoverage['/timer/easing.js'].lineData[89] = 0;
  _$jscoverage['/timer/easing.js'].lineData[98] = 0;
  _$jscoverage['/timer/easing.js'].lineData[105] = 0;
  _$jscoverage['/timer/easing.js'].lineData[112] = 0;
  _$jscoverage['/timer/easing.js'].lineData[122] = 0;
  _$jscoverage['/timer/easing.js'].lineData[123] = 0;
  _$jscoverage['/timer/easing.js'].lineData[124] = 0;
  _$jscoverage['/timer/easing.js'].lineData[126] = 0;
  _$jscoverage['/timer/easing.js'].lineData[133] = 0;
  _$jscoverage['/timer/easing.js'].lineData[134] = 0;
  _$jscoverage['/timer/easing.js'].lineData[135] = 0;
  _$jscoverage['/timer/easing.js'].lineData[137] = 0;
  _$jscoverage['/timer/easing.js'].lineData[144] = 0;
  _$jscoverage['/timer/easing.js'].lineData[145] = 0;
  _$jscoverage['/timer/easing.js'].lineData[146] = 0;
  _$jscoverage['/timer/easing.js'].lineData[149] = 0;
  _$jscoverage['/timer/easing.js'].lineData[150] = 0;
  _$jscoverage['/timer/easing.js'].lineData[153] = 0;
  _$jscoverage['/timer/easing.js'].lineData[161] = 0;
  _$jscoverage['/timer/easing.js'].lineData[162] = 0;
  _$jscoverage['/timer/easing.js'].lineData[164] = 0;
  _$jscoverage['/timer/easing.js'].lineData[171] = 0;
  _$jscoverage['/timer/easing.js'].lineData[179] = 0;
  _$jscoverage['/timer/easing.js'].lineData[180] = 0;
  _$jscoverage['/timer/easing.js'].lineData[182] = 0;
  _$jscoverage['/timer/easing.js'].lineData[183] = 0;
  _$jscoverage['/timer/easing.js'].lineData[185] = 0;
  _$jscoverage['/timer/easing.js'].lineData[193] = 0;
  _$jscoverage['/timer/easing.js'].lineData[200] = 0;
  _$jscoverage['/timer/easing.js'].lineData[202] = 0;
  _$jscoverage['/timer/easing.js'].lineData[203] = 0;
  _$jscoverage['/timer/easing.js'].lineData[205] = 0;
  _$jscoverage['/timer/easing.js'].lineData[206] = 0;
  _$jscoverage['/timer/easing.js'].lineData[208] = 0;
  _$jscoverage['/timer/easing.js'].lineData[209] = 0;
  _$jscoverage['/timer/easing.js'].lineData[212] = 0;
  _$jscoverage['/timer/easing.js'].lineData[215] = 0;
  _$jscoverage['/timer/easing.js'].lineData[222] = 0;
  _$jscoverage['/timer/easing.js'].lineData[223] = 0;
  _$jscoverage['/timer/easing.js'].lineData[225] = 0;
  _$jscoverage['/timer/easing.js'].lineData[233] = 0;
  _$jscoverage['/timer/easing.js'].lineData[240] = 0;
  _$jscoverage['/timer/easing.js'].lineData[243] = 0;
  _$jscoverage['/timer/easing.js'].lineData[247] = 0;
  _$jscoverage['/timer/easing.js'].lineData[251] = 0;
  _$jscoverage['/timer/easing.js'].lineData[253] = 0;
  _$jscoverage['/timer/easing.js'].lineData[256] = 0;
  _$jscoverage['/timer/easing.js'].lineData[257] = 0;
  _$jscoverage['/timer/easing.js'].lineData[260] = 0;
  _$jscoverage['/timer/easing.js'].lineData[261] = 0;
  _$jscoverage['/timer/easing.js'].lineData[265] = 0;
  _$jscoverage['/timer/easing.js'].lineData[266] = 0;
  _$jscoverage['/timer/easing.js'].lineData[273] = 0;
  _$jscoverage['/timer/easing.js'].lineData[275] = 0;
  _$jscoverage['/timer/easing.js'].lineData[276] = 0;
  _$jscoverage['/timer/easing.js'].lineData[277] = 0;
  _$jscoverage['/timer/easing.js'].lineData[279] = 0;
  _$jscoverage['/timer/easing.js'].lineData[281] = 0;
  _$jscoverage['/timer/easing.js'].lineData[282] = 0;
  _$jscoverage['/timer/easing.js'].lineData[284] = 0;
  _$jscoverage['/timer/easing.js'].lineData[290] = 0;
  _$jscoverage['/timer/easing.js'].lineData[292] = 0;
  _$jscoverage['/timer/easing.js'].lineData[293] = 0;
  _$jscoverage['/timer/easing.js'].lineData[294] = 0;
  _$jscoverage['/timer/easing.js'].lineData[295] = 0;
  _$jscoverage['/timer/easing.js'].lineData[296] = 0;
  _$jscoverage['/timer/easing.js'].lineData[298] = 0;
  _$jscoverage['/timer/easing.js'].lineData[299] = 0;
  _$jscoverage['/timer/easing.js'].lineData[301] = 0;
  _$jscoverage['/timer/easing.js'].lineData[303] = 0;
  _$jscoverage['/timer/easing.js'].lineData[307] = 0;
  _$jscoverage['/timer/easing.js'].lineData[310] = 0;
  _$jscoverage['/timer/easing.js'].lineData[311] = 0;
  _$jscoverage['/timer/easing.js'].lineData[314] = 0;
  _$jscoverage['/timer/easing.js'].lineData[317] = 0;
}
if (! _$jscoverage['/timer/easing.js'].functionData) {
  _$jscoverage['/timer/easing.js'].functionData = [];
  _$jscoverage['/timer/easing.js'].functionData[0] = 0;
  _$jscoverage['/timer/easing.js'].functionData[1] = 0;
  _$jscoverage['/timer/easing.js'].functionData[2] = 0;
  _$jscoverage['/timer/easing.js'].functionData[3] = 0;
  _$jscoverage['/timer/easing.js'].functionData[4] = 0;
  _$jscoverage['/timer/easing.js'].functionData[5] = 0;
  _$jscoverage['/timer/easing.js'].functionData[6] = 0;
  _$jscoverage['/timer/easing.js'].functionData[7] = 0;
  _$jscoverage['/timer/easing.js'].functionData[8] = 0;
  _$jscoverage['/timer/easing.js'].functionData[9] = 0;
  _$jscoverage['/timer/easing.js'].functionData[10] = 0;
  _$jscoverage['/timer/easing.js'].functionData[11] = 0;
  _$jscoverage['/timer/easing.js'].functionData[12] = 0;
  _$jscoverage['/timer/easing.js'].functionData[13] = 0;
  _$jscoverage['/timer/easing.js'].functionData[14] = 0;
  _$jscoverage['/timer/easing.js'].functionData[15] = 0;
  _$jscoverage['/timer/easing.js'].functionData[16] = 0;
  _$jscoverage['/timer/easing.js'].functionData[17] = 0;
  _$jscoverage['/timer/easing.js'].functionData[18] = 0;
  _$jscoverage['/timer/easing.js'].functionData[19] = 0;
  _$jscoverage['/timer/easing.js'].functionData[20] = 0;
  _$jscoverage['/timer/easing.js'].functionData[21] = 0;
  _$jscoverage['/timer/easing.js'].functionData[22] = 0;
  _$jscoverage['/timer/easing.js'].functionData[23] = 0;
  _$jscoverage['/timer/easing.js'].functionData[24] = 0;
}
if (! _$jscoverage['/timer/easing.js'].branchData) {
  _$jscoverage['/timer/easing.js'].branchData = {};
  _$jscoverage['/timer/easing.js'].branchData['75'] = [];
  _$jscoverage['/timer/easing.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['89'] = [];
  _$jscoverage['/timer/easing.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['112'] = [];
  _$jscoverage['/timer/easing.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['123'] = [];
  _$jscoverage['/timer/easing.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['123'][3] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['134'] = [];
  _$jscoverage['/timer/easing.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['145'] = [];
  _$jscoverage['/timer/easing.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['149'] = [];
  _$jscoverage['/timer/easing.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['161'] = [];
  _$jscoverage['/timer/easing.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['182'] = [];
  _$jscoverage['/timer/easing.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['202'] = [];
  _$jscoverage['/timer/easing.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['205'] = [];
  _$jscoverage['/timer/easing.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['208'] = [];
  _$jscoverage['/timer/easing.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['222'] = [];
  _$jscoverage['/timer/easing.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['273'] = [];
  _$jscoverage['/timer/easing.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['276'] = [];
  _$jscoverage['/timer/easing.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['281'] = [];
  _$jscoverage['/timer/easing.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['293'] = [];
  _$jscoverage['/timer/easing.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['295'] = [];
  _$jscoverage['/timer/easing.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/timer/easing.js'].branchData['298'] = [];
  _$jscoverage['/timer/easing.js'].branchData['298'][1] = new BranchData();
}
_$jscoverage['/timer/easing.js'].branchData['298'][1].init(157, 6, 'x2 > 0');
function visit38_298_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['295'][1].init(64, 20, 'abs(x2) < ZERO_LIMIT');
function visit37_295_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['293'][1].init(991, 7, 't1 > t0');
function visit36_293_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['281'][1].init(275, 28, 'abs(derivative) < ZERO_LIMIT');
function visit35_281_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['276'][1].init(92, 20, 'abs(x2) < ZERO_LIMIT');
function visit34_276_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['273'][1].init(333, 5, 'i < 8');
function visit33_273_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['222'][1].init(17, 7, 't < 0.5');
function visit32_222_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['208'][1].init(244, 16, 't < (2.5 / 2.75)');
function visit31_208_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['205'][1].init(134, 14, 't < (2 / 2.75)');
function visit30_205_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['202'][1].init(49, 14, 't < (1 / 2.75)');
function visit29_202_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['182'][1].init(89, 12, '(t *= 2) < 1');
function visit28_182_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['161'][1].init(17, 7, 't === 1');
function visit27_161_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['149'][1].init(140, 5, 't < 1');
function visit26_149_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['145'][3].init(66, 13, '(t *= 2) === 2');
function visit25_145_3(result) {
  _$jscoverage['/timer/easing.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['145'][2].init(54, 7, 't === 0');
function visit24_145_2(result) {
  _$jscoverage['/timer/easing.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['145'][1].init(54, 25, 't === 0 || (t *= 2) === 2');
function visit23_145_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['134'][3].init(64, 7, 't === 1');
function visit22_134_3(result) {
  _$jscoverage['/timer/easing.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['134'][2].init(53, 7, 't === 0');
function visit21_134_2(result) {
  _$jscoverage['/timer/easing.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['134'][1].init(53, 18, 't === 0 || t === 1');
function visit20_134_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['123'][3].init(64, 7, 't === 1');
function visit19_123_3(result) {
  _$jscoverage['/timer/easing.js'].branchData['123'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['123'][2].init(53, 7, 't === 0');
function visit18_123_2(result) {
  _$jscoverage['/timer/easing.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['123'][1].init(53, 18, 't === 0 || t === 1');
function visit17_123_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['112'][1].init(21, 11, '(t *= 2) < 1');
function visit16_112_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['89'][1].init(21, 11, '(t *= 2) < 1');
function visit15_89_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].branchData['75'][1].init(330, 29, 'Easing[easingStr] || easeNone');
function visit14_75_1(result) {
  _$jscoverage['/timer/easing.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/easing.js'].lineData[6]++;
KISSY.add(function() {
  _$jscoverage['/timer/easing.js'].functionData[0]++;
  _$jscoverage['/timer/easing.js'].lineData[17]++;
  var PI = Math.PI, pow = Math.pow, sin = Math.sin, parseNumber = parseFloat, CUBIC_BEZIER_REG = /^cubic-bezier\(([^,]+),([^,]+),([^,]+),([^,]+)\)$/i, BACK_CONST = 1.70158;
  _$jscoverage['/timer/easing.js'].lineData[24]++;
  function easeNone(t) {
    _$jscoverage['/timer/easing.js'].functionData[1]++;
    _$jscoverage['/timer/easing.js'].lineData[25]++;
    return t;
  }
  _$jscoverage['/timer/easing.js'].lineData[33]++;
  var Easing = {
  swing: function(t) {
  _$jscoverage['/timer/easing.js'].functionData[2]++;
  _$jscoverage['/timer/easing.js'].lineData[38]++;
  return (-Math.cos(t * PI) / 2) + 0.5;
}, 
  'easeNone': easeNone, 
  'linear': easeNone, 
  'easeIn': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[3]++;
  _$jscoverage['/timer/easing.js'].lineData[52]++;
  return t * t;
}, 
  'ease': cubicBezierFunction(0.25, 0.1, 0.25, 1.0), 
  'ease-in': cubicBezierFunction(0.42, 0, 1.0, 1.0), 
  'ease-out': cubicBezierFunction(0, 0, 0.58, 1.0), 
  'ease-in-out': cubicBezierFunction(0.42, 0, 0.58, 1.0), 
  'ease-out-in': cubicBezierFunction(0, 0.42, 1.0, 0.58), 
  toFn: function(easingStr) {
  _$jscoverage['/timer/easing.js'].functionData[4]++;
  _$jscoverage['/timer/easing.js'].lineData[66]++;
  var m;
  _$jscoverage['/timer/easing.js'].lineData[67]++;
  if ((m = easingStr.match(CUBIC_BEZIER_REG))) {
    _$jscoverage['/timer/easing.js'].lineData[68]++;
    return cubicBezierFunction(parseNumber(m[1]), parseNumber(m[2]), parseNumber(m[3]), parseNumber(m[4]));
  }
  _$jscoverage['/timer/easing.js'].lineData[75]++;
  return visit14_75_1(Easing[easingStr] || easeNone);
}, 
  easeOut: function(t) {
  _$jscoverage['/timer/easing.js'].functionData[5]++;
  _$jscoverage['/timer/easing.js'].lineData[82]++;
  return (2 - t) * t;
}, 
  easeBoth: function(t) {
  _$jscoverage['/timer/easing.js'].functionData[6]++;
  _$jscoverage['/timer/easing.js'].lineData[89]++;
  return visit15_89_1((t *= 2) < 1) ? 0.5 * t * t : 0.5 * (1 - (--t) * (t - 2));
}, 
  'easeInStrong': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[7]++;
  _$jscoverage['/timer/easing.js'].lineData[98]++;
  return t * t * t * t;
}, 
  easeOutStrong: function(t) {
  _$jscoverage['/timer/easing.js'].functionData[8]++;
  _$jscoverage['/timer/easing.js'].lineData[105]++;
  return 1 - (--t) * t * t * t;
}, 
  'easeBothStrong': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[9]++;
  _$jscoverage['/timer/easing.js'].lineData[112]++;
  return visit16_112_1((t *= 2) < 1) ? 0.5 * t * t * t * t : 0.5 * (2 - (t -= 2) * t * t * t);
}, 
  'elasticIn': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[10]++;
  _$jscoverage['/timer/easing.js'].lineData[122]++;
  var p = 0.3, s = p / 4;
  _$jscoverage['/timer/easing.js'].lineData[123]++;
  if (visit17_123_1(visit18_123_2(t === 0) || visit19_123_3(t === 1))) {
    _$jscoverage['/timer/easing.js'].lineData[124]++;
    return t;
  }
  _$jscoverage['/timer/easing.js'].lineData[126]++;
  return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
}, 
  elasticOut: function(t) {
  _$jscoverage['/timer/easing.js'].functionData[11]++;
  _$jscoverage['/timer/easing.js'].lineData[133]++;
  var p = 0.3, s = p / 4;
  _$jscoverage['/timer/easing.js'].lineData[134]++;
  if (visit20_134_1(visit21_134_2(t === 0) || visit22_134_3(t === 1))) {
    _$jscoverage['/timer/easing.js'].lineData[135]++;
    return t;
  }
  _$jscoverage['/timer/easing.js'].lineData[137]++;
  return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
}, 
  'elasticBoth': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[12]++;
  _$jscoverage['/timer/easing.js'].lineData[144]++;
  var p = 0.45, s = p / 4;
  _$jscoverage['/timer/easing.js'].lineData[145]++;
  if (visit23_145_1(visit24_145_2(t === 0) || visit25_145_3((t *= 2) === 2))) {
    _$jscoverage['/timer/easing.js'].lineData[146]++;
    return t;
  }
  _$jscoverage['/timer/easing.js'].lineData[149]++;
  if (visit26_149_1(t < 1)) {
    _$jscoverage['/timer/easing.js'].lineData[150]++;
    return -0.5 * (pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
  }
  _$jscoverage['/timer/easing.js'].lineData[153]++;
  return pow(2, -10 * (t -= 1)) * sin((t - s) * (2 * PI) / p) * 0.5 + 1;
}, 
  'backIn': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[13]++;
  _$jscoverage['/timer/easing.js'].lineData[161]++;
  if (visit27_161_1(t === 1)) {
    _$jscoverage['/timer/easing.js'].lineData[162]++;
    t -= 0.001;
  }
  _$jscoverage['/timer/easing.js'].lineData[164]++;
  return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
}, 
  backOut: function(t) {
  _$jscoverage['/timer/easing.js'].functionData[14]++;
  _$jscoverage['/timer/easing.js'].lineData[171]++;
  return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
}, 
  'backBoth': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[15]++;
  _$jscoverage['/timer/easing.js'].lineData[179]++;
  var s = BACK_CONST;
  _$jscoverage['/timer/easing.js'].lineData[180]++;
  var m = (s *= 1.525) + 1;
  _$jscoverage['/timer/easing.js'].lineData[182]++;
  if (visit28_182_1((t *= 2) < 1)) {
    _$jscoverage['/timer/easing.js'].lineData[183]++;
    return 0.5 * (t * t * (m * t - s));
  }
  _$jscoverage['/timer/easing.js'].lineData[185]++;
  return 0.5 * ((t -= 2) * t * (m * t + s) + 2);
}, 
  bounceIn: function(t) {
  _$jscoverage['/timer/easing.js'].functionData[16]++;
  _$jscoverage['/timer/easing.js'].lineData[193]++;
  return 1 - Easing.bounceOut(1 - t);
}, 
  'bounceOut': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[17]++;
  _$jscoverage['/timer/easing.js'].lineData[200]++;
  var s = 7.5625, r;
  _$jscoverage['/timer/easing.js'].lineData[202]++;
  if (visit29_202_1(t < (1 / 2.75))) {
    _$jscoverage['/timer/easing.js'].lineData[203]++;
    r = s * t * t;
  } else {
    _$jscoverage['/timer/easing.js'].lineData[205]++;
    if (visit30_205_1(t < (2 / 2.75))) {
      _$jscoverage['/timer/easing.js'].lineData[206]++;
      r = s * (t -= (1.5 / 2.75)) * t + 0.75;
    } else {
      _$jscoverage['/timer/easing.js'].lineData[208]++;
      if (visit31_208_1(t < (2.5 / 2.75))) {
        _$jscoverage['/timer/easing.js'].lineData[209]++;
        r = s * (t -= (2.25 / 2.75)) * t + 0.9375;
      } else {
        _$jscoverage['/timer/easing.js'].lineData[212]++;
        r = s * (t -= (2.625 / 2.75)) * t + 0.984375;
      }
    }
  }
  _$jscoverage['/timer/easing.js'].lineData[215]++;
  return r;
}, 
  'bounceBoth': function(t) {
  _$jscoverage['/timer/easing.js'].functionData[18]++;
  _$jscoverage['/timer/easing.js'].lineData[222]++;
  if (visit32_222_1(t < 0.5)) {
    _$jscoverage['/timer/easing.js'].lineData[223]++;
    return Easing.bounceIn(t * 2) * 0.5;
  }
  _$jscoverage['/timer/easing.js'].lineData[225]++;
  return Easing.bounceOut(t * 2 - 1) * 0.5 + 0.5;
}};
  _$jscoverage['/timer/easing.js'].lineData[233]++;
  var ZERO_LIMIT = 1e-6, abs = Math.abs;
  _$jscoverage['/timer/easing.js'].lineData[240]++;
  function cubicBezierFunction(p1x, p1y, p2x, p2y) {
    _$jscoverage['/timer/easing.js'].functionData[19]++;
    _$jscoverage['/timer/easing.js'].lineData[243]++;
    var ax = 3 * p1x - 3 * p2x + 1, bx = 3 * p2x - 6 * p1x, cx = 3 * p1x;
    _$jscoverage['/timer/easing.js'].lineData[247]++;
    var ay = 3 * p1y - 3 * p2y + 1, by = 3 * p2y - 6 * p1y, cy = 3 * p1y;
    _$jscoverage['/timer/easing.js'].lineData[251]++;
    function sampleCurveDerivativeX(t) {
      _$jscoverage['/timer/easing.js'].functionData[20]++;
      _$jscoverage['/timer/easing.js'].lineData[253]++;
      return (3 * ax * t + 2 * bx) * t + cx;
    }
    _$jscoverage['/timer/easing.js'].lineData[256]++;
    function sampleCurveX(t) {
      _$jscoverage['/timer/easing.js'].functionData[21]++;
      _$jscoverage['/timer/easing.js'].lineData[257]++;
      return ((ax * t + bx) * t + cx) * t;
    }
    _$jscoverage['/timer/easing.js'].lineData[260]++;
    function sampleCurveY(t) {
      _$jscoverage['/timer/easing.js'].functionData[22]++;
      _$jscoverage['/timer/easing.js'].lineData[261]++;
      return ((ay * t + by) * t + cy) * t;
    }
    _$jscoverage['/timer/easing.js'].lineData[265]++;
    function solveCurveX(x) {
      _$jscoverage['/timer/easing.js'].functionData[23]++;
      _$jscoverage['/timer/easing.js'].lineData[266]++;
      var t2 = x, derivative, x2;
      _$jscoverage['/timer/easing.js'].lineData[273]++;
      for (var i = 0; visit33_273_1(i < 8); i++) {
        _$jscoverage['/timer/easing.js'].lineData[275]++;
        x2 = sampleCurveX(t2) - x;
        _$jscoverage['/timer/easing.js'].lineData[276]++;
        if (visit34_276_1(abs(x2) < ZERO_LIMIT)) {
          _$jscoverage['/timer/easing.js'].lineData[277]++;
          return t2;
        }
        _$jscoverage['/timer/easing.js'].lineData[279]++;
        derivative = sampleCurveDerivativeX(t2);
        _$jscoverage['/timer/easing.js'].lineData[281]++;
        if (visit35_281_1(abs(derivative) < ZERO_LIMIT)) {
          _$jscoverage['/timer/easing.js'].lineData[282]++;
          break;
        }
        _$jscoverage['/timer/easing.js'].lineData[284]++;
        t2 -= x2 / derivative;
      }
      _$jscoverage['/timer/easing.js'].lineData[290]++;
      var t1 = 1, t0 = 0;
      _$jscoverage['/timer/easing.js'].lineData[292]++;
      t2 = x;
      _$jscoverage['/timer/easing.js'].lineData[293]++;
      while (visit36_293_1(t1 > t0)) {
        _$jscoverage['/timer/easing.js'].lineData[294]++;
        x2 = sampleCurveX(t2) - x;
        _$jscoverage['/timer/easing.js'].lineData[295]++;
        if (visit37_295_1(abs(x2) < ZERO_LIMIT)) {
          _$jscoverage['/timer/easing.js'].lineData[296]++;
          return t2;
        }
        _$jscoverage['/timer/easing.js'].lineData[298]++;
        if (visit38_298_1(x2 > 0)) {
          _$jscoverage['/timer/easing.js'].lineData[299]++;
          t1 = t2;
        } else {
          _$jscoverage['/timer/easing.js'].lineData[301]++;
          t0 = t2;
        }
        _$jscoverage['/timer/easing.js'].lineData[303]++;
        t2 = (t1 + t0) / 2;
      }
      _$jscoverage['/timer/easing.js'].lineData[307]++;
      return t2;
    }
    _$jscoverage['/timer/easing.js'].lineData[310]++;
    function solve(x) {
      _$jscoverage['/timer/easing.js'].functionData[24]++;
      _$jscoverage['/timer/easing.js'].lineData[311]++;
      return sampleCurveY(solveCurveX(x));
    }
    _$jscoverage['/timer/easing.js'].lineData[314]++;
    return solve;
  }
  _$jscoverage['/timer/easing.js'].lineData[317]++;
  return Easing;
});
