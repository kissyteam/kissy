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
  _$jscoverage['/kissy.js'].lineData[26] = 0;
  _$jscoverage['/kissy.js'].lineData[27] = 0;
  _$jscoverage['/kissy.js'].lineData[32] = 0;
  _$jscoverage['/kissy.js'].lineData[33] = 0;
  _$jscoverage['/kissy.js'].lineData[34] = 0;
  _$jscoverage['/kissy.js'].lineData[36] = 0;
  _$jscoverage['/kissy.js'].lineData[37] = 0;
  _$jscoverage['/kissy.js'].lineData[38] = 0;
  _$jscoverage['/kissy.js'].lineData[42] = 0;
  _$jscoverage['/kissy.js'].lineData[45] = 0;
  _$jscoverage['/kissy.js'].lineData[52] = 0;
  _$jscoverage['/kissy.js'].lineData[135] = 0;
  _$jscoverage['/kissy.js'].lineData[141] = 0;
  _$jscoverage['/kissy.js'].lineData[142] = 0;
  _$jscoverage['/kissy.js'].lineData[143] = 0;
  _$jscoverage['/kissy.js'].lineData[144] = 0;
  _$jscoverage['/kissy.js'].lineData[145] = 0;
  _$jscoverage['/kissy.js'].lineData[147] = 0;
  _$jscoverage['/kissy.js'].lineData[150] = 0;
  _$jscoverage['/kissy.js'].lineData[151] = 0;
  _$jscoverage['/kissy.js'].lineData[153] = 0;
  _$jscoverage['/kissy.js'].lineData[157] = 0;
  _$jscoverage['/kissy.js'].lineData[158] = 0;
  _$jscoverage['/kissy.js'].lineData[159] = 0;
  _$jscoverage['/kissy.js'].lineData[160] = 0;
  _$jscoverage['/kissy.js'].lineData[161] = 0;
  _$jscoverage['/kissy.js'].lineData[163] = 0;
  _$jscoverage['/kissy.js'].lineData[167] = 0;
  _$jscoverage['/kissy.js'].lineData[178] = 0;
  _$jscoverage['/kissy.js'].lineData[179] = 0;
  _$jscoverage['/kissy.js'].lineData[180] = 0;
  _$jscoverage['/kissy.js'].lineData[181] = 0;
  _$jscoverage['/kissy.js'].lineData[183] = 0;
  _$jscoverage['/kissy.js'].lineData[184] = 0;
  _$jscoverage['/kissy.js'].lineData[185] = 0;
  _$jscoverage['/kissy.js'].lineData[186] = 0;
  _$jscoverage['/kissy.js'].lineData[187] = 0;
  _$jscoverage['/kissy.js'].lineData[188] = 0;
  _$jscoverage['/kissy.js'].lineData[189] = 0;
  _$jscoverage['/kissy.js'].lineData[190] = 0;
  _$jscoverage['/kissy.js'].lineData[191] = 0;
  _$jscoverage['/kissy.js'].lineData[192] = 0;
  _$jscoverage['/kissy.js'].lineData[193] = 0;
  _$jscoverage['/kissy.js'].lineData[194] = 0;
  _$jscoverage['/kissy.js'].lineData[197] = 0;
  _$jscoverage['/kissy.js'].lineData[198] = 0;
  _$jscoverage['/kissy.js'].lineData[199] = 0;
  _$jscoverage['/kissy.js'].lineData[200] = 0;
  _$jscoverage['/kissy.js'].lineData[201] = 0;
  _$jscoverage['/kissy.js'].lineData[202] = 0;
  _$jscoverage['/kissy.js'].lineData[203] = 0;
  _$jscoverage['/kissy.js'].lineData[204] = 0;
  _$jscoverage['/kissy.js'].lineData[205] = 0;
  _$jscoverage['/kissy.js'].lineData[206] = 0;
  _$jscoverage['/kissy.js'].lineData[210] = 0;
  _$jscoverage['/kissy.js'].lineData[211] = 0;
  _$jscoverage['/kissy.js'].lineData[215] = 0;
  _$jscoverage['/kissy.js'].lineData[216] = 0;
  _$jscoverage['/kissy.js'].lineData[217] = 0;
  _$jscoverage['/kissy.js'].lineData[219] = 0;
  _$jscoverage['/kissy.js'].lineData[222] = 0;
  _$jscoverage['/kissy.js'].lineData[231] = 0;
  _$jscoverage['/kissy.js'].lineData[238] = 0;
  _$jscoverage['/kissy.js'].lineData[240] = 0;
  _$jscoverage['/kissy.js'].lineData[250] = 0;
  _$jscoverage['/kissy.js'].lineData[254] = 0;
  _$jscoverage['/kissy.js'].lineData[255] = 0;
  _$jscoverage['/kissy.js'].lineData[298] = 0;
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
}
if (! _$jscoverage['/kissy.js'].branchData) {
  _$jscoverage['/kissy.js'].branchData = {};
  _$jscoverage['/kissy.js'].branchData['141'] = [];
  _$jscoverage['/kissy.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['143'] = [];
  _$jscoverage['/kissy.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['144'] = [];
  _$jscoverage['/kissy.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['150'] = [];
  _$jscoverage['/kissy.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['160'] = [];
  _$jscoverage['/kissy.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['178'] = [];
  _$jscoverage['/kissy.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['180'] = [];
  _$jscoverage['/kissy.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['181'] = [];
  _$jscoverage['/kissy.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['183'] = [];
  _$jscoverage['/kissy.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['184'] = [];
  _$jscoverage['/kissy.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['187'] = [];
  _$jscoverage['/kissy.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['190'] = [];
  _$jscoverage['/kissy.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['191'] = [];
  _$jscoverage['/kissy.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'] = [];
  _$jscoverage['/kissy.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['199'] = [];
  _$jscoverage['/kissy.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['202'] = [];
  _$jscoverage['/kissy.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['203'] = [];
  _$jscoverage['/kissy.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['204'] = [];
  _$jscoverage['/kissy.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['204'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['204'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['210'] = [];
  _$jscoverage['/kissy.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['215'] = [];
  _$jscoverage['/kissy.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['216'] = [];
  _$jscoverage['/kissy.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['216'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['217'] = [];
  _$jscoverage['/kissy.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['238'] = [];
  _$jscoverage['/kissy.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['250'] = [];
  _$jscoverage['/kissy.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['254'] = [];
  _$jscoverage['/kissy.js'].branchData['254'][1] = new BranchData();
}
_$jscoverage['/kissy.js'].branchData['254'][1].init(8743, 9, '\'@DEBUG@\'');
function visit206_254_1(result) {
  _$jscoverage['/kissy.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['250'][1].init(22, 12, 'pre || EMPTY');
function visit205_250_1(result) {
  _$jscoverage['/kissy.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['238'][1].init(18, 9, '\'@DEBUG@\'');
function visit204_238_1(result) {
  _$jscoverage['/kissy.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['217'][1].init(34, 19, 'cat && console[cat]');
function visit203_217_1(result) {
  _$jscoverage['/kissy.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['216'][2].init(26, 30, 'typeof console !== \'undefined\'');
function visit202_216_2(result) {
  _$jscoverage['/kissy.js'].branchData['216'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['216'][1].init(26, 45, 'typeof console !== \'undefined\' && console.log');
function visit201_216_1(result) {
  _$jscoverage['/kissy.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['215'][1].init(1831, 7, 'matched');
function visit200_215_1(result) {
  _$jscoverage['/kissy.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['210'][1].init(1604, 7, 'matched');
function visit199_210_1(result) {
  _$jscoverage['/kissy.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['204'][4].init(314, 17, 'maxLevel >= level');
function visit198_204_4(result) {
  _$jscoverage['/kissy.js'].branchData['204'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['204'][3].init(314, 38, 'maxLevel >= level && logger.match(reg)');
function visit197_204_3(result) {
  _$jscoverage['/kissy.js'].branchData['204'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['204'][2].init(293, 17, 'minLevel <= level');
function visit196_204_2(result) {
  _$jscoverage['/kissy.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['204'][1].init(293, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit195_204_1(result) {
  _$jscoverage['/kissy.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['203'][1].init(214, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit194_203_1(result) {
  _$jscoverage['/kissy.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['202'][1].init(128, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit193_202_1(result) {
  _$jscoverage['/kissy.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['199'][1].init(76, 15, 'i < list.length');
function visit192_199_1(result) {
  _$jscoverage['/kissy.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][4].init(314, 17, 'maxLevel >= level');
function visit191_192_4(result) {
  _$jscoverage['/kissy.js'].branchData['192'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][3].init(314, 38, 'maxLevel >= level && logger.match(reg)');
function visit190_192_3(result) {
  _$jscoverage['/kissy.js'].branchData['192'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][2].init(293, 17, 'minLevel <= level');
function visit189_192_2(result) {
  _$jscoverage['/kissy.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][1].init(293, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit188_192_1(result) {
  _$jscoverage['/kissy.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['191'][1].init(214, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit187_191_1(result) {
  _$jscoverage['/kissy.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['190'][1].init(128, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit186_190_1(result) {
  _$jscoverage['/kissy.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['187'][1].init(76, 15, 'i < list.length');
function visit185_187_1(result) {
  _$jscoverage['/kissy.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['184'][1].init(202, 37, 'loggerLevel[cat] || loggerLevel.debug');
function visit184_184_1(result) {
  _$jscoverage['/kissy.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['183'][1].init(157, 14, 'cat || \'debug\'');
function visit183_183_1(result) {
  _$jscoverage['/kissy.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['181'][1].init(38, 21, 'S.Config.logger || {}');
function visit182_181_1(result) {
  _$jscoverage['/kissy.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['180'][1].init(56, 6, 'logger');
function visit181_180_1(result) {
  _$jscoverage['/kissy.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['178'][1].init(18, 9, '\'@DEBUG@\'');
function visit180_178_1(result) {
  _$jscoverage['/kissy.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['160'][1].init(116, 2, 'fn');
function visit179_160_1(result) {
  _$jscoverage['/kissy.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['150'][1].init(26, 3, 'cfg');
function visit178_150_1(result) {
  _$jscoverage['/kissy.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['144'][1].init(26, 3, 'cfg');
function visit177_144_1(result) {
  _$jscoverage['/kissy.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['143'][1].init(68, 25, 'configValue === undefined');
function visit176_143_1(result) {
  _$jscoverage['/kissy.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['141'][1].init(188, 30, 'typeof configName === \'string\'');
function visit175_141_1(result) {
  _$jscoverage['/kissy.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].lineData[26]++;
var KISSY = (function(undefined) {
  _$jscoverage['/kissy.js'].functionData[0]++;
  _$jscoverage['/kissy.js'].lineData[27]++;
  var self = this, S, guid = 0, EMPTY = '';
  _$jscoverage['/kissy.js'].lineData[32]++;
  function getLogger(logger) {
    _$jscoverage['/kissy.js'].functionData[1]++;
    _$jscoverage['/kissy.js'].lineData[33]++;
    var obj = {};
    _$jscoverage['/kissy.js'].lineData[34]++;
    for (var cat in loggerLevel) {
      _$jscoverage['/kissy.js'].lineData[36]++;
      (function(obj, cat) {
  _$jscoverage['/kissy.js'].functionData[2]++;
  _$jscoverage['/kissy.js'].lineData[37]++;
  obj[cat] = function(msg) {
  _$jscoverage['/kissy.js'].functionData[3]++;
  _$jscoverage['/kissy.js'].lineData[38]++;
  return S.log(msg, cat, logger);
};
})(obj, cat);
    }
    _$jscoverage['/kissy.js'].lineData[42]++;
    return obj;
  }
  _$jscoverage['/kissy.js'].lineData[45]++;
  var loggerLevel = {
  debug: 10, 
  info: 20, 
  warn: 30, 
  error: 40};
  _$jscoverage['/kissy.js'].lineData[52]++;
  S = {
  __BUILD_TIME: '@TIMESTAMP@', 
  Env: {
  host: self}, 
  Config: {
  debug: '@DEBUG@', 
  fns: {}}, 
  version: '@VERSION@', 
  config: function(configName, configValue) {
  _$jscoverage['/kissy.js'].functionData[4]++;
  _$jscoverage['/kissy.js'].lineData[135]++;
  var cfg, r, self = this, fn, Config = S.Config, configFns = Config.fns;
  _$jscoverage['/kissy.js'].lineData[141]++;
  if (visit175_141_1(typeof configName === 'string')) {
    _$jscoverage['/kissy.js'].lineData[142]++;
    cfg = configFns[configName];
    _$jscoverage['/kissy.js'].lineData[143]++;
    if (visit176_143_1(configValue === undefined)) {
      _$jscoverage['/kissy.js'].lineData[144]++;
      if (visit177_144_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[145]++;
        r = cfg.call(self);
      } else {
        _$jscoverage['/kissy.js'].lineData[147]++;
        r = Config[configName];
      }
    } else {
      _$jscoverage['/kissy.js'].lineData[150]++;
      if (visit178_150_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[151]++;
        r = cfg.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[153]++;
        Config[configName] = configValue;
      }
    }
  } else {
    _$jscoverage['/kissy.js'].lineData[157]++;
    for (var p in configName) {
      _$jscoverage['/kissy.js'].lineData[158]++;
      configValue = configName[p];
      _$jscoverage['/kissy.js'].lineData[159]++;
      fn = configFns[p];
      _$jscoverage['/kissy.js'].lineData[160]++;
      if (visit179_160_1(fn)) {
        _$jscoverage['/kissy.js'].lineData[161]++;
        fn.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[163]++;
        Config[p] = configValue;
      }
    }
  }
  _$jscoverage['/kissy.js'].lineData[167]++;
  return r;
}, 
  log: function(msg, cat, logger) {
  _$jscoverage['/kissy.js'].functionData[5]++;
  _$jscoverage['/kissy.js'].lineData[178]++;
  if (visit180_178_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[179]++;
    var matched = 1;
    _$jscoverage['/kissy.js'].lineData[180]++;
    if (visit181_180_1(logger)) {
      _$jscoverage['/kissy.js'].lineData[181]++;
      var loggerCfg = visit182_181_1(S.Config.logger || {}), list, i, l, level, minLevel, maxLevel, reg;
      _$jscoverage['/kissy.js'].lineData[183]++;
      cat = visit183_183_1(cat || 'debug');
      _$jscoverage['/kissy.js'].lineData[184]++;
      level = visit184_184_1(loggerLevel[cat] || loggerLevel.debug);
      _$jscoverage['/kissy.js'].lineData[185]++;
      if ((list = loggerCfg.includes)) {
        _$jscoverage['/kissy.js'].lineData[186]++;
        matched = 0;
        _$jscoverage['/kissy.js'].lineData[187]++;
        for (i = 0; visit185_187_1(i < list.length); i++) {
          _$jscoverage['/kissy.js'].lineData[188]++;
          l = list[i];
          _$jscoverage['/kissy.js'].lineData[189]++;
          reg = l.logger;
          _$jscoverage['/kissy.js'].lineData[190]++;
          maxLevel = visit186_190_1(loggerLevel[l.maxLevel] || loggerLevel.error);
          _$jscoverage['/kissy.js'].lineData[191]++;
          minLevel = visit187_191_1(loggerLevel[l.minLevel] || loggerLevel.debug);
          _$jscoverage['/kissy.js'].lineData[192]++;
          if (visit188_192_1(visit189_192_2(minLevel <= level) && visit190_192_3(visit191_192_4(maxLevel >= level) && logger.match(reg)))) {
            _$jscoverage['/kissy.js'].lineData[193]++;
            matched = 1;
            _$jscoverage['/kissy.js'].lineData[194]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kissy.js'].lineData[197]++;
        if ((list = loggerCfg.excludes)) {
          _$jscoverage['/kissy.js'].lineData[198]++;
          matched = 1;
          _$jscoverage['/kissy.js'].lineData[199]++;
          for (i = 0; visit192_199_1(i < list.length); i++) {
            _$jscoverage['/kissy.js'].lineData[200]++;
            l = list[i];
            _$jscoverage['/kissy.js'].lineData[201]++;
            reg = l.logger;
            _$jscoverage['/kissy.js'].lineData[202]++;
            maxLevel = visit193_202_1(loggerLevel[l.maxLevel] || loggerLevel.error);
            _$jscoverage['/kissy.js'].lineData[203]++;
            minLevel = visit194_203_1(loggerLevel[l.minLevel] || loggerLevel.debug);
            _$jscoverage['/kissy.js'].lineData[204]++;
            if (visit195_204_1(visit196_204_2(minLevel <= level) && visit197_204_3(visit198_204_4(maxLevel >= level) && logger.match(reg)))) {
              _$jscoverage['/kissy.js'].lineData[205]++;
              matched = 0;
              _$jscoverage['/kissy.js'].lineData[206]++;
              break;
            }
          }
        }
      }
      _$jscoverage['/kissy.js'].lineData[210]++;
      if (visit199_210_1(matched)) {
        _$jscoverage['/kissy.js'].lineData[211]++;
        msg = logger + ': ' + msg;
      }
    }
    _$jscoverage['/kissy.js'].lineData[215]++;
    if (visit200_215_1(matched)) {
      _$jscoverage['/kissy.js'].lineData[216]++;
      if (visit201_216_1(visit202_216_2(typeof console !== 'undefined') && console.log)) {
        _$jscoverage['/kissy.js'].lineData[217]++;
        console[visit203_217_1(cat && console[cat]) ? cat : 'log'](msg);
      }
      _$jscoverage['/kissy.js'].lineData[219]++;
      return msg;
    }
  }
  _$jscoverage['/kissy.js'].lineData[222]++;
  return undefined;
}, 
  getLogger: function(logger) {
  _$jscoverage['/kissy.js'].functionData[6]++;
  _$jscoverage['/kissy.js'].lineData[231]++;
  return getLogger(logger);
}, 
  error: function(msg) {
  _$jscoverage['/kissy.js'].functionData[7]++;
  _$jscoverage['/kissy.js'].lineData[238]++;
  if (visit204_238_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[240]++;
    throw msg instanceof Error ? msg : new Error(msg);
  }
}, 
  guid: function(pre) {
  _$jscoverage['/kissy.js'].functionData[8]++;
  _$jscoverage['/kissy.js'].lineData[250]++;
  return (visit205_250_1(pre || EMPTY)) + guid++;
}};
  _$jscoverage['/kissy.js'].lineData[254]++;
  if (visit206_254_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[255]++;
    S.Config.logger = {
  excludes: [{
  logger: /^s\/.*/, 
  maxLevel: 'info', 
  minLevel: 'debug'}]};
  }
  _$jscoverage['/kissy.js'].lineData[298]++;
  return S;
})();
