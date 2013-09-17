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
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[255] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[276] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[281] = 0;
  _$jscoverage['/base.js'].lineData[282] = 0;
  _$jscoverage['/base.js'].lineData[283] = 0;
  _$jscoverage['/base.js'].lineData[284] = 0;
  _$jscoverage['/base.js'].lineData[286] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[288] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[294] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
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
  _$jscoverage['/base.js'].branchData['187'] = [];
  _$jscoverage['/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'] = [];
  _$jscoverage['/base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['245'] = [];
  _$jscoverage['/base.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['250'] = [];
  _$jscoverage['/base.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['269'] = [];
  _$jscoverage['/base.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['273'] = [];
  _$jscoverage['/base.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['274'] = [];
  _$jscoverage['/base.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['286'] = [];
  _$jscoverage['/base.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['291'] = [];
  _$jscoverage['/base.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['294'] = [];
  _$jscoverage['/base.js'].branchData['294'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['294'][1].init(129, 9, 'q && q[0]');
function visit64_294_1(result) {
  _$jscoverage['/base.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['291'][1].init(772, 15, 'queue !== false');
function visit63_291_1(result) {
  _$jscoverage['/base.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['286'][1].init(653, 6, 'finish');
function visit62_286_1(result) {
  _$jscoverage['/base.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['274'][1].init(22, 15, 'queue !== false');
function visit61_274_1(result) {
  _$jscoverage['/base.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['273'][1].init(231, 37, '!self.isRunning() && !self.isPaused()');
function visit60_273_1(result) {
  _$jscoverage['/base.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['269'][1].init(149, 14, 'self.__stopped');
function visit59_269_1(result) {
  _$jscoverage['/base.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['250'][1].init(107, 13, 'q.length == 1');
function visit58_250_1(result) {
  _$jscoverage['/base.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['245'][1].init(114, 15, 'queue === false');
function visit57_245_1(result) {
  _$jscoverage['/base.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][1].init(48, 15, 'self.isPaused()');
function visit56_217_1(result) {
  _$jscoverage['/base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['187'][1].init(48, 16, 'self.isRunning()');
function visit55_187_1(result) {
  _$jscoverage['/base.js'].branchData['187'][1].ranCondition(result);
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
}_$jscoverage['/base.js'].branchData['37'][1].init(490, 26, 'complete = config.complete');
function visit34_37_1(result) {
  _$jscoverage['/base.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['30'][1].init(295, 22, '!S.isPlainObject(node)');
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
  _$jscoverage['/base.js'].lineData[159]++;
  self.prepareFx();
  _$jscoverage['/base.js'].lineData[161]++;
  self.doStart();
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[169]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[177]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[186]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[187]++;
  if (visit55_187_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[189]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[190]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[191]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[192]++;
    self.doStop();
  }
  _$jscoverage['/base.js'].lineData[194]++;
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
  _$jscoverage['/base.js'].lineData[216]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[217]++;
  if (visit56_217_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[219]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[220]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[221]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[222]++;
    self['beforeResume']();
    _$jscoverage['/base.js'].lineData[223]++;
    self.doStart();
  }
  _$jscoverage['/base.js'].lineData[225]++;
  return self;
}, 
  'beforeResume': function() {
  _$jscoverage['/base.js'].functionData[13]++;
}, 
  run: function() {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[241]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[245]++;
  if (visit57_245_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[246]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[249]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[250]++;
    if (visit58_250_1(q.length == 1)) {
      _$jscoverage['/base.js'].lineData[251]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[255]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[264]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[269]++;
  if (visit59_269_1(self.__stopped)) {
    _$jscoverage['/base.js'].lineData[270]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[273]++;
  if (visit60_273_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[274]++;
    if (visit61_274_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[276]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[278]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[281]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[282]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[283]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[284]++;
  self.__stopped = 1;
  _$jscoverage['/base.js'].lineData[286]++;
  if (visit62_286_1(finish)) {
    _$jscoverage['/base.js'].lineData[287]++;
    onComplete(self);
    _$jscoverage['/base.js'].lineData[288]++;
    self.fire('complete');
  }
  _$jscoverage['/base.js'].lineData[291]++;
  if (visit63_291_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[293]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[294]++;
    if (visit64_294_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[295]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[298]++;
  self.fire('end');
  _$jscoverage['/base.js'].lineData[299]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[303]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[304]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[306]++;
  return AnimBase;
}, {
  requires: ['dom', './base/utils', 'event/custom', './base/queue']});
