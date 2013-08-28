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
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[44] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[276] = 0;
  _$jscoverage['/base.js'].lineData[277] = 0;
  _$jscoverage['/base.js'].lineData[279] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[281] = 0;
  _$jscoverage['/base.js'].lineData[284] = 0;
  _$jscoverage['/base.js'].lineData[286] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[288] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
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
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['30'] = [];
  _$jscoverage['/base.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['39'] = [];
  _$jscoverage['/base.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['60'] = [];
  _$jscoverage['/base.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['66'] = [];
  _$jscoverage['/base.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['74'] = [];
  _$jscoverage['/base.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['89'] = [];
  _$jscoverage['/base.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['92'] = [];
  _$jscoverage['/base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['105'] = [];
  _$jscoverage['/base.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['106'] = [];
  _$jscoverage['/base.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['107'] = [];
  _$jscoverage['/base.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['120'] = [];
  _$jscoverage['/base.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'] = [];
  _$jscoverage['/base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'] = [];
  _$jscoverage['/base.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['180'] = [];
  _$jscoverage['/base.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['210'] = [];
  _$jscoverage['/base.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['238'] = [];
  _$jscoverage['/base.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['243'] = [];
  _$jscoverage['/base.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['262'] = [];
  _$jscoverage['/base.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['266'] = [];
  _$jscoverage['/base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['267'] = [];
  _$jscoverage['/base.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['279'] = [];
  _$jscoverage['/base.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['284'] = [];
  _$jscoverage['/base.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['287'] = [];
  _$jscoverage['/base.js'].branchData['287'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['287'][1].init(129, 9, 'q && q[0]');
function visit63_287_1(result) {
  _$jscoverage['/base.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['284'][1].init(772, 15, 'queue !== false');
function visit62_284_1(result) {
  _$jscoverage['/base.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['279'][1].init(653, 6, 'finish');
function visit61_279_1(result) {
  _$jscoverage['/base.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['267'][1].init(22, 15, 'queue !== false');
function visit60_267_1(result) {
  _$jscoverage['/base.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['266'][1].init(231, 37, '!self.isRunning() && !self.isPaused()');
function visit59_266_1(result) {
  _$jscoverage['/base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['262'][1].init(149, 14, 'self.__stopped');
function visit58_262_1(result) {
  _$jscoverage['/base.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['243'][1].init(107, 13, 'q.length == 1');
function visit57_243_1(result) {
  _$jscoverage['/base.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['238'][1].init(114, 15, 'queue === false');
function visit56_238_1(result) {
  _$jscoverage['/base.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['210'][1].init(48, 15, 'self.isPaused()');
function visit55_210_1(result) {
  _$jscoverage['/base.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['180'][1].init(48, 16, 'self.isRunning()');
function visit54_180_1(result) {
  _$jscoverage['/base.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][1].init(2658, 14, 'exit === false');
function visit53_145_1(result) {
  _$jscoverage['/base.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][1].init(562, 13, 'val == \'hide\'');
function visit52_131_1(result) {
  _$jscoverage['/base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(420, 15, 'val == \'toggle\'');
function visit51_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][5].init(57, 13, 'val == \'show\'');
function visit50_121_5(result) {
  _$jscoverage['/base.js'].branchData['121'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][4].init(57, 24, 'val == \'show\' && !hidden');
function visit49_121_4(result) {
  _$jscoverage['/base.js'].branchData['121'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][3].init(30, 13, 'val == \'hide\'');
function visit48_121_3(result) {
  _$jscoverage['/base.js'].branchData['121'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][2].init(30, 23, 'val == \'hide\' && hidden');
function visit47_121_2(result) {
  _$jscoverage['/base.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(30, 51, 'val == \'hide\' && hidden || val == \'show\' && !hidden');
function visit46_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['120'][1].init(99, 16, 'specialVals[val]');
function visit45_120_1(result) {
  _$jscoverage['/base.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(1321, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit44_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['107'][1].init(30, 10, 'S.UA[\'ie\']');
function visit43_107_1(result) {
  _$jscoverage['/base.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['106'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit42_106_1(result) {
  _$jscoverage['/base.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['105'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit41_105_2(result) {
  _$jscoverage['/base.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['105'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit40_105_1(result) {
  _$jscoverage['/base.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['92'][1].init(177, 21, 'to.width || to.height');
function visit39_92_1(result) {
  _$jscoverage['/base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['89'][1].init(1213, 38, 'node.nodeType == NodeType.ELEMENT_NODE');
function visit38_89_1(result) {
  _$jscoverage['/base.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['74'][1].init(22, 21, '!S.isPlainObject(val)');
function visit37_74_1(result) {
  _$jscoverage['/base.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['66'][1].init(467, 34, 'self.fire(\'beforeStart\') === false');
function visit36_66_1(result) {
  _$jscoverage['/base.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['60'][1].init(276, 17, 'config.delay || 0');
function visit35_60_1(result) {
  _$jscoverage['/base.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['39'][1].init(88, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit34_39_1(result) {
  _$jscoverage['/base.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['30'][1].init(317, 26, 'complete = config.complete');
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
  _$jscoverage['/base.js'].lineData[18]++;
  function AnimBase(config) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[19]++;
    var self = this, complete;
    _$jscoverage['/base.js'].lineData[25]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[26]++;
    self.node = self.el = Dom.get(config.node);
    _$jscoverage['/base.js'].lineData[27]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[28]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[30]++;
    if (visit33_30_1(complete = config.complete)) {
      _$jscoverage['/base.js'].lineData[31]++;
      self.on('complete', complete);
    }
  }
  _$jscoverage['/base.js'].lineData[35]++;
  function onComplete(self) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[36]++;
    var _backupProps;
    _$jscoverage['/base.js'].lineData[39]++;
    if (visit34_39_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[40]++;
      Dom.css(self.node, _backupProps);
    }
  }
  _$jscoverage['/base.js'].lineData[44]++;
  S.augment(AnimBase, CustomEvent.Target, {
  prepareFx: function() {
  _$jscoverage['/base.js'].functionData[3]++;
}, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[53]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit35_60_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[64]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[66]++;
  if (visit36_66_1(self.fire('beforeStart') === false)) {
    _$jscoverage['/base.js'].lineData[68]++;
    self.stop(0);
    _$jscoverage['/base.js'].lineData[69]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[73]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[74]++;
  if (visit37_74_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[75]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[79]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[89]++;
  if (visit38_89_1(node.nodeType == NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[92]++;
    if (visit39_92_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[97]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[98]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[103]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[105]++;
      if (visit40_105_1(visit41_105_2(Dom.css(node, 'display') === 'inline') && visit42_106_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[107]++;
        if (visit43_107_1(S.UA['ie'])) {
          _$jscoverage['/base.js'].lineData[108]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[110]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[115]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[116]++;
    hidden = (visit44_116_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[117]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[118]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[120]++;
  if (visit45_120_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[121]++;
    if (visit46_121_1(visit47_121_2(visit48_121_3(val == 'hide') && hidden) || visit49_121_4(visit50_121_5(val == 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[123]++;
      self.stop(1);
      _$jscoverage['/base.js'].lineData[124]++;
      return exit = false;
    }
    _$jscoverage['/base.js'].lineData[127]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[128]++;
    if (visit51_128_1(val == 'toggle')) {
      _$jscoverage['/base.js'].lineData[129]++;
      val = hidden ? 'show' : 'hide';
    } else {
      _$jscoverage['/base.js'].lineData[131]++;
      if (visit52_131_1(val == 'hide')) {
        _$jscoverage['/base.js'].lineData[132]++;
        _propData.value = 0;
        _$jscoverage['/base.js'].lineData[134]++;
        _backupProps.display = 'none';
      } else {
        _$jscoverage['/base.js'].lineData[136]++;
        _propData.value = Dom.css(node, prop);
        _$jscoverage['/base.js'].lineData[138]++;
        Dom.css(node, prop, 0);
        _$jscoverage['/base.js'].lineData[139]++;
        Dom.show(node);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[142]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[145]++;
    if (visit53_145_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[146]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[150]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[152]++;
  self.prepareFx();
  _$jscoverage['/base.js'].lineData[154]++;
  self.doStart();
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[162]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[170]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[179]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[180]++;
  if (visit54_180_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[182]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[183]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[184]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[185]++;
    self.doStop();
  }
  _$jscoverage['/base.js'].lineData[187]++;
  return self;
}, 
  doStop: function() {
  _$jscoverage['/base.js'].functionData[10]++;
}, 
  doStart: function() {
  _$jscoverage['/base.js'].functionData[11]++;
}, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[209]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[210]++;
  if (visit55_210_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[212]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[213]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[214]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[215]++;
    self['beforeResume']();
    _$jscoverage['/base.js'].lineData[216]++;
    self.doStart();
  }
  _$jscoverage['/base.js'].lineData[218]++;
  return self;
}, 
  'beforeResume': function() {
  _$jscoverage['/base.js'].functionData[13]++;
}, 
  run: function() {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[234]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[238]++;
  if (visit56_238_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[239]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[242]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[243]++;
    if (visit57_243_1(q.length == 1)) {
      _$jscoverage['/base.js'].lineData[244]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[248]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[257]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[262]++;
  if (visit58_262_1(self.__stopped)) {
    _$jscoverage['/base.js'].lineData[263]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[266]++;
  if (visit59_266_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[267]++;
    if (visit60_267_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[269]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[271]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[274]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[275]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[276]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[277]++;
  self.__stopped = 1;
  _$jscoverage['/base.js'].lineData[279]++;
  if (visit61_279_1(finish)) {
    _$jscoverage['/base.js'].lineData[280]++;
    onComplete(self);
    _$jscoverage['/base.js'].lineData[281]++;
    self.fire('complete');
  }
  _$jscoverage['/base.js'].lineData[284]++;
  if (visit62_284_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[286]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[287]++;
    if (visit63_287_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[288]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[291]++;
  self.fire('end');
  _$jscoverage['/base.js'].lineData[292]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[296]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[297]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[299]++;
  return AnimBase;
}, {
  requires: ['dom', './base/utils', 'event/custom', './base/queue']});
