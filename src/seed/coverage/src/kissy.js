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
  _$jscoverage['/kissy.js'].lineData[62] = 0;
  _$jscoverage['/kissy.js'].lineData[63] = 0;
  _$jscoverage['/kissy.js'].lineData[64] = 0;
  _$jscoverage['/kissy.js'].lineData[66] = 0;
  _$jscoverage['/kissy.js'].lineData[67] = 0;
  _$jscoverage['/kissy.js'].lineData[68] = 0;
  _$jscoverage['/kissy.js'].lineData[72] = 0;
  _$jscoverage['/kissy.js'].lineData[75] = 0;
  _$jscoverage['/kissy.js'].lineData[82] = 0;
  _$jscoverage['/kissy.js'].lineData[166] = 0;
  _$jscoverage['/kissy.js'].lineData[172] = 0;
  _$jscoverage['/kissy.js'].lineData[173] = 0;
  _$jscoverage['/kissy.js'].lineData[174] = 0;
  _$jscoverage['/kissy.js'].lineData[175] = 0;
  _$jscoverage['/kissy.js'].lineData[176] = 0;
  _$jscoverage['/kissy.js'].lineData[178] = 0;
  _$jscoverage['/kissy.js'].lineData[182] = 0;
  _$jscoverage['/kissy.js'].lineData[183] = 0;
  _$jscoverage['/kissy.js'].lineData[184] = 0;
  _$jscoverage['/kissy.js'].lineData[185] = 0;
  _$jscoverage['/kissy.js'].lineData[187] = 0;
  _$jscoverage['/kissy.js'].lineData[190] = 0;
  _$jscoverage['/kissy.js'].lineData[191] = 0;
  _$jscoverage['/kissy.js'].lineData[193] = 0;
  _$jscoverage['/kissy.js'].lineData[197] = 0;
  _$jscoverage['/kissy.js'].lineData[208] = 0;
  _$jscoverage['/kissy.js'].lineData[209] = 0;
  _$jscoverage['/kissy.js'].lineData[210] = 0;
  _$jscoverage['/kissy.js'].lineData[211] = 0;
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
  _$jscoverage['/kissy.js'].lineData[224] = 0;
  _$jscoverage['/kissy.js'].lineData[227] = 0;
  _$jscoverage['/kissy.js'].lineData[228] = 0;
  _$jscoverage['/kissy.js'].lineData[229] = 0;
  _$jscoverage['/kissy.js'].lineData[230] = 0;
  _$jscoverage['/kissy.js'].lineData[231] = 0;
  _$jscoverage['/kissy.js'].lineData[232] = 0;
  _$jscoverage['/kissy.js'].lineData[233] = 0;
  _$jscoverage['/kissy.js'].lineData[234] = 0;
  _$jscoverage['/kissy.js'].lineData[235] = 0;
  _$jscoverage['/kissy.js'].lineData[236] = 0;
  _$jscoverage['/kissy.js'].lineData[240] = 0;
  _$jscoverage['/kissy.js'].lineData[241] = 0;
  _$jscoverage['/kissy.js'].lineData[245] = 0;
  _$jscoverage['/kissy.js'].lineData[246] = 0;
  _$jscoverage['/kissy.js'].lineData[247] = 0;
  _$jscoverage['/kissy.js'].lineData[250] = 0;
  _$jscoverage['/kissy.js'].lineData[259] = 0;
  _$jscoverage['/kissy.js'].lineData[266] = 0;
  _$jscoverage['/kissy.js'].lineData[268] = 0;
  _$jscoverage['/kissy.js'].lineData[278] = 0;
  _$jscoverage['/kissy.js'].lineData[282] = 0;
  _$jscoverage['/kissy.js'].lineData[283] = 0;
  _$jscoverage['/kissy.js'].lineData[298] = 0;
  _$jscoverage['/kissy.js'].lineData[300] = 0;
  _$jscoverage['/kissy.js'].lineData[319] = 0;
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
  _$jscoverage['/kissy.js'].branchData['172'] = [];
  _$jscoverage['/kissy.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['175'] = [];
  _$jscoverage['/kissy.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['183'] = [];
  _$jscoverage['/kissy.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['184'] = [];
  _$jscoverage['/kissy.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['190'] = [];
  _$jscoverage['/kissy.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['208'] = [];
  _$jscoverage['/kissy.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['210'] = [];
  _$jscoverage['/kissy.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['211'] = [];
  _$jscoverage['/kissy.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['213'] = [];
  _$jscoverage['/kissy.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['214'] = [];
  _$jscoverage['/kissy.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['217'] = [];
  _$jscoverage['/kissy.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['220'] = [];
  _$jscoverage['/kissy.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['221'] = [];
  _$jscoverage['/kissy.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['222'] = [];
  _$jscoverage['/kissy.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['222'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['222'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['229'] = [];
  _$jscoverage['/kissy.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['232'] = [];
  _$jscoverage['/kissy.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['233'] = [];
  _$jscoverage['/kissy.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['234'] = [];
  _$jscoverage['/kissy.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['234'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['234'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['234'][4] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['240'] = [];
  _$jscoverage['/kissy.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['245'] = [];
  _$jscoverage['/kissy.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['245'][3] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['246'] = [];
  _$jscoverage['/kissy.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['266'] = [];
  _$jscoverage['/kissy.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['278'] = [];
  _$jscoverage['/kissy.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/kissy.js'].branchData['282'] = [];
  _$jscoverage['/kissy.js'].branchData['282'][1] = new BranchData();
}
_$jscoverage['/kissy.js'].branchData['282'][1].init(8943, 9, '\'@DEBUG@\'');
function visit72_282_1(result) {
  _$jscoverage['/kissy.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['278'][1].init(21, 12, 'pre || EMPTY');
function visit71_278_1(result) {
  _$jscoverage['/kissy.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['266'][1].init(17, 9, '\'@DEBUG@\'');
function visit70_266_1(result) {
  _$jscoverage['/kissy.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['246'][1].init(29, 19, 'cat && console[cat]');
function visit69_246_1(result) {
  _$jscoverage['/kissy.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['245'][3].init(1827, 22, 'console.log && matched');
function visit68_245_3(result) {
  _$jscoverage['/kissy.js'].branchData['245'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['245'][2].init(1793, 30, 'typeof console !== \'undefined\'');
function visit67_245_2(result) {
  _$jscoverage['/kissy.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['245'][1].init(1793, 56, 'typeof console !== \'undefined\' && console.log && matched');
function visit66_245_1(result) {
  _$jscoverage['/kissy.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['240'][1].init(1574, 7, 'matched');
function visit65_240_1(result) {
  _$jscoverage['/kissy.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['234'][4].init(309, 17, 'maxLevel >= level');
function visit64_234_4(result) {
  _$jscoverage['/kissy.js'].branchData['234'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['234'][3].init(309, 38, 'maxLevel >= level && logger.match(reg)');
function visit63_234_3(result) {
  _$jscoverage['/kissy.js'].branchData['234'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['234'][2].init(288, 17, 'minLevel <= level');
function visit62_234_2(result) {
  _$jscoverage['/kissy.js'].branchData['234'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['234'][1].init(288, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit61_234_1(result) {
  _$jscoverage['/kissy.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['233'][1].init(210, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit60_233_1(result) {
  _$jscoverage['/kissy.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['232'][1].init(125, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit59_232_1(result) {
  _$jscoverage['/kissy.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['229'][1].init(74, 15, 'i < list.length');
function visit58_229_1(result) {
  _$jscoverage['/kissy.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['222'][4].init(309, 17, 'maxLevel >= level');
function visit57_222_4(result) {
  _$jscoverage['/kissy.js'].branchData['222'][4].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['222'][3].init(309, 38, 'maxLevel >= level && logger.match(reg)');
function visit56_222_3(result) {
  _$jscoverage['/kissy.js'].branchData['222'][3].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['222'][2].init(288, 17, 'minLevel <= level');
function visit55_222_2(result) {
  _$jscoverage['/kissy.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['222'][1].init(288, 59, 'minLevel <= level && maxLevel >= level && logger.match(reg)');
function visit54_222_1(result) {
  _$jscoverage['/kissy.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['221'][1].init(210, 44, 'loggerLevel[l.minLevel] || loggerLevel.debug');
function visit53_221_1(result) {
  _$jscoverage['/kissy.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['220'][1].init(125, 44, 'loggerLevel[l.maxLevel] || loggerLevel.error');
function visit52_220_1(result) {
  _$jscoverage['/kissy.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['217'][1].init(74, 15, 'i < list.length');
function visit51_217_1(result) {
  _$jscoverage['/kissy.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['214'][1].init(198, 37, 'loggerLevel[cat] || loggerLevel.debug');
function visit50_214_1(result) {
  _$jscoverage['/kissy.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['213'][1].init(154, 14, 'cat || \'debug\'');
function visit49_213_1(result) {
  _$jscoverage['/kissy.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['211'][1].init(37, 21, 'S.Config.logger || {}');
function visit48_211_1(result) {
  _$jscoverage['/kissy.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['210'][1].init(54, 6, 'logger');
function visit47_210_1(result) {
  _$jscoverage['/kissy.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['208'][1].init(17, 9, '\'@DEBUG@\'');
function visit46_208_1(result) {
  _$jscoverage['/kissy.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['190'][1].init(25, 3, 'cfg');
function visit45_190_1(result) {
  _$jscoverage['/kissy.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['184'][1].init(25, 3, 'cfg');
function visit44_184_1(result) {
  _$jscoverage['/kissy.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['183'][1].init(66, 25, 'configValue === undefined');
function visit43_183_1(result) {
  _$jscoverage['/kissy.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['175'][1].init(64, 2, 'fn');
function visit42_175_1(result) {
  _$jscoverage['/kissy.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].branchData['172'][1].init(181, 22, 'S.isObject(configName)');
function visit41_172_1(result) {
  _$jscoverage['/kissy.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/kissy.js'].lineData[26]++;
var KISSY = (function(undefined) {
  _$jscoverage['/kissy.js'].functionData[0]++;
  _$jscoverage['/kissy.js'].lineData[27]++;
  var host = this, S, guid = 0, EMPTY = '';
  _$jscoverage['/kissy.js'].lineData[62]++;
  function getLogger(logger) {
    _$jscoverage['/kissy.js'].functionData[1]++;
    _$jscoverage['/kissy.js'].lineData[63]++;
    var obj = {};
    _$jscoverage['/kissy.js'].lineData[64]++;
    for (var cat in loggerLevel) {
      _$jscoverage['/kissy.js'].lineData[66]++;
      (function(obj, cat) {
  _$jscoverage['/kissy.js'].functionData[2]++;
  _$jscoverage['/kissy.js'].lineData[67]++;
  obj[cat] = function(msg) {
  _$jscoverage['/kissy.js'].functionData[3]++;
  _$jscoverage['/kissy.js'].lineData[68]++;
  return S.log(msg, cat, logger);
};
})(obj, cat);
    }
    _$jscoverage['/kissy.js'].lineData[72]++;
    return obj;
  }
  _$jscoverage['/kissy.js'].lineData[75]++;
  var loggerLevel = {
  'debug': 10, 
  'info': 20, 
  'warn': 30, 
  'error': 40};
  _$jscoverage['/kissy.js'].lineData[82]++;
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
  _$jscoverage['/kissy.js'].lineData[166]++;
  var cfg, r, self = this, fn, Config = S.Config, configFns = Config.fns;
  _$jscoverage['/kissy.js'].lineData[172]++;
  if (visit41_172_1(S.isObject(configName))) {
    _$jscoverage['/kissy.js'].lineData[173]++;
    S.each(configName, function(configValue, p) {
  _$jscoverage['/kissy.js'].functionData[5]++;
  _$jscoverage['/kissy.js'].lineData[174]++;
  fn = configFns[p];
  _$jscoverage['/kissy.js'].lineData[175]++;
  if (visit42_175_1(fn)) {
    _$jscoverage['/kissy.js'].lineData[176]++;
    fn.call(self, configValue);
  } else {
    _$jscoverage['/kissy.js'].lineData[178]++;
    Config[p] = configValue;
  }
});
  } else {
    _$jscoverage['/kissy.js'].lineData[182]++;
    cfg = configFns[configName];
    _$jscoverage['/kissy.js'].lineData[183]++;
    if (visit43_183_1(configValue === undefined)) {
      _$jscoverage['/kissy.js'].lineData[184]++;
      if (visit44_184_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[185]++;
        r = cfg.call(self);
      } else {
        _$jscoverage['/kissy.js'].lineData[187]++;
        r = Config[configName];
      }
    } else {
      _$jscoverage['/kissy.js'].lineData[190]++;
      if (visit45_190_1(cfg)) {
        _$jscoverage['/kissy.js'].lineData[191]++;
        r = cfg.call(self, configValue);
      } else {
        _$jscoverage['/kissy.js'].lineData[193]++;
        Config[configName] = configValue;
      }
    }
  }
  _$jscoverage['/kissy.js'].lineData[197]++;
  return r;
}, 
  log: function(msg, cat, logger) {
  _$jscoverage['/kissy.js'].functionData[6]++;
  _$jscoverage['/kissy.js'].lineData[208]++;
  if (visit46_208_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[209]++;
    var matched = 1;
    _$jscoverage['/kissy.js'].lineData[210]++;
    if (visit47_210_1(logger)) {
      _$jscoverage['/kissy.js'].lineData[211]++;
      var loggerCfg = visit48_211_1(S.Config.logger || {}), list, i, l, level, minLevel, maxLevel, reg;
      _$jscoverage['/kissy.js'].lineData[213]++;
      cat = visit49_213_1(cat || 'debug');
      _$jscoverage['/kissy.js'].lineData[214]++;
      level = visit50_214_1(loggerLevel[cat] || loggerLevel.debug);
      _$jscoverage['/kissy.js'].lineData[215]++;
      if ((list = loggerCfg.includes)) {
        _$jscoverage['/kissy.js'].lineData[216]++;
        matched = 0;
        _$jscoverage['/kissy.js'].lineData[217]++;
        for (i = 0; visit51_217_1(i < list.length); i++) {
          _$jscoverage['/kissy.js'].lineData[218]++;
          l = list[i];
          _$jscoverage['/kissy.js'].lineData[219]++;
          reg = l.logger;
          _$jscoverage['/kissy.js'].lineData[220]++;
          maxLevel = visit52_220_1(loggerLevel[l.maxLevel] || loggerLevel.error);
          _$jscoverage['/kissy.js'].lineData[221]++;
          minLevel = visit53_221_1(loggerLevel[l.minLevel] || loggerLevel.debug);
          _$jscoverage['/kissy.js'].lineData[222]++;
          if (visit54_222_1(visit55_222_2(minLevel <= level) && visit56_222_3(visit57_222_4(maxLevel >= level) && logger.match(reg)))) {
            _$jscoverage['/kissy.js'].lineData[223]++;
            matched = 1;
            _$jscoverage['/kissy.js'].lineData[224]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kissy.js'].lineData[227]++;
        if ((list = loggerCfg.excludes)) {
          _$jscoverage['/kissy.js'].lineData[228]++;
          matched = 1;
          _$jscoverage['/kissy.js'].lineData[229]++;
          for (i = 0; visit58_229_1(i < list.length); i++) {
            _$jscoverage['/kissy.js'].lineData[230]++;
            l = list[i];
            _$jscoverage['/kissy.js'].lineData[231]++;
            reg = l.logger;
            _$jscoverage['/kissy.js'].lineData[232]++;
            maxLevel = visit59_232_1(loggerLevel[l.maxLevel] || loggerLevel.error);
            _$jscoverage['/kissy.js'].lineData[233]++;
            minLevel = visit60_233_1(loggerLevel[l.minLevel] || loggerLevel.debug);
            _$jscoverage['/kissy.js'].lineData[234]++;
            if (visit61_234_1(visit62_234_2(minLevel <= level) && visit63_234_3(visit64_234_4(maxLevel >= level) && logger.match(reg)))) {
              _$jscoverage['/kissy.js'].lineData[235]++;
              matched = 0;
              _$jscoverage['/kissy.js'].lineData[236]++;
              break;
            }
          }
        }
      }
      _$jscoverage['/kissy.js'].lineData[240]++;
      if (visit65_240_1(matched)) {
        _$jscoverage['/kissy.js'].lineData[241]++;
        msg = logger + ': ' + msg;
      }
    }
    _$jscoverage['/kissy.js'].lineData[245]++;
    if (visit66_245_1(visit67_245_2(typeof console !== 'undefined') && visit68_245_3(console.log && matched))) {
      _$jscoverage['/kissy.js'].lineData[246]++;
      console[visit69_246_1(cat && console[cat]) ? cat : 'log'](msg);
      _$jscoverage['/kissy.js'].lineData[247]++;
      return msg;
    }
  }
  _$jscoverage['/kissy.js'].lineData[250]++;
  return undefined;
}, 
  'getLogger': function(logger) {
  _$jscoverage['/kissy.js'].functionData[7]++;
  _$jscoverage['/kissy.js'].lineData[259]++;
  return getLogger(logger);
}, 
  error: function(msg) {
  _$jscoverage['/kissy.js'].functionData[8]++;
  _$jscoverage['/kissy.js'].lineData[266]++;
  if (visit70_266_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[268]++;
    throw msg instanceof Error ? msg : new Error(msg);
  }
}, 
  guid: function(pre) {
  _$jscoverage['/kissy.js'].functionData[9]++;
  _$jscoverage['/kissy.js'].lineData[278]++;
  return (visit71_278_1(pre || EMPTY)) + guid++;
}};
  _$jscoverage['/kissy.js'].lineData[282]++;
  if (visit72_282_1('@DEBUG@')) {
    _$jscoverage['/kissy.js'].lineData[283]++;
    S.Config.logger = {
  excludes: [{
  logger: /^s\/.*/, 
  maxLevel: 'info', 
  minLevel: 'debug'}]};
  }
  _$jscoverage['/kissy.js'].lineData[298]++;
  S.Logger = {};
  _$jscoverage['/kissy.js'].lineData[300]++;
  S.Logger.Level = {
  'DEBUG': 'debug', 
  INFO: 'info', 
  WARN: 'warn', 
  ERROR: 'error'};
  _$jscoverage['/kissy.js'].lineData[319]++;
  return S;
})();
