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
  _$jscoverage['/kissy.js'].lineData[39] = 0;
  _$jscoverage['/kissy.js'].lineData[114] = 0;
  _$jscoverage['/kissy.js'].lineData[120] = 0;
  _$jscoverage['/kissy.js'].lineData[121] = 0;
  _$jscoverage['/kissy.js'].lineData[122] = 0;
  _$jscoverage['/kissy.js'].lineData[123] = 0;
  _$jscoverage['/kissy.js'].lineData[124] = 0;
  _$jscoverage['/kissy.js'].lineData[126] = 0;
  _$jscoverage['/kissy.js'].lineData[130] = 0;
  _$jscoverage['/kissy.js'].lineData[131] = 0;
  _$jscoverage['/kissy.js'].lineData[132] = 0;
  _$jscoverage['/kissy.js'].lineData[133] = 0;
  _$jscoverage['/kissy.js'].lineData[135] = 0;
  _$jscoverage['/kissy.js'].lineData[138] = 0;
  _$jscoverage['/kissy.js'].lineData[139] = 0;
  _$jscoverage['/kissy.js'].lineData[141] = 0;
  _$jscoverage['/kissy.js'].lineData[145] = 0;
  _$jscoverage['/kissy.js'].lineData[156] = 0;
  _$jscoverage['/kissy.js'].lineData[157] = 0;
  _$jscoverage['/kissy.js'].lineData[158] = 0;
  _$jscoverage['/kissy.js'].lineData[159] = 0;
  _$jscoverage['/kissy.js'].lineData[161] = 0;
  _$jscoverage['/kissy.js'].lineData[162] = 0;
  _$jscoverage['/kissy.js'].lineData[163] = 0;
  _$jscoverage['/kissy.js'].lineData[164] = 0;
  _$jscoverage['/kissy.js'].lineData[165] = 0;
  _$jscoverage['/kissy.js'].lineData[166] = 0;
  _$jscoverage['/kissy.js'].lineData[167] = 0;
  _$jscoverage['/kissy.js'].lineData[168] = 0;
  _$jscoverage['/kissy.js'].lineData[169] = 0;
  _$jscoverage['/kissy.js'].lineData[170] = 0;
  _$jscoverage['/kissy.js'].lineData[171] = 0;
  _$jscoverage['/kissy.js'].lineData[172] = 0;
  _$jscoverage['/kissy.js'].lineData[175] = 0;
  _$jscoverage['/kissy.js'].lineData[176] = 0;
  _$jscoverage['/kissy.js'].lineData[177] = 0;
  _$jscoverage['/kissy.js'].lineData[178] = 0;
  _$jscoverage['/kissy.js'].lineData[179] = 0;
  _$jscoverage['/kissy.js'].lineData[180] = 0;
  _$jscoverage['/kissy.js'].lineData[181] = 0;
  _$jscoverage['/kissy.js'].lineData[182] = 0;
  _$jscoverage['/kissy.js'].lineData[183] = 0;
  _$jscoverage['/kissy.js'].lineData[184] = 0;
  _$jscoverage['/kissy.js'].lineData[188] = 0;
  _$jscoverage['/kissy.js'].lineData[189] = 0;
  _$jscoverage['/kissy.js'].lineData[192] = 0;
  _$jscoverage['/kissy.js'].lineData[193] = 0;
  _$jscoverage['/kissy.js'].lineData[194] = 0;
  _$jscoverage['/kissy.js'].lineData[200] = 0;
  _$jscoverage['/kissy.js'].lineData[207] = 0;
  _$jscoverage['/kissy.js'].lineData[209] = 0;
  _$jscoverage['/kissy.js'].lineData[219] = 0;
  _$jscoverage['/kissy.js'].lineData[223] = 0;
  _$jscoverage['/kissy.js'].lineData[224] = 0;
  _$jscoverage['/kissy.js'].lineData[234] = 0;
  _$jscoverage['/kissy.js'].lineData[235] = 0;
  _$jscoverage['/kissy.js'].lineData[236] = 0;
  _$jscoverage['/kissy.js'].lineData[237] = 0;
  _$jscoverage['/kissy.js'].lineData[238] = 0;
  _$jscoverage['/kissy.js'].lineData[241] = 0;
  _$jscoverage['/kissy.js'].lineData[244] = 0;
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
}
if (! _$jscoverage['/kissy.js'].branchData) {
  _$jscoverage['/kissy.js'].branchData = {};
  _$jscoverage['/kissy.js'].branchData['120'] = [];
  _$jscoverage['/kissy.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['123'] = [];
  _$jscoverage['/kissy.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['131'] = [];
  _$jscoverage['/kissy.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['132'] = [];
  _$jscoverage['/kissy.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['138'] = [];
  _$jscoverage['/kissy.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['156'] = [];
  _$jscoverage['/kissy.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['158'] = [];
  _$jscoverage['/kissy.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['159'] = [];
  _$jscoverage['/kissy.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['161'] = [];
  _$jscoverage['/kissy.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['162'] = [];
  _$jscoverage['/kissy.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['163'] = [];
  _$jscoverage['/kissy.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['165'] = [];
  _$jscoverage['/kissy.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['168'] = [];
  _$jscoverage['/kissy.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['169'] = [];
  _$jscoverage['/kissy.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['170'] = [];
  _$jscoverage['/kissy.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['170'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['170'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['175'] = [];
  _$jscoverage['/kissy.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['177'] = [];
  _$jscoverage['/kissy.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['180'] = [];
  _$jscoverage['/kissy.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['181'] = [];
  _$jscoverage['/kissy.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['182'] = [];
  _$jscoverage['/kissy.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['182'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['182'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['188'] = [];
  _$jscoverage['/kissy.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'] = [];
  _$jscoverage['/kissy.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['192'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['193'] = [];
  _$jscoverage['/kissy.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['207'] = [];
  _$jscoverage['/kissy.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['219'] = [];
  _$jscoverage['/kissy.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['223'] = [];
  _$jscoverage['/kissy.js'].branchData['223'][1] = new BranchData();
}
_$jscoverage['/kissy.js'].branchData['223'][1].init(7485, 9, '\'@DEBUG@\'');
function visit64_223_1(result) {
  _$jscoverage['/kissy.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['219'][1].init(22, 12, 'pre || EMPTY');
function visit63_219_1(result) {
  _$jscoverage['/kissy.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['207'][1].init(18, 9, '\'@DEBUG@\'');
function visit62_207_1(result) {
  _$jscoverage['/kissy.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['193'][1].init(30, 19, 'cat && console[cat]');
function visit61_193_1(result) {
  _$jscoverage['/kissy.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][3].init(1839, 22, 'console.log && matched');
function visit60_192_3(result) {
  _$jscoverage['/kissy.js'].branchData['192'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][2].init(1806, 29, 'host[\'console\'] !== undefined');
function visit59_192_2(result) {
  _$jscoverage['/kissy.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['192'][1].init(1806, 55, 'host[\'console\'] !== undefined && console.log && matched');
function visit58_192_1(result) {
  _$jscoverage['/kissy.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['188'][1].init(1615, 7, 'matched');
function visit57_188_1(result) {
  _$jscoverage['/kissy.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['182'][4].init(320, 17, 'maxLevel >= level');
function visit56_182_4(result) {
  _$jscoverage['/kissy.js'].branchData['182'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['182'][3].init(320, 38, 'maxLevel >= level && logger.match(reg)');
function visit55_182_3(result) {
  _$jscoverage['/kissy.js'].branchData['182'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['182'][2].init(299, 17, 'minLevel <= level');
function visit54_182_2(result) {
  _$jscoverage['/kissy.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['182'][1].init(299, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit53_182_1(result) {
  _$jscoverage['/kissy.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['181'][1].init(217, 47, 'loggerLevel[l.minLevel] || loggerLevel[\'debug\']');
function visit52_181_1(result) {
  _$jscoverage['/kissy.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['180'][1].init(128, 47, 'loggerLevel[l.maxLevel] || loggerLevel[\'error\']');
function visit51_180_1(result) {
  _$jscoverage['/kissy.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['177'][1].init(76, 15, 'i < list.length');
function visit50_177_1(result) {
  _$jscoverage['/kissy.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['175'][1].init(935, 25, 'list = loggerCfg.excludes');
function visit49_175_1(result) {
  _$jscoverage['/kissy.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['170'][4].init(320, 17, 'maxLevel >= level');
function visit48_170_4(result) {
  _$jscoverage['/kissy.js'].branchData['170'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['170'][3].init(320, 38, 'maxLevel >= level && logger.match(reg)');
function visit47_170_3(result) {
  _$jscoverage['/kissy.js'].branchData['170'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['170'][2].init(299, 17, 'minLevel <= level');
function visit46_170_2(result) {
  _$jscoverage['/kissy.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['170'][1].init(299, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit45_170_1(result) {
  _$jscoverage['/kissy.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['169'][1].init(217, 47, 'loggerLevel[l.minLevel] || loggerLevel[\'debug\']');
function visit44_169_1(result) {
  _$jscoverage['/kissy.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['168'][1].init(128, 47, 'loggerLevel[l.maxLevel] || loggerLevel[\'error\']');
function visit43_168_1(result) {
  _$jscoverage['/kissy.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['165'][1].init(76, 15, 'i < list.length');
function visit42_165_1(result) {
  _$jscoverage['/kissy.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['163'][1].init(269, 25, 'list = loggerCfg.includes');
function visit41_163_1(result) {
  _$jscoverage['/kissy.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['162'][1].init(202, 40, 'loggerLevel[cat] || loggerLevel[\'debug\']');
function visit40_162_1(result) {
  _$jscoverage['/kissy.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['161'][1].init(157, 14, 'cat || \'debug\'');
function visit39_161_1(result) {
  _$jscoverage['/kissy.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['159'][1].init(38, 21, 'S.Config.logger || {}');
function visit38_159_1(result) {
  _$jscoverage['/kissy.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['158'][1].init(56, 6, 'logger');
function visit37_158_1(result) {
  _$jscoverage['/kissy.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['156'][1].init(18, 9, '\'@DEBUG@\'');
function visit36_156_1(result) {
  _$jscoverage['/kissy.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['138'][1].init(26, 3, 'cfg');
function visit35_138_1(result) {
  _$jscoverage['/kissy.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['132'][1].init(26, 3, 'cfg');
function visit34_132_1(result) {
  _$jscoverage['/kissy.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['131'][1].init(68, 25, 'configValue === undefined');
function visit33_131_1(result) {
  _$jscoverage['/kissy.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['123'][1].init(66, 2, 'fn');
function visit32_123_1(result) {
  _$jscoverage['/kissy.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['120'][1].init(188, 22, 'S.isObject(configName)');
function visit31_120_1(result) {
  _$jscoverage['/kissy.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].lineData[26]++;
var KISSY = (function(undefined) {
  _$jscoverage['/kissy.js'].functionData[0]++;
  _$jscoverage['/kissy.js'].lineData[27]++;
  var host = this, S, guid = 0, EMPTY = '';
  _$jscoverage['/kissy.js'].lineData[32]++;
  var loggerLevel = {
  'debug': 10, 
  'info': 20, 
  'warn': 30, 
  'error': 40};
  _$jscoverage['/kissy.js'].lineData[39]++;
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
  _$jscoverage['/kissy.js'].lineData[114]++;
  var cfg, r, self = this, fn, Config = S.Config, configFns = Config.fns;
  _$jscoverage['/kissy.js'].lineData[120]++;
  if (visit31_120_1(S.isObject(configName))) {
    _$jscoverage['/kissy.js'].lineData[121]++;
    S.each(configName, function(configValue, p) {
  _$jscoverage['/kissy.js'].functionData[2]++;
  _$jscoverage['/kissy.js'].lineData[122]++;
  fn = configFns[p];
  _$jscoverage['/kissy.js'].lineData[123]++;
  if (visit32_123_1(fn)) {
    _$jscoverage['/kissy.js'].lineData[124]++;
    fn.call(self, configValue);
  } else {
    _$jscoverage['/kissy.js'].lineData[126]++;
    Config[p] = configValue;
  }
});
  } else {
    _$jscoverage['/kissy.js'].lineData[130]++;
    cfg = configFns[configName];
    _$jscoverage['/kissy.js'].lineData[131]++;
    if (visit33_131_1(configValue === undefined)) {
      _$jscoverage['/kissy.js'].lineData[132]++;
      if (visit34_132_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[133]++;
        r = cfg.call(self);
      } else {
        _$jscoverage['/kissy.js'].lineData[135]++;
        r = Config[configName];
      }
    } else {
      _$jscoverage['/kissy.js'].lineData[138]++;
      if (visit35_138_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[139]++;
        r = cfg.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[141]++;
        Config[configName] = configValue;
      }
    }
  }
  _$jscoverage['/kissy.js'].lineData[145]++;
  return r;
}, 
  log: function(msg, cat, logger) {
  _$jscoverage['/kissy.js'].functionData[3]++;
  _$jscoverage['/kissy.js'].lineData[156]++;
  if (visit36_156_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[157]++;
    var matched = 1;
    _$jscoverage['/kissy.js'].lineData[158]++;
    if (visit37_158_1(logger)) {
      _$jscoverage['/kissy.js'].lineData[159]++;
      var loggerCfg = visit38_159_1(S.Config.logger || {}), list, i, l, level, minLevel, maxLevel, reg;
      _$jscoverage['/kissy.js'].lineData[161]++;
      cat = visit39_161_1(cat || 'debug');
      _$jscoverage['/kissy.js'].lineData[162]++;
      level = visit40_162_1(loggerLevel[cat] || loggerLevel['debug']);
      _$jscoverage['/kissy.js'].lineData[163]++;
      if (visit41_163_1(list = loggerCfg.includes)) {
        _$jscoverage['/kissy.js'].lineData[164]++;
        matched = 0;
        _$jscoverage['/kissy.js'].lineData[165]++;
        for (i = 0; visit42_165_1(i < list.length); i++) {
          _$jscoverage['/kissy.js'].lineData[166]++;
          l = list[i];
          _$jscoverage['/kissy.js'].lineData[167]++;
          reg = l.logger;
          _$jscoverage['/kissy.js'].lineData[168]++;
          maxLevel = visit43_168_1(loggerLevel[l.maxLevel] || loggerLevel['error']);
          _$jscoverage['/kissy.js'].lineData[169]++;
          minLevel = visit44_169_1(loggerLevel[l.minLevel] || loggerLevel['debug']);
          _$jscoverage['/kissy.js'].lineData[170]++;
          if (visit45_170_1(visit46_170_2(minLevel <= level) && visit47_170_3(visit48_170_4(maxLevel >= level) && logger.match(reg)))) {
            _$jscoverage['/kissy.js'].lineData[171]++;
            matched = 1;
            _$jscoverage['/kissy.js'].lineData[172]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kissy.js'].lineData[175]++;
        if (visit49_175_1(list = loggerCfg.excludes)) {
          _$jscoverage['/kissy.js'].lineData[176]++;
          matched = 1;
          _$jscoverage['/kissy.js'].lineData[177]++;
          for (i = 0; visit50_177_1(i < list.length); i++) {
            _$jscoverage['/kissy.js'].lineData[178]++;
            l = list[i];
            _$jscoverage['/kissy.js'].lineData[179]++;
            reg = l.logger;
            _$jscoverage['/kissy.js'].lineData[180]++;
            maxLevel = visit51_180_1(loggerLevel[l.maxLevel] || loggerLevel['error']);
            _$jscoverage['/kissy.js'].lineData[181]++;
            minLevel = visit52_181_1(loggerLevel[l.minLevel] || loggerLevel['debug']);
            _$jscoverage['/kissy.js'].lineData[182]++;
            if (visit53_182_1(visit54_182_2(minLevel <= level) && visit55_182_3(visit56_182_4(maxLevel >= level) && logger.match(reg)))) {
              _$jscoverage['/kissy.js'].lineData[183]++;
              matched = 0;
              _$jscoverage['/kissy.js'].lineData[184]++;
              break;
            }
          }
        }
      }
      _$jscoverage['/kissy.js'].lineData[188]++;
      if (visit57_188_1(matched)) {
        _$jscoverage['/kissy.js'].lineData[189]++;
        msg = logger + ': ' + msg;
      }
    }
    _$jscoverage['/kissy.js'].lineData[192]++;
    if (visit58_192_1(visit59_192_2(host['console'] !== undefined) && visit60_192_3(console.log && matched))) {
      _$jscoverage['/kissy.js'].lineData[193]++;
      console[visit61_193_1(cat && console[cat]) ? cat : 'log'](msg);
      _$jscoverage['/kissy.js'].lineData[194]++;
      return msg;
    }
  }
}, 
  'getLogger': function(logger) {
  _$jscoverage['/kissy.js'].functionData[4]++;
  _$jscoverage['/kissy.js'].lineData[200]++;
  return getLogger(logger);
}, 
  error: function(msg) {
  _$jscoverage['/kissy.js'].functionData[5]++;
  _$jscoverage['/kissy.js'].lineData[207]++;
  if (visit62_207_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[209]++;
    throw msg instanceof Error ? msg : new Error(msg);
  }
}, 
  guid: function(pre) {
  _$jscoverage['/kissy.js'].functionData[6]++;
  _$jscoverage['/kissy.js'].lineData[219]++;
  return (visit63_219_1(pre || EMPTY)) + guid++;
}};
  _$jscoverage['/kissy.js'].lineData[223]++;
  if (visit64_223_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[224]++;
    S.Config.logger = {
  excludes: [{
  logger: /^s\/.*/, 
  maxLevel: 'info'}]};
  }
  _$jscoverage['/kissy.js'].lineData[234]++;
  function getLogger(logger) {
    _$jscoverage['/kissy.js'].functionData[7]++;
    _$jscoverage['/kissy.js'].lineData[235]++;
    var obj = {};
    _$jscoverage['/kissy.js'].lineData[236]++;
    S.each(loggerLevel, function(_, cat) {
  _$jscoverage['/kissy.js'].functionData[8]++;
  _$jscoverage['/kissy.js'].lineData[237]++;
  obj[cat] = function(msg) {
  _$jscoverage['/kissy.js'].functionData[9]++;
  _$jscoverage['/kissy.js'].lineData[238]++;
  return S.log(msg, cat, logger);
};
});
    _$jscoverage['/kissy.js'].lineData[241]++;
    return obj;
  }
  _$jscoverage['/kissy.js'].lineData[244]++;
  return S;
})();
