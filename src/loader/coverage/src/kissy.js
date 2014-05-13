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
  _$jscoverage['/kissy.js'].lineData[137] = 0;
  _$jscoverage['/kissy.js'].lineData[143] = 0;
  _$jscoverage['/kissy.js'].lineData[144] = 0;
  _$jscoverage['/kissy.js'].lineData[145] = 0;
  _$jscoverage['/kissy.js'].lineData[146] = 0;
  _$jscoverage['/kissy.js'].lineData[147] = 0;
  _$jscoverage['/kissy.js'].lineData[149] = 0;
  _$jscoverage['/kissy.js'].lineData[152] = 0;
  _$jscoverage['/kissy.js'].lineData[153] = 0;
  _$jscoverage['/kissy.js'].lineData[155] = 0;
  _$jscoverage['/kissy.js'].lineData[159] = 0;
  _$jscoverage['/kissy.js'].lineData[160] = 0;
  _$jscoverage['/kissy.js'].lineData[161] = 0;
  _$jscoverage['/kissy.js'].lineData[162] = 0;
  _$jscoverage['/kissy.js'].lineData[163] = 0;
  _$jscoverage['/kissy.js'].lineData[165] = 0;
  _$jscoverage['/kissy.js'].lineData[169] = 0;
  _$jscoverage['/kissy.js'].lineData[180] = 0;
  _$jscoverage['/kissy.js'].lineData[181] = 0;
  _$jscoverage['/kissy.js'].lineData[182] = 0;
  _$jscoverage['/kissy.js'].lineData[183] = 0;
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
  _$jscoverage['/kissy.js'].lineData[195] = 0;
  _$jscoverage['/kissy.js'].lineData[196] = 0;
  _$jscoverage['/kissy.js'].lineData[199] = 0;
  _$jscoverage['/kissy.js'].lineData[200] = 0;
  _$jscoverage['/kissy.js'].lineData[201] = 0;
  _$jscoverage['/kissy.js'].lineData[202] = 0;
  _$jscoverage['/kissy.js'].lineData[203] = 0;
  _$jscoverage['/kissy.js'].lineData[204] = 0;
  _$jscoverage['/kissy.js'].lineData[205] = 0;
  _$jscoverage['/kissy.js'].lineData[206] = 0;
  _$jscoverage['/kissy.js'].lineData[207] = 0;
  _$jscoverage['/kissy.js'].lineData[208] = 0;
  _$jscoverage['/kissy.js'].lineData[212] = 0;
  _$jscoverage['/kissy.js'].lineData[213] = 0;
  _$jscoverage['/kissy.js'].lineData[217] = 0;
  _$jscoverage['/kissy.js'].lineData[218] = 0;
  _$jscoverage['/kissy.js'].lineData[219] = 0;
  _$jscoverage['/kissy.js'].lineData[221] = 0;
  _$jscoverage['/kissy.js'].lineData[224] = 0;
  _$jscoverage['/kissy.js'].lineData[233] = 0;
  _$jscoverage['/kissy.js'].lineData[240] = 0;
  _$jscoverage['/kissy.js'].lineData[242] = 0;
  _$jscoverage['/kissy.js'].lineData[252] = 0;
  _$jscoverage['/kissy.js'].lineData[256] = 0;
  _$jscoverage['/kissy.js'].lineData[257] = 0;
  _$jscoverage['/kissy.js'].lineData[300] = 0;
  _$jscoverage['/kissy.js'].lineData[306] = 0;
  _$jscoverage['/kissy.js'].lineData[321] = 0;
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
  _$jscoverage['/kissy.js'].branchData['143'] = [];
  _$jscoverage['/kissy.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['145'] = [];
  _$jscoverage['/kissy.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['146'] = [];
  _$jscoverage['/kissy.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['152'] = [];
  _$jscoverage['/kissy.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['162'] = [];
  _$jscoverage['/kissy.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['180'] = [];
  _$jscoverage['/kissy.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['182'] = [];
  _$jscoverage['/kissy.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['183'] = [];
  _$jscoverage['/kissy.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['185'] = [];
  _$jscoverage['/kissy.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['186'] = [];
  _$jscoverage['/kissy.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['189'] = [];
  _$jscoverage['/kissy.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'] = [];
  _$jscoverage['/kissy.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['193'] = [];
  _$jscoverage['/kissy.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['194'] = [];
  _$jscoverage['/kissy.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['194'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['194'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['201'] = [];
  _$jscoverage['/kissy.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['204'] = [];
  _$jscoverage['/kissy.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['205'] = [];
  _$jscoverage['/kissy.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['206'] = [];
  _$jscoverage['/kissy.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['206'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['206'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['206'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['212'] = [];
  _$jscoverage['/kissy.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['217'] = [];
  _$jscoverage['/kissy.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['218'] = [];
  _$jscoverage['/kissy.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['218'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['219'] = [];
  _$jscoverage['/kissy.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['240'] = [];
  _$jscoverage['/kissy.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['252'] = [];
  _$jscoverage['/kissy.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['256'] = [];
  _$jscoverage['/kissy.js'].branchData['256'][1] = new BranchData();
}
_$jscoverage['/kissy.js'].branchData['256'][1].init(8793, 9, '\'@DEBUG@\'');
function visit215_256_1(result) {
  _$jscoverage['/kissy.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['252'][1].init(22, 12, 'pre || EMPTY');
function visit214_252_1(result) {
  _$jscoverage['/kissy.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['240'][1].init(18, 9, '\'@DEBUG@\'');
function visit213_240_1(result) {
  _$jscoverage['/kissy.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['219'][1].init(34, 19, 'cat && console[cat]');
function visit212_219_1(result) {
  _$jscoverage['/kissy.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['218'][2].init(26, 30, 'typeof console !== \'undefined\'');
function visit211_218_2(result) {
  _$jscoverage['/kissy.js'].branchData['218'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['218'][1].init(26, 45, 'typeof console !== \'undefined\' && console.log');
function visit210_218_1(result) {
  _$jscoverage['/kissy.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['217'][1].init(1831, 7, 'matched');
function visit209_217_1(result) {
  _$jscoverage['/kissy.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['212'][1].init(1604, 7, 'matched');
function visit208_212_1(result) {
  _$jscoverage['/kissy.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['206'][4].init(314, 17, 'maxLevel >= level');
function visit207_206_4(result) {
  _$jscoverage['/kissy.js'].branchData['206'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['206'][3].init(314, 38, 'maxLevel >= level && logger.match(reg)');
function visit206_206_3(result) {
  _$jscoverage['/kissy.js'].branchData['206'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['206'][2].init(293, 17, 'minLevel <= level');
function visit205_206_2(result) {
  _$jscoverage['/kissy.js'].branchData['206'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['206'][1].init(293, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit204_206_1(result) {
  _$jscoverage['/kissy.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['205'][1].init(214, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit203_205_1(result) {
  _$jscoverage['/kissy.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['204'][1].init(128, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit202_204_1(result) {
  _$jscoverage['/kissy.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['201'][1].init(76, 15, 'i < list.length');
function visit201_201_1(result) {
  _$jscoverage['/kissy.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['194'][4].init(314, 17, 'maxLevel >= level');
function visit200_194_4(result) {
  _$jscoverage['/kissy.js'].branchData['194'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['194'][3].init(314, 38, 'maxLevel >= level && logger.match(reg)');
function visit199_194_3(result) {
  _$jscoverage['/kissy.js'].branchData['194'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['194'][2].init(293, 17, 'minLevel <= level');
function visit198_194_2(result) {
  _$jscoverage['/kissy.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['194'][1].init(293, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit197_194_1(result) {
  _$jscoverage['/kissy.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['193'][1].init(214, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit196_193_1(result) {
  _$jscoverage['/kissy.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][1].init(128, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit195_192_1(result) {
  _$jscoverage['/kissy.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['189'][1].init(76, 15, 'i < list.length');
function visit194_189_1(result) {
  _$jscoverage['/kissy.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['186'][1].init(202, 37, 'loggerLevel[cat] || loggerLevel.debug');
function visit193_186_1(result) {
  _$jscoverage['/kissy.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['185'][1].init(157, 14, 'cat || \'debug\'');
function visit192_185_1(result) {
  _$jscoverage['/kissy.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['183'][1].init(38, 21, 'S.Config.logger || {}');
function visit191_183_1(result) {
  _$jscoverage['/kissy.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['182'][1].init(56, 6, 'logger');
function visit190_182_1(result) {
  _$jscoverage['/kissy.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['180'][1].init(18, 9, '\'@DEBUG@\'');
function visit189_180_1(result) {
  _$jscoverage['/kissy.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['162'][1].init(116, 2, 'fn');
function visit188_162_1(result) {
  _$jscoverage['/kissy.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['152'][1].init(26, 3, 'cfg');
function visit187_152_1(result) {
  _$jscoverage['/kissy.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['146'][1].init(26, 3, 'cfg');
function visit186_146_1(result) {
  _$jscoverage['/kissy.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['145'][1].init(68, 25, 'configValue === undefined');
function visit185_145_1(result) {
  _$jscoverage['/kissy.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['143'][1].init(188, 30, 'typeof configName === \'string\'');
function visit184_143_1(result) {
  _$jscoverage['/kissy.js'].branchData['143'][1].ranCondition(result);
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
  host: self, 
  mods: {}}, 
  Config: {
  debug: '@DEBUG@', 
  packages: {}, 
  fns: {}}, 
  version: '@VERSION@', 
  config: function(configName, configValue) {
  _$jscoverage['/kissy.js'].functionData[4]++;
  _$jscoverage['/kissy.js'].lineData[137]++;
  var cfg, r, self = this, fn, Config = S.Config, configFns = Config.fns;
  _$jscoverage['/kissy.js'].lineData[143]++;
  if (visit184_143_1(typeof configName === 'string')) {
    _$jscoverage['/kissy.js'].lineData[144]++;
    cfg = configFns[configName];
    _$jscoverage['/kissy.js'].lineData[145]++;
    if (visit185_145_1(configValue === undefined)) {
      _$jscoverage['/kissy.js'].lineData[146]++;
      if (visit186_146_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[147]++;
        r = cfg.call(self);
      } else {
        _$jscoverage['/kissy.js'].lineData[149]++;
        r = Config[configName];
      }
    } else {
      _$jscoverage['/kissy.js'].lineData[152]++;
      if (visit187_152_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[153]++;
        r = cfg.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[155]++;
        Config[configName] = configValue;
      }
    }
  } else {
    _$jscoverage['/kissy.js'].lineData[159]++;
    for (var p in configName) {
      _$jscoverage['/kissy.js'].lineData[160]++;
      configValue = configName[p];
      _$jscoverage['/kissy.js'].lineData[161]++;
      fn = configFns[p];
      _$jscoverage['/kissy.js'].lineData[162]++;
      if (visit188_162_1(fn)) {
        _$jscoverage['/kissy.js'].lineData[163]++;
        fn.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[165]++;
        Config[p] = configValue;
      }
    }
  }
  _$jscoverage['/kissy.js'].lineData[169]++;
  return r;
}, 
  log: function(msg, cat, logger) {
  _$jscoverage['/kissy.js'].functionData[5]++;
  _$jscoverage['/kissy.js'].lineData[180]++;
  if (visit189_180_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[181]++;
    var matched = 1;
    _$jscoverage['/kissy.js'].lineData[182]++;
    if (visit190_182_1(logger)) {
      _$jscoverage['/kissy.js'].lineData[183]++;
      var loggerCfg = visit191_183_1(S.Config.logger || {}), list, i, l, level, minLevel, maxLevel, reg;
      _$jscoverage['/kissy.js'].lineData[185]++;
      cat = visit192_185_1(cat || 'debug');
      _$jscoverage['/kissy.js'].lineData[186]++;
      level = visit193_186_1(loggerLevel[cat] || loggerLevel.debug);
      _$jscoverage['/kissy.js'].lineData[187]++;
      if ((list = loggerCfg.includes)) {
        _$jscoverage['/kissy.js'].lineData[188]++;
        matched = 0;
        _$jscoverage['/kissy.js'].lineData[189]++;
        for (i = 0; visit194_189_1(i < list.length); i++) {
          _$jscoverage['/kissy.js'].lineData[190]++;
          l = list[i];
          _$jscoverage['/kissy.js'].lineData[191]++;
          reg = l.logger;
          _$jscoverage['/kissy.js'].lineData[192]++;
          maxLevel = visit195_192_1(loggerLevel[l.maxLevel] || loggerLevel.error);
          _$jscoverage['/kissy.js'].lineData[193]++;
          minLevel = visit196_193_1(loggerLevel[l.minLevel] || loggerLevel.debug);
          _$jscoverage['/kissy.js'].lineData[194]++;
          if (visit197_194_1(visit198_194_2(minLevel <= level) && visit199_194_3(visit200_194_4(maxLevel >= level) && logger.match(reg)))) {
            _$jscoverage['/kissy.js'].lineData[195]++;
            matched = 1;
            _$jscoverage['/kissy.js'].lineData[196]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kissy.js'].lineData[199]++;
        if ((list = loggerCfg.excludes)) {
          _$jscoverage['/kissy.js'].lineData[200]++;
          matched = 1;
          _$jscoverage['/kissy.js'].lineData[201]++;
          for (i = 0; visit201_201_1(i < list.length); i++) {
            _$jscoverage['/kissy.js'].lineData[202]++;
            l = list[i];
            _$jscoverage['/kissy.js'].lineData[203]++;
            reg = l.logger;
            _$jscoverage['/kissy.js'].lineData[204]++;
            maxLevel = visit202_204_1(loggerLevel[l.maxLevel] || loggerLevel.error);
            _$jscoverage['/kissy.js'].lineData[205]++;
            minLevel = visit203_205_1(loggerLevel[l.minLevel] || loggerLevel.debug);
            _$jscoverage['/kissy.js'].lineData[206]++;
            if (visit204_206_1(visit205_206_2(minLevel <= level) && visit206_206_3(visit207_206_4(maxLevel >= level) && logger.match(reg)))) {
              _$jscoverage['/kissy.js'].lineData[207]++;
              matched = 0;
              _$jscoverage['/kissy.js'].lineData[208]++;
              break;
            }
          }
        }
      }
      _$jscoverage['/kissy.js'].lineData[212]++;
      if (visit208_212_1(matched)) {
        _$jscoverage['/kissy.js'].lineData[213]++;
        msg = logger + ': ' + msg;
      }
    }
    _$jscoverage['/kissy.js'].lineData[217]++;
    if (visit209_217_1(matched)) {
      _$jscoverage['/kissy.js'].lineData[218]++;
      if (visit210_218_1(visit211_218_2(typeof console !== 'undefined') && console.log)) {
        _$jscoverage['/kissy.js'].lineData[219]++;
        console[visit212_219_1(cat && console[cat]) ? cat : 'log'](msg);
      }
      _$jscoverage['/kissy.js'].lineData[221]++;
      return msg;
    }
  }
  _$jscoverage['/kissy.js'].lineData[224]++;
  return undefined;
}, 
  getLogger: function(logger) {
  _$jscoverage['/kissy.js'].functionData[6]++;
  _$jscoverage['/kissy.js'].lineData[233]++;
  return getLogger(logger);
}, 
  error: function(msg) {
  _$jscoverage['/kissy.js'].functionData[7]++;
  _$jscoverage['/kissy.js'].lineData[240]++;
  if (visit213_240_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[242]++;
    throw msg instanceof Error ? msg : new Error(msg);
  }
}, 
  guid: function(pre) {
  _$jscoverage['/kissy.js'].functionData[8]++;
  _$jscoverage['/kissy.js'].lineData[252]++;
  return (visit214_252_1(pre || EMPTY)) + guid++;
}};
  _$jscoverage['/kissy.js'].lineData[256]++;
  if (visit215_256_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[257]++;
    S.Config.logger = {
  excludes: [{
  logger: /^s\/.*/, 
  maxLevel: 'info', 
  minLevel: 'debug'}]};
  }
  _$jscoverage['/kissy.js'].lineData[300]++;
  var Loader = S.Loader = {};
  _$jscoverage['/kissy.js'].lineData[306]++;
  Loader.Status = {
  ERROR: -1, 
  INIT: 0, 
  LOADING: 1, 
  LOADED: 2, 
  ATTACHING: 3, 
  ATTACHED: 4};
  _$jscoverage['/kissy.js'].lineData[321]++;
  return S;
})();
