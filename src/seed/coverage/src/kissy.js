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
  _$jscoverage['/kissy.js'].lineData[25] = 0;
  _$jscoverage['/kissy.js'].lineData[26] = 0;
  _$jscoverage['/kissy.js'].lineData[61] = 0;
  _$jscoverage['/kissy.js'].lineData[62] = 0;
  _$jscoverage['/kissy.js'].lineData[63] = 0;
  _$jscoverage['/kissy.js'].lineData[65] = 0;
  _$jscoverage['/kissy.js'].lineData[66] = 0;
  _$jscoverage['/kissy.js'].lineData[67] = 0;
  _$jscoverage['/kissy.js'].lineData[71] = 0;
  _$jscoverage['/kissy.js'].lineData[74] = 0;
  _$jscoverage['/kissy.js'].lineData[81] = 0;
  _$jscoverage['/kissy.js'].lineData[165] = 0;
  _$jscoverage['/kissy.js'].lineData[171] = 0;
  _$jscoverage['/kissy.js'].lineData[172] = 0;
  _$jscoverage['/kissy.js'].lineData[173] = 0;
  _$jscoverage['/kissy.js'].lineData[174] = 0;
  _$jscoverage['/kissy.js'].lineData[175] = 0;
  _$jscoverage['/kissy.js'].lineData[177] = 0;
  _$jscoverage['/kissy.js'].lineData[181] = 0;
  _$jscoverage['/kissy.js'].lineData[182] = 0;
  _$jscoverage['/kissy.js'].lineData[183] = 0;
  _$jscoverage['/kissy.js'].lineData[184] = 0;
  _$jscoverage['/kissy.js'].lineData[186] = 0;
  _$jscoverage['/kissy.js'].lineData[189] = 0;
  _$jscoverage['/kissy.js'].lineData[190] = 0;
  _$jscoverage['/kissy.js'].lineData[192] = 0;
  _$jscoverage['/kissy.js'].lineData[196] = 0;
  _$jscoverage['/kissy.js'].lineData[207] = 0;
  _$jscoverage['/kissy.js'].lineData[208] = 0;
  _$jscoverage['/kissy.js'].lineData[209] = 0;
  _$jscoverage['/kissy.js'].lineData[210] = 0;
  _$jscoverage['/kissy.js'].lineData[212] = 0;
  _$jscoverage['/kissy.js'].lineData[213] = 0;
  _$jscoverage['/kissy.js'].lineData[214] = 0;
  _$jscoverage['/kissy.js'].lineData[215] = 0;
  _$jscoverage['/kissy.js'].lineData[216] = 0;
  _$jscoverage['/kissy.js'].lineData[217] = 0;
  _$jscoverage['/kissy.js'].lineData[218] = 0;
  _$jscoverage['/kissy.js'].lineData[219] = 0;
  _$jscoverage['/kissy.js'].lineData[220] = 0;
  _$jscoverage['/kissy.js'].lineData[221] = 0;
  _$jscoverage['/kissy.js'].lineData[222] = 0;
  _$jscoverage['/kissy.js'].lineData[223] = 0;
  _$jscoverage['/kissy.js'].lineData[226] = 0;
  _$jscoverage['/kissy.js'].lineData[227] = 0;
  _$jscoverage['/kissy.js'].lineData[228] = 0;
  _$jscoverage['/kissy.js'].lineData[229] = 0;
  _$jscoverage['/kissy.js'].lineData[230] = 0;
  _$jscoverage['/kissy.js'].lineData[231] = 0;
  _$jscoverage['/kissy.js'].lineData[232] = 0;
  _$jscoverage['/kissy.js'].lineData[233] = 0;
  _$jscoverage['/kissy.js'].lineData[234] = 0;
  _$jscoverage['/kissy.js'].lineData[235] = 0;
  _$jscoverage['/kissy.js'].lineData[239] = 0;
  _$jscoverage['/kissy.js'].lineData[240] = 0;
  _$jscoverage['/kissy.js'].lineData[243] = 0;
  _$jscoverage['/kissy.js'].lineData[244] = 0;
  _$jscoverage['/kissy.js'].lineData[245] = 0;
  _$jscoverage['/kissy.js'].lineData[246] = 0;
  _$jscoverage['/kissy.js'].lineData[249] = 0;
  _$jscoverage['/kissy.js'].lineData[258] = 0;
  _$jscoverage['/kissy.js'].lineData[265] = 0;
  _$jscoverage['/kissy.js'].lineData[267] = 0;
  _$jscoverage['/kissy.js'].lineData[277] = 0;
  _$jscoverage['/kissy.js'].lineData[281] = 0;
  _$jscoverage['/kissy.js'].lineData[282] = 0;
  _$jscoverage['/kissy.js'].lineData[297] = 0;
  _$jscoverage['/kissy.js'].lineData[299] = 0;
  _$jscoverage['/kissy.js'].lineData[318] = 0;
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
  _$jscoverage['/kissy.js'].branchData['171'] = [];
  _$jscoverage['/kissy.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['174'] = [];
  _$jscoverage['/kissy.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['182'] = [];
  _$jscoverage['/kissy.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['183'] = [];
  _$jscoverage['/kissy.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['189'] = [];
  _$jscoverage['/kissy.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['207'] = [];
  _$jscoverage['/kissy.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['209'] = [];
  _$jscoverage['/kissy.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['210'] = [];
  _$jscoverage['/kissy.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['212'] = [];
  _$jscoverage['/kissy.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['213'] = [];
  _$jscoverage['/kissy.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['216'] = [];
  _$jscoverage['/kissy.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['219'] = [];
  _$jscoverage['/kissy.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['220'] = [];
  _$jscoverage['/kissy.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['221'] = [];
  _$jscoverage['/kissy.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['221'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['221'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['228'] = [];
  _$jscoverage['/kissy.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['231'] = [];
  _$jscoverage['/kissy.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['232'] = [];
  _$jscoverage['/kissy.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['233'] = [];
  _$jscoverage['/kissy.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['233'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['233'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['239'] = [];
  _$jscoverage['/kissy.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['244'] = [];
  _$jscoverage['/kissy.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['244'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['245'] = [];
  _$jscoverage['/kissy.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['265'] = [];
  _$jscoverage['/kissy.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['277'] = [];
  _$jscoverage['/kissy.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['281'] = [];
  _$jscoverage['/kissy.js'].branchData['281'][1] = new BranchData();
}
_$jscoverage['/kissy.js'].branchData['281'][1].init(8944, 9, '\'@DEBUG@\'');
function visit61_281_1(result) {
  _$jscoverage['/kissy.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['277'][1].init(21, 12, 'pre || EMPTY');
function visit60_277_1(result) {
  _$jscoverage['/kissy.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['265'][1].init(17, 9, '\'@DEBUG@\'');
function visit59_265_1(result) {
  _$jscoverage['/kissy.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['245'][1].init(29, 19, 'cat && console[cat]');
function visit58_245_1(result) {
  _$jscoverage['/kissy.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['244'][3].init(1828, 22, 'console.log && matched');
function visit57_244_3(result) {
  _$jscoverage['/kissy.js'].branchData['244'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['244'][2].init(1803, 21, 'console !== undefined');
function visit56_244_2(result) {
  _$jscoverage['/kissy.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['244'][1].init(1803, 47, 'console !== undefined && console.log && matched');
function visit55_244_1(result) {
  _$jscoverage['/kissy.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['239'][1].init(1574, 7, 'matched');
function visit54_239_1(result) {
  _$jscoverage['/kissy.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['233'][4].init(309, 17, 'maxLevel >= level');
function visit53_233_4(result) {
  _$jscoverage['/kissy.js'].branchData['233'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['233'][3].init(309, 38, 'maxLevel >= level && logger.match(reg)');
function visit52_233_3(result) {
  _$jscoverage['/kissy.js'].branchData['233'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['233'][2].init(288, 17, 'minLevel <= level');
function visit51_233_2(result) {
  _$jscoverage['/kissy.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['233'][1].init(288, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit50_233_1(result) {
  _$jscoverage['/kissy.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['232'][1].init(210, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit49_232_1(result) {
  _$jscoverage['/kissy.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['231'][1].init(125, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit48_231_1(result) {
  _$jscoverage['/kissy.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['228'][1].init(74, 15, 'i < list.length');
function visit47_228_1(result) {
  _$jscoverage['/kissy.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['221'][4].init(309, 17, 'maxLevel >= level');
function visit46_221_4(result) {
  _$jscoverage['/kissy.js'].branchData['221'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['221'][3].init(309, 38, 'maxLevel >= level && logger.match(reg)');
function visit45_221_3(result) {
  _$jscoverage['/kissy.js'].branchData['221'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['221'][2].init(288, 17, 'minLevel <= level');
function visit44_221_2(result) {
  _$jscoverage['/kissy.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['221'][1].init(288, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit43_221_1(result) {
  _$jscoverage['/kissy.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['220'][1].init(210, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit42_220_1(result) {
  _$jscoverage['/kissy.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['219'][1].init(125, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit41_219_1(result) {
  _$jscoverage['/kissy.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['216'][1].init(74, 15, 'i < list.length');
function visit40_216_1(result) {
  _$jscoverage['/kissy.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['213'][1].init(198, 37, 'loggerLevel[cat] || loggerLevel.debug');
function visit39_213_1(result) {
  _$jscoverage['/kissy.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['212'][1].init(154, 14, 'cat || \'debug\'');
function visit38_212_1(result) {
  _$jscoverage['/kissy.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['210'][1].init(37, 21, 'S.Config.logger || {}');
function visit37_210_1(result) {
  _$jscoverage['/kissy.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['209'][1].init(54, 6, 'logger');
function visit36_209_1(result) {
  _$jscoverage['/kissy.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['207'][1].init(17, 9, '\'@DEBUG@\'');
function visit35_207_1(result) {
  _$jscoverage['/kissy.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['189'][1].init(25, 3, 'cfg');
function visit34_189_1(result) {
  _$jscoverage['/kissy.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['183'][1].init(25, 3, 'cfg');
function visit33_183_1(result) {
  _$jscoverage['/kissy.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['182'][1].init(66, 25, 'configValue === undefined');
function visit32_182_1(result) {
  _$jscoverage['/kissy.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['174'][1].init(64, 2, 'fn');
function visit31_174_1(result) {
  _$jscoverage['/kissy.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['171'][1].init(181, 22, 'S.isObject(configName)');
function visit30_171_1(result) {
  _$jscoverage['/kissy.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].lineData[25]++;
var KISSY = (function(undefined) {
  _$jscoverage['/kissy.js'].functionData[0]++;
  _$jscoverage['/kissy.js'].lineData[26]++;
  var host = this, S, guid = 0, EMPTY = '';
  _$jscoverage['/kissy.js'].lineData[61]++;
  function getLogger(logger) {
    _$jscoverage['/kissy.js'].functionData[1]++;
    _$jscoverage['/kissy.js'].lineData[62]++;
    var obj = {};
    _$jscoverage['/kissy.js'].lineData[63]++;
    for (var cat in loggerLevel) {
      _$jscoverage['/kissy.js'].lineData[65]++;
      (function(obj, cat) {
  _$jscoverage['/kissy.js'].functionData[2]++;
  _$jscoverage['/kissy.js'].lineData[66]++;
  obj[cat] = function(msg) {
  _$jscoverage['/kissy.js'].functionData[3]++;
  _$jscoverage['/kissy.js'].lineData[67]++;
  return S.log(msg, cat, logger);
};
})(obj, cat);
    }
    _$jscoverage['/kissy.js'].lineData[71]++;
    return obj;
  }
  _$jscoverage['/kissy.js'].lineData[74]++;
  var loggerLevel = {
  'debug': 10, 
  'info': 20, 
  'warn': 30, 
  'error': 40};
  _$jscoverage['/kissy.js'].lineData[81]++;
  S = {
  __BUILD_TIME: '@TIMESTAMP@', 
  Env: {
  host: host}, 
  Config: {
  debug: '@DEBUG@', 
  fns: {}}, 
  version: '@VERSION@', 
  config: function(configName, configValue) {
  _$jscoverage['/kissy.js'].functionData[4]++;
  _$jscoverage['/kissy.js'].lineData[165]++;
  var cfg, r, self = this, fn, Config = S.Config, configFns = Config.fns;
  _$jscoverage['/kissy.js'].lineData[171]++;
  if (visit30_171_1(S.isObject(configName))) {
    _$jscoverage['/kissy.js'].lineData[172]++;
    S.each(configName, function(configValue, p) {
  _$jscoverage['/kissy.js'].functionData[5]++;
  _$jscoverage['/kissy.js'].lineData[173]++;
  fn = configFns[p];
  _$jscoverage['/kissy.js'].lineData[174]++;
  if (visit31_174_1(fn)) {
    _$jscoverage['/kissy.js'].lineData[175]++;
    fn.call(self, configValue);
  } else {
    _$jscoverage['/kissy.js'].lineData[177]++;
    Config[p] = configValue;
  }
});
  } else {
    _$jscoverage['/kissy.js'].lineData[181]++;
    cfg = configFns[configName];
    _$jscoverage['/kissy.js'].lineData[182]++;
    if (visit32_182_1(configValue === undefined)) {
      _$jscoverage['/kissy.js'].lineData[183]++;
      if (visit33_183_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[184]++;
        r = cfg.call(self);
      } else {
        _$jscoverage['/kissy.js'].lineData[186]++;
        r = Config[configName];
      }
    } else {
      _$jscoverage['/kissy.js'].lineData[189]++;
      if (visit34_189_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[190]++;
        r = cfg.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[192]++;
        Config[configName] = configValue;
      }
    }
  }
  _$jscoverage['/kissy.js'].lineData[196]++;
  return r;
}, 
  log: function(msg, cat, logger) {
  _$jscoverage['/kissy.js'].functionData[6]++;
  _$jscoverage['/kissy.js'].lineData[207]++;
  if (visit35_207_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[208]++;
    var matched = 1;
    _$jscoverage['/kissy.js'].lineData[209]++;
    if (visit36_209_1(logger)) {
      _$jscoverage['/kissy.js'].lineData[210]++;
      var loggerCfg = visit37_210_1(S.Config.logger || {}), list, i, l, level, minLevel, maxLevel, reg;
      _$jscoverage['/kissy.js'].lineData[212]++;
      cat = visit38_212_1(cat || 'debug');
      _$jscoverage['/kissy.js'].lineData[213]++;
      level = visit39_213_1(loggerLevel[cat] || loggerLevel.debug);
      _$jscoverage['/kissy.js'].lineData[214]++;
      if ((list = loggerCfg.includes)) {
        _$jscoverage['/kissy.js'].lineData[215]++;
        matched = 0;
        _$jscoverage['/kissy.js'].lineData[216]++;
        for (i = 0; visit40_216_1(i < list.length); i++) {
          _$jscoverage['/kissy.js'].lineData[217]++;
          l = list[i];
          _$jscoverage['/kissy.js'].lineData[218]++;
          reg = l.logger;
          _$jscoverage['/kissy.js'].lineData[219]++;
          maxLevel = visit41_219_1(loggerLevel[l.maxLevel] || loggerLevel.error);
          _$jscoverage['/kissy.js'].lineData[220]++;
          minLevel = visit42_220_1(loggerLevel[l.minLevel] || loggerLevel.debug);
          _$jscoverage['/kissy.js'].lineData[221]++;
          if (visit43_221_1(visit44_221_2(minLevel <= level) && visit45_221_3(visit46_221_4(maxLevel >= level) && logger.match(reg)))) {
            _$jscoverage['/kissy.js'].lineData[222]++;
            matched = 1;
            _$jscoverage['/kissy.js'].lineData[223]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kissy.js'].lineData[226]++;
        if ((list = loggerCfg.excludes)) {
          _$jscoverage['/kissy.js'].lineData[227]++;
          matched = 1;
          _$jscoverage['/kissy.js'].lineData[228]++;
          for (i = 0; visit47_228_1(i < list.length); i++) {
            _$jscoverage['/kissy.js'].lineData[229]++;
            l = list[i];
            _$jscoverage['/kissy.js'].lineData[230]++;
            reg = l.logger;
            _$jscoverage['/kissy.js'].lineData[231]++;
            maxLevel = visit48_231_1(loggerLevel[l.maxLevel] || loggerLevel.error);
            _$jscoverage['/kissy.js'].lineData[232]++;
            minLevel = visit49_232_1(loggerLevel[l.minLevel] || loggerLevel.debug);
            _$jscoverage['/kissy.js'].lineData[233]++;
            if (visit50_233_1(visit51_233_2(minLevel <= level) && visit52_233_3(visit53_233_4(maxLevel >= level) && logger.match(reg)))) {
              _$jscoverage['/kissy.js'].lineData[234]++;
              matched = 0;
              _$jscoverage['/kissy.js'].lineData[235]++;
              break;
            }
          }
        }
      }
      _$jscoverage['/kissy.js'].lineData[239]++;
      if (visit54_239_1(matched)) {
        _$jscoverage['/kissy.js'].lineData[240]++;
        msg = logger + ': ' + msg;
      }
    }
    _$jscoverage['/kissy.js'].lineData[243]++;
    var console = host.console;
    _$jscoverage['/kissy.js'].lineData[244]++;
    if (visit55_244_1(visit56_244_2(console !== undefined) && visit57_244_3(console.log && matched))) {
      _$jscoverage['/kissy.js'].lineData[245]++;
      console[visit58_245_1(cat && console[cat]) ? cat : 'log'](msg);
      _$jscoverage['/kissy.js'].lineData[246]++;
      return msg;
    }
  }
  _$jscoverage['/kissy.js'].lineData[249]++;
  return undefined;
}, 
  'getLogger': function(logger) {
  _$jscoverage['/kissy.js'].functionData[7]++;
  _$jscoverage['/kissy.js'].lineData[258]++;
  return getLogger(logger);
}, 
  error: function(msg) {
  _$jscoverage['/kissy.js'].functionData[8]++;
  _$jscoverage['/kissy.js'].lineData[265]++;
  if (visit59_265_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[267]++;
    throw msg instanceof Error ? msg : new Error(msg);
  }
}, 
  guid: function(pre) {
  _$jscoverage['/kissy.js'].functionData[9]++;
  _$jscoverage['/kissy.js'].lineData[277]++;
  return (visit60_277_1(pre || EMPTY)) + guid++;
}};
  _$jscoverage['/kissy.js'].lineData[281]++;
  if (visit61_281_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[282]++;
    S.Config.logger = {
  excludes: [{
  logger: /^s\/.*/, 
  maxLevel: 'info', 
  minLevel: 'debug'}]};
  }
  _$jscoverage['/kissy.js'].lineData[297]++;
  S.Logger = {};
  _$jscoverage['/kissy.js'].lineData[299]++;
  S.Logger.Level = {
  'DEBUG': 'debug', 
  INFO: 'info', 
  WARN: 'warn', 
  ERROR: 'error'};
  _$jscoverage['/kissy.js'].lineData[318]++;
  return S;
})();
