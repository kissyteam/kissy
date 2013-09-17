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
if (! _$jscoverage['/kissy.js']) {
  _$jscoverage['/kissy.js'] = {};
  _$jscoverage['/kissy.js'].lineData = [];
  _$jscoverage['/kissy.js'].lineData[24] = 0;
  _$jscoverage['/kissy.js'].lineData[25] = 0;
  _$jscoverage['/kissy.js'].lineData[30] = 0;
  _$jscoverage['/kissy.js'].lineData[37] = 0;
  _$jscoverage['/kissy.js'].lineData[125] = 0;
  _$jscoverage['/kissy.js'].lineData[131] = 0;
  _$jscoverage['/kissy.js'].lineData[132] = 0;
  _$jscoverage['/kissy.js'].lineData[133] = 0;
  _$jscoverage['/kissy.js'].lineData[134] = 0;
  _$jscoverage['/kissy.js'].lineData[135] = 0;
  _$jscoverage['/kissy.js'].lineData[137] = 0;
  _$jscoverage['/kissy.js'].lineData[141] = 0;
  _$jscoverage['/kissy.js'].lineData[142] = 0;
  _$jscoverage['/kissy.js'].lineData[143] = 0;
  _$jscoverage['/kissy.js'].lineData[144] = 0;
  _$jscoverage['/kissy.js'].lineData[146] = 0;
  _$jscoverage['/kissy.js'].lineData[149] = 0;
  _$jscoverage['/kissy.js'].lineData[150] = 0;
  _$jscoverage['/kissy.js'].lineData[152] = 0;
  _$jscoverage['/kissy.js'].lineData[156] = 0;
  _$jscoverage['/kissy.js'].lineData[167] = 0;
  _$jscoverage['/kissy.js'].lineData[168] = 0;
  _$jscoverage['/kissy.js'].lineData[169] = 0;
  _$jscoverage['/kissy.js'].lineData[170] = 0;
  _$jscoverage['/kissy.js'].lineData[172] = 0;
  _$jscoverage['/kissy.js'].lineData[173] = 0;
  _$jscoverage['/kissy.js'].lineData[174] = 0;
  _$jscoverage['/kissy.js'].lineData[175] = 0;
  _$jscoverage['/kissy.js'].lineData[176] = 0;
  _$jscoverage['/kissy.js'].lineData[177] = 0;
  _$jscoverage['/kissy.js'].lineData[178] = 0;
  _$jscoverage['/kissy.js'].lineData[179] = 0;
  _$jscoverage['/kissy.js'].lineData[180] = 0;
  _$jscoverage['/kissy.js'].lineData[181] = 0;
  _$jscoverage['/kissy.js'].lineData[182] = 0;
  _$jscoverage['/kissy.js'].lineData[183] = 0;
  _$jscoverage['/kissy.js'].lineData[186] = 0;
  _$jscoverage['/kissy.js'].lineData[187] = 0;
  _$jscoverage['/kissy.js'].lineData[188] = 0;
  _$jscoverage['/kissy.js'].lineData[189] = 0;
  _$jscoverage['/kissy.js'].lineData[190] = 0;
  _$jscoverage['/kissy.js'].lineData[191] = 0;
  _$jscoverage['/kissy.js'].lineData[192] = 0;
  _$jscoverage['/kissy.js'].lineData[193] = 0;
  _$jscoverage['/kissy.js'].lineData[194] = 0;
  _$jscoverage['/kissy.js'].lineData[195] = 0;
  _$jscoverage['/kissy.js'].lineData[199] = 0;
  _$jscoverage['/kissy.js'].lineData[200] = 0;
  _$jscoverage['/kissy.js'].lineData[203] = 0;
  _$jscoverage['/kissy.js'].lineData[204] = 0;
  _$jscoverage['/kissy.js'].lineData[205] = 0;
  _$jscoverage['/kissy.js'].lineData[208] = 0;
  _$jscoverage['/kissy.js'].lineData[217] = 0;
  _$jscoverage['/kissy.js'].lineData[224] = 0;
  _$jscoverage['/kissy.js'].lineData[226] = 0;
  _$jscoverage['/kissy.js'].lineData[236] = 0;
  _$jscoverage['/kissy.js'].lineData[240] = 0;
  _$jscoverage['/kissy.js'].lineData[241] = 0;
  _$jscoverage['/kissy.js'].lineData[256] = 0;
  _$jscoverage['/kissy.js'].lineData[265] = 0;
  _$jscoverage['/kissy.js'].lineData[272] = 0;
  _$jscoverage['/kissy.js'].lineData[279] = 0;
  _$jscoverage['/kissy.js'].lineData[286] = 0;
  _$jscoverage['/kissy.js'].lineData[290] = 0;
  _$jscoverage['/kissy.js'].lineData[291] = 0;
  _$jscoverage['/kissy.js'].lineData[292] = 0;
  _$jscoverage['/kissy.js'].lineData[293] = 0;
  _$jscoverage['/kissy.js'].lineData[294] = 0;
  _$jscoverage['/kissy.js'].lineData[297] = 0;
  _$jscoverage['/kissy.js'].lineData[305] = 0;
  _$jscoverage['/kissy.js'].lineData[307] = 0;
  _$jscoverage['/kissy.js'].lineData[326] = 0;
}
if (! _$jscoverage['/kissy.js'].functionData) {
  _$jscoverage['/kissy.js'].functionData = [];
  _$jscoverage['/kissy.js'].functionData[0] = 0;
  _$jscoverage['/kissy.js'].functionData[1] = 0;
  _$jscoverage['/kissy.js'].functionData[2] = 0;
  _$jscoverage['/kissy.js'].functionData[3] = 0;
  _$jscoverage['/kissy.js'].functionData[4] = 0;
  _$jscoverage['/kissy.js'].functionData[5] = 0;
  _$jscoverage['/kissy.js'].functionData[6] = 0;
  _$jscoverage['/kissy.js'].functionData[7] = 0;
  _$jscoverage['/kissy.js'].functionData[8] = 0;
  _$jscoverage['/kissy.js'].functionData[9] = 0;
  _$jscoverage['/kissy.js'].functionData[10] = 0;
  _$jscoverage['/kissy.js'].functionData[11] = 0;
  _$jscoverage['/kissy.js'].functionData[12] = 0;
  _$jscoverage['/kissy.js'].functionData[13] = 0;
  _$jscoverage['/kissy.js'].functionData[14] = 0;
}
if (! _$jscoverage['/kissy.js'].branchData) {
  _$jscoverage['/kissy.js'].branchData = {};
  _$jscoverage['/kissy.js'].branchData['131'] = [];
  _$jscoverage['/kissy.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['134'] = [];
  _$jscoverage['/kissy.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['142'] = [];
  _$jscoverage['/kissy.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['143'] = [];
  _$jscoverage['/kissy.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['149'] = [];
  _$jscoverage['/kissy.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['167'] = [];
  _$jscoverage['/kissy.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['169'] = [];
  _$jscoverage['/kissy.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['170'] = [];
  _$jscoverage['/kissy.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['172'] = [];
  _$jscoverage['/kissy.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['173'] = [];
  _$jscoverage['/kissy.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['174'] = [];
  _$jscoverage['/kissy.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['176'] = [];
  _$jscoverage['/kissy.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['179'] = [];
  _$jscoverage['/kissy.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['180'] = [];
  _$jscoverage['/kissy.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['181'] = [];
  _$jscoverage['/kissy.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['181'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['181'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['186'] = [];
  _$jscoverage['/kissy.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['188'] = [];
  _$jscoverage['/kissy.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['191'] = [];
  _$jscoverage['/kissy.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'] = [];
  _$jscoverage['/kissy.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['193'] = [];
  _$jscoverage['/kissy.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['193'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['199'] = [];
  _$jscoverage['/kissy.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['203'] = [];
  _$jscoverage['/kissy.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['203'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['204'] = [];
  _$jscoverage['/kissy.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['224'] = [];
  _$jscoverage['/kissy.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['236'] = [];
  _$jscoverage['/kissy.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['240'] = [];
  _$jscoverage['/kissy.js'].branchData['240'][1] = new BranchData();
}
_$jscoverage['/kissy.js'].branchData['240'][1].init(8654, 9, '\'@DEBUG@\'');
function visit64_240_1(result) {
  _$jscoverage['/kissy.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['236'][1].init(22, 12, 'pre || EMPTY');
function visit63_236_1(result) {
  _$jscoverage['/kissy.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['224'][1].init(18, 9, '\'@DEBUG@\'');
function visit62_224_1(result) {
  _$jscoverage['/kissy.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['204'][1].init(30, 19, 'cat && console[cat]');
function visit61_204_1(result) {
  _$jscoverage['/kissy.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['203'][3].init(1839, 22, 'console.log && matched');
function visit60_203_3(result) {
  _$jscoverage['/kissy.js'].branchData['203'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['203'][2].init(1806, 29, 'host[\'console\'] !== undefined');
function visit59_203_2(result) {
  _$jscoverage['/kissy.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['203'][1].init(1806, 55, 'host[\'console\'] !== undefined && console.log && matched');
function visit58_203_1(result) {
  _$jscoverage['/kissy.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['199'][1].init(1615, 7, 'matched');
function visit57_199_1(result) {
  _$jscoverage['/kissy.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['193'][4].init(320, 17, 'maxLevel >= level');
function visit56_193_4(result) {
  _$jscoverage['/kissy.js'].branchData['193'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['193'][3].init(320, 38, 'maxLevel >= level && logger.match(reg)');
function visit55_193_3(result) {
  _$jscoverage['/kissy.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['193'][2].init(299, 17, 'minLevel <= level');
function visit54_193_2(result) {
  _$jscoverage['/kissy.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['193'][1].init(299, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit53_193_1(result) {
  _$jscoverage['/kissy.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][1].init(217, 47, 'loggerLevel[l.minLevel] || loggerLevel[\'debug\']');
function visit52_192_1(result) {
  _$jscoverage['/kissy.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['191'][1].init(128, 47, 'loggerLevel[l.maxLevel] || loggerLevel[\'error\']');
function visit51_191_1(result) {
  _$jscoverage['/kissy.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['188'][1].init(76, 15, 'i < list.length');
function visit50_188_1(result) {
  _$jscoverage['/kissy.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['186'][1].init(935, 25, 'list = loggerCfg.excludes');
function visit49_186_1(result) {
  _$jscoverage['/kissy.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['181'][4].init(320, 17, 'maxLevel >= level');
function visit48_181_4(result) {
  _$jscoverage['/kissy.js'].branchData['181'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['181'][3].init(320, 38, 'maxLevel >= level && logger.match(reg)');
function visit47_181_3(result) {
  _$jscoverage['/kissy.js'].branchData['181'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['181'][2].init(299, 17, 'minLevel <= level');
function visit46_181_2(result) {
  _$jscoverage['/kissy.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['181'][1].init(299, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit45_181_1(result) {
  _$jscoverage['/kissy.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['180'][1].init(217, 47, 'loggerLevel[l.minLevel] || loggerLevel[\'debug\']');
function visit44_180_1(result) {
  _$jscoverage['/kissy.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['179'][1].init(128, 47, 'loggerLevel[l.maxLevel] || loggerLevel[\'error\']');
function visit43_179_1(result) {
  _$jscoverage['/kissy.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['176'][1].init(76, 15, 'i < list.length');
function visit42_176_1(result) {
  _$jscoverage['/kissy.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['174'][1].init(269, 25, 'list = loggerCfg.includes');
function visit41_174_1(result) {
  _$jscoverage['/kissy.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['173'][1].init(202, 40, 'loggerLevel[cat] || loggerLevel[\'debug\']');
function visit40_173_1(result) {
  _$jscoverage['/kissy.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['172'][1].init(157, 14, 'cat || \'debug\'');
function visit39_172_1(result) {
  _$jscoverage['/kissy.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['170'][1].init(38, 21, 'S.Config.logger || {}');
function visit38_170_1(result) {
  _$jscoverage['/kissy.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['169'][1].init(56, 6, 'logger');
function visit37_169_1(result) {
  _$jscoverage['/kissy.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['167'][1].init(18, 9, '\'@DEBUG@\'');
function visit36_167_1(result) {
  _$jscoverage['/kissy.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['149'][1].init(26, 3, 'cfg');
function visit35_149_1(result) {
  _$jscoverage['/kissy.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['143'][1].init(26, 3, 'cfg');
function visit34_143_1(result) {
  _$jscoverage['/kissy.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['142'][1].init(68, 25, 'configValue === undefined');
function visit33_142_1(result) {
  _$jscoverage['/kissy.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['134'][1].init(66, 2, 'fn');
function visit32_134_1(result) {
  _$jscoverage['/kissy.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['131'][1].init(188, 22, 'S.isObject(configName)');
function visit31_131_1(result) {
  _$jscoverage['/kissy.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].lineData[24]++;
var KISSY = (function(undefined) {
  _$jscoverage['/kissy.js'].functionData[0]++;
  _$jscoverage['/kissy.js'].lineData[25]++;
  var host = this, S, guid = 0, EMPTY = '';
  _$jscoverage['/kissy.js'].lineData[30]++;
  var loggerLevel = {
  'debug': 10, 
  'info': 20, 
  'warn': 30, 
  'error': 40};
  _$jscoverage['/kissy.js'].lineData[37]++;
  S = {
  __BUILD_TIME: '@TIMESTAMP@', 
  Env: {
  host: host}, 
  Config: {
  debug: '@DEBUG@', 
  fns: {}}, 
  version: '@VERSION@', 
  config: function(configName, configValue) {
  _$jscoverage['/kissy.js'].functionData[1]++;
  _$jscoverage['/kissy.js'].lineData[125]++;
  var cfg, r, self = this, fn, Config = S.Config, configFns = Config.fns;
  _$jscoverage['/kissy.js'].lineData[131]++;
  if (visit31_131_1(S.isObject(configName))) {
    _$jscoverage['/kissy.js'].lineData[132]++;
    S.each(configName, function(configValue, p) {
  _$jscoverage['/kissy.js'].functionData[2]++;
  _$jscoverage['/kissy.js'].lineData[133]++;
  fn = configFns[p];
  _$jscoverage['/kissy.js'].lineData[134]++;
  if (visit32_134_1(fn)) {
    _$jscoverage['/kissy.js'].lineData[135]++;
    fn.call(self, configValue);
  } else {
    _$jscoverage['/kissy.js'].lineData[137]++;
    Config[p] = configValue;
  }
});
  } else {
    _$jscoverage['/kissy.js'].lineData[141]++;
    cfg = configFns[configName];
    _$jscoverage['/kissy.js'].lineData[142]++;
    if (visit33_142_1(configValue === undefined)) {
      _$jscoverage['/kissy.js'].lineData[143]++;
      if (visit34_143_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[144]++;
        r = cfg.call(self);
      } else {
        _$jscoverage['/kissy.js'].lineData[146]++;
        r = Config[configName];
      }
    } else {
      _$jscoverage['/kissy.js'].lineData[149]++;
      if (visit35_149_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[150]++;
        r = cfg.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[152]++;
        Config[configName] = configValue;
      }
    }
  }
  _$jscoverage['/kissy.js'].lineData[156]++;
  return r;
}, 
  log: function(msg, cat, logger) {
  _$jscoverage['/kissy.js'].functionData[3]++;
  _$jscoverage['/kissy.js'].lineData[167]++;
  if (visit36_167_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[168]++;
    var matched = 1;
    _$jscoverage['/kissy.js'].lineData[169]++;
    if (visit37_169_1(logger)) {
      _$jscoverage['/kissy.js'].lineData[170]++;
      var loggerCfg = visit38_170_1(S.Config.logger || {}), list, i, l, level, minLevel, maxLevel, reg;
      _$jscoverage['/kissy.js'].lineData[172]++;
      cat = visit39_172_1(cat || 'debug');
      _$jscoverage['/kissy.js'].lineData[173]++;
      level = visit40_173_1(loggerLevel[cat] || loggerLevel['debug']);
      _$jscoverage['/kissy.js'].lineData[174]++;
      if (visit41_174_1(list = loggerCfg.includes)) {
        _$jscoverage['/kissy.js'].lineData[175]++;
        matched = 0;
        _$jscoverage['/kissy.js'].lineData[176]++;
        for (i = 0; visit42_176_1(i < list.length); i++) {
          _$jscoverage['/kissy.js'].lineData[177]++;
          l = list[i];
          _$jscoverage['/kissy.js'].lineData[178]++;
          reg = l.logger;
          _$jscoverage['/kissy.js'].lineData[179]++;
          maxLevel = visit43_179_1(loggerLevel[l.maxLevel] || loggerLevel['error']);
          _$jscoverage['/kissy.js'].lineData[180]++;
          minLevel = visit44_180_1(loggerLevel[l.minLevel] || loggerLevel['debug']);
          _$jscoverage['/kissy.js'].lineData[181]++;
          if (visit45_181_1(visit46_181_2(minLevel <= level) && visit47_181_3(visit48_181_4(maxLevel >= level) && logger.match(reg)))) {
            _$jscoverage['/kissy.js'].lineData[182]++;
            matched = 1;
            _$jscoverage['/kissy.js'].lineData[183]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kissy.js'].lineData[186]++;
        if (visit49_186_1(list = loggerCfg.excludes)) {
          _$jscoverage['/kissy.js'].lineData[187]++;
          matched = 1;
          _$jscoverage['/kissy.js'].lineData[188]++;
          for (i = 0; visit50_188_1(i < list.length); i++) {
            _$jscoverage['/kissy.js'].lineData[189]++;
            l = list[i];
            _$jscoverage['/kissy.js'].lineData[190]++;
            reg = l.logger;
            _$jscoverage['/kissy.js'].lineData[191]++;
            maxLevel = visit51_191_1(loggerLevel[l.maxLevel] || loggerLevel['error']);
            _$jscoverage['/kissy.js'].lineData[192]++;
            minLevel = visit52_192_1(loggerLevel[l.minLevel] || loggerLevel['debug']);
            _$jscoverage['/kissy.js'].lineData[193]++;
            if (visit53_193_1(visit54_193_2(minLevel <= level) && visit55_193_3(visit56_193_4(maxLevel >= level) && logger.match(reg)))) {
              _$jscoverage['/kissy.js'].lineData[194]++;
              matched = 0;
              _$jscoverage['/kissy.js'].lineData[195]++;
              break;
            }
          }
        }
      }
      _$jscoverage['/kissy.js'].lineData[199]++;
      if (visit57_199_1(matched)) {
        _$jscoverage['/kissy.js'].lineData[200]++;
        msg = logger + ': ' + msg;
      }
    }
    _$jscoverage['/kissy.js'].lineData[203]++;
    if (visit58_203_1(visit59_203_2(host['console'] !== undefined) && visit60_203_3(console.log && matched))) {
      _$jscoverage['/kissy.js'].lineData[204]++;
      console[visit61_204_1(cat && console[cat]) ? cat : 'log'](msg);
      _$jscoverage['/kissy.js'].lineData[205]++;
      return msg;
    }
  }
  _$jscoverage['/kissy.js'].lineData[208]++;
  return undefined;
}, 
  'getLogger': function(logger) {
  _$jscoverage['/kissy.js'].functionData[4]++;
  _$jscoverage['/kissy.js'].lineData[217]++;
  return getLogger(logger);
}, 
  error: function(msg) {
  _$jscoverage['/kissy.js'].functionData[5]++;
  _$jscoverage['/kissy.js'].lineData[224]++;
  if (visit62_224_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[226]++;
    throw msg instanceof Error ? msg : new Error(msg);
  }
}, 
  guid: function(pre) {
  _$jscoverage['/kissy.js'].functionData[6]++;
  _$jscoverage['/kissy.js'].lineData[236]++;
  return (visit63_236_1(pre || EMPTY)) + guid++;
}};
  _$jscoverage['/kissy.js'].lineData[240]++;
  if (visit64_240_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[241]++;
    S.Config.logger = {
  excludes: [{
  logger: /^s\/.*/, 
  maxLevel: 'info', 
  minLevel: 'debug'}]};
    _$jscoverage['/kissy.js'].lineData[256]++;
    function Logger() {
      _$jscoverage['/kissy.js'].functionData[7]++;
    }    _$jscoverage['/kissy.js'].lineData[265]++;
    Logger.prototype.debug = function(str) {
  _$jscoverage['/kissy.js'].functionData[8]++;
};
    _$jscoverage['/kissy.js'].lineData[272]++;
    Logger.prototype.info = function(str) {
  _$jscoverage['/kissy.js'].functionData[9]++;
};
    _$jscoverage['/kissy.js'].lineData[279]++;
    Logger.prototype.warn = function(str) {
  _$jscoverage['/kissy.js'].functionData[10]++;
};
    _$jscoverage['/kissy.js'].lineData[286]++;
    Logger.prototype.error = function(str) {
  _$jscoverage['/kissy.js'].functionData[11]++;
};
  }
  _$jscoverage['/kissy.js'].lineData[290]++;
  function getLogger(logger) {
    _$jscoverage['/kissy.js'].functionData[12]++;
    _$jscoverage['/kissy.js'].lineData[291]++;
    var obj = {};
    _$jscoverage['/kissy.js'].lineData[292]++;
    S.each(loggerLevel, function(_, cat) {
  _$jscoverage['/kissy.js'].functionData[13]++;
  _$jscoverage['/kissy.js'].lineData[293]++;
  obj[cat] = function(msg) {
  _$jscoverage['/kissy.js'].functionData[14]++;
  _$jscoverage['/kissy.js'].lineData[294]++;
  return S.log(msg, cat, logger);
};
});
    _$jscoverage['/kissy.js'].lineData[297]++;
    return obj;
  }
  _$jscoverage['/kissy.js'].lineData[305]++;
  S.Logger = {};
  _$jscoverage['/kissy.js'].lineData[307]++;
  S.Logger.Level = {
  'DEBUG': 'debug', 
  INFO: 'info', 
  WARN: 'warn', 
  ERROR: 'error'};
  _$jscoverage['/kissy.js'].lineData[326]++;
  return S;
})();
