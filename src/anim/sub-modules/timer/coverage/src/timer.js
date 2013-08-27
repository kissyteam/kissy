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
if (! _$jscoverage['/timer.js']) {
  _$jscoverage['/timer.js'] = {};
  _$jscoverage['/timer.js'].lineData = [];
  _$jscoverage['/timer.js'].lineData[6] = 0;
  _$jscoverage['/timer.js'].lineData[7] = 0;
  _$jscoverage['/timer.js'].lineData[10] = 0;
  _$jscoverage['/timer.js'].lineData[11] = 0;
  _$jscoverage['/timer.js'].lineData[13] = 0;
  _$jscoverage['/timer.js'].lineData[15] = 0;
  _$jscoverage['/timer.js'].lineData[16] = 0;
  _$jscoverage['/timer.js'].lineData[17] = 0;
  _$jscoverage['/timer.js'].lineData[18] = 0;
  _$jscoverage['/timer.js'].lineData[19] = 0;
  _$jscoverage['/timer.js'].lineData[24] = 0;
  _$jscoverage['/timer.js'].lineData[26] = 0;
  _$jscoverage['/timer.js'].lineData[30] = 0;
  _$jscoverage['/timer.js'].lineData[32] = 0;
  _$jscoverage['/timer.js'].lineData[33] = 0;
  _$jscoverage['/timer.js'].lineData[34] = 0;
  _$jscoverage['/timer.js'].lineData[35] = 0;
  _$jscoverage['/timer.js'].lineData[40] = 0;
  _$jscoverage['/timer.js'].lineData[41] = 0;
  _$jscoverage['/timer.js'].lineData[45] = 0;
  _$jscoverage['/timer.js'].lineData[46] = 0;
  _$jscoverage['/timer.js'].lineData[47] = 0;
  _$jscoverage['/timer.js'].lineData[48] = 0;
  _$jscoverage['/timer.js'].lineData[50] = 0;
  _$jscoverage['/timer.js'].lineData[52] = 0;
  _$jscoverage['/timer.js'].lineData[53] = 0;
  _$jscoverage['/timer.js'].lineData[55] = 0;
  _$jscoverage['/timer.js'].lineData[56] = 0;
  _$jscoverage['/timer.js'].lineData[61] = 0;
  _$jscoverage['/timer.js'].lineData[64] = 0;
  _$jscoverage['/timer.js'].lineData[68] = 0;
  _$jscoverage['/timer.js'].lineData[79] = 0;
  _$jscoverage['/timer.js'].lineData[81] = 0;
  _$jscoverage['/timer.js'].lineData[84] = 0;
  _$jscoverage['/timer.js'].lineData[85] = 0;
  _$jscoverage['/timer.js'].lineData[86] = 0;
  _$jscoverage['/timer.js'].lineData[89] = 0;
  _$jscoverage['/timer.js'].lineData[90] = 0;
  _$jscoverage['/timer.js'].lineData[95] = 0;
  _$jscoverage['/timer.js'].lineData[96] = 0;
  _$jscoverage['/timer.js'].lineData[98] = 0;
  _$jscoverage['/timer.js'].lineData[100] = 0;
  _$jscoverage['/timer.js'].lineData[101] = 0;
  _$jscoverage['/timer.js'].lineData[102] = 0;
  _$jscoverage['/timer.js'].lineData[104] = 0;
  _$jscoverage['/timer.js'].lineData[105] = 0;
  _$jscoverage['/timer.js'].lineData[106] = 0;
  _$jscoverage['/timer.js'].lineData[109] = 0;
  _$jscoverage['/timer.js'].lineData[110] = 0;
  _$jscoverage['/timer.js'].lineData[112] = 0;
  _$jscoverage['/timer.js'].lineData[113] = 0;
  _$jscoverage['/timer.js'].lineData[114] = 0;
  _$jscoverage['/timer.js'].lineData[116] = 0;
  _$jscoverage['/timer.js'].lineData[119] = 0;
  _$jscoverage['/timer.js'].lineData[120] = 0;
  _$jscoverage['/timer.js'].lineData[124] = 0;
  _$jscoverage['/timer.js'].lineData[125] = 0;
  _$jscoverage['/timer.js'].lineData[129] = 0;
  _$jscoverage['/timer.js'].lineData[130] = 0;
  _$jscoverage['/timer.js'].lineData[131] = 0;
  _$jscoverage['/timer.js'].lineData[132] = 0;
  _$jscoverage['/timer.js'].lineData[133] = 0;
  _$jscoverage['/timer.js'].lineData[139] = 0;
  _$jscoverage['/timer.js'].lineData[148] = 0;
  _$jscoverage['/timer.js'].lineData[149] = 0;
  _$jscoverage['/timer.js'].lineData[150] = 0;
  _$jscoverage['/timer.js'].lineData[152] = 0;
  _$jscoverage['/timer.js'].lineData[153] = 0;
  _$jscoverage['/timer.js'].lineData[154] = 0;
  _$jscoverage['/timer.js'].lineData[155] = 0;
  _$jscoverage['/timer.js'].lineData[156] = 0;
  _$jscoverage['/timer.js'].lineData[158] = 0;
  _$jscoverage['/timer.js'].lineData[159] = 0;
  _$jscoverage['/timer.js'].lineData[161] = 0;
  _$jscoverage['/timer.js'].lineData[162] = 0;
  _$jscoverage['/timer.js'].lineData[163] = 0;
  _$jscoverage['/timer.js'].lineData[164] = 0;
  _$jscoverage['/timer.js'].lineData[166] = 0;
  _$jscoverage['/timer.js'].lineData[167] = 0;
  _$jscoverage['/timer.js'].lineData[169] = 0;
  _$jscoverage['/timer.js'].lineData[171] = 0;
  _$jscoverage['/timer.js'].lineData[172] = 0;
  _$jscoverage['/timer.js'].lineData[176] = 0;
  _$jscoverage['/timer.js'].lineData[177] = 0;
  _$jscoverage['/timer.js'].lineData[180] = 0;
  _$jscoverage['/timer.js'].lineData[181] = 0;
  _$jscoverage['/timer.js'].lineData[183] = 0;
  _$jscoverage['/timer.js'].lineData[184] = 0;
  _$jscoverage['/timer.js'].lineData[187] = 0;
  _$jscoverage['/timer.js'].lineData[191] = 0;
  _$jscoverage['/timer.js'].lineData[193] = 0;
  _$jscoverage['/timer.js'].lineData[198] = 0;
  _$jscoverage['/timer.js'].lineData[204] = 0;
  _$jscoverage['/timer.js'].lineData[205] = 0;
  _$jscoverage['/timer.js'].lineData[206] = 0;
  _$jscoverage['/timer.js'].lineData[207] = 0;
  _$jscoverage['/timer.js'].lineData[208] = 0;
  _$jscoverage['/timer.js'].lineData[210] = 0;
  _$jscoverage['/timer.js'].lineData[211] = 0;
  _$jscoverage['/timer.js'].lineData[212] = 0;
  _$jscoverage['/timer.js'].lineData[213] = 0;
  _$jscoverage['/timer.js'].lineData[214] = 0;
  _$jscoverage['/timer.js'].lineData[215] = 0;
  _$jscoverage['/timer.js'].lineData[218] = 0;
  _$jscoverage['/timer.js'].lineData[219] = 0;
  _$jscoverage['/timer.js'].lineData[222] = 0;
  _$jscoverage['/timer.js'].lineData[224] = 0;
  _$jscoverage['/timer.js'].lineData[231] = 0;
  _$jscoverage['/timer.js'].lineData[235] = 0;
  _$jscoverage['/timer.js'].lineData[236] = 0;
  _$jscoverage['/timer.js'].lineData[238] = 0;
}
if (! _$jscoverage['/timer.js'].functionData) {
  _$jscoverage['/timer.js'].functionData = [];
  _$jscoverage['/timer.js'].functionData[0] = 0;
  _$jscoverage['/timer.js'].functionData[1] = 0;
  _$jscoverage['/timer.js'].functionData[2] = 0;
  _$jscoverage['/timer.js'].functionData[3] = 0;
  _$jscoverage['/timer.js'].functionData[4] = 0;
  _$jscoverage['/timer.js'].functionData[5] = 0;
  _$jscoverage['/timer.js'].functionData[6] = 0;
  _$jscoverage['/timer.js'].functionData[7] = 0;
  _$jscoverage['/timer.js'].functionData[8] = 0;
  _$jscoverage['/timer.js'].functionData[9] = 0;
  _$jscoverage['/timer.js'].functionData[10] = 0;
}
if (! _$jscoverage['/timer.js'].branchData) {
  _$jscoverage['/timer.js'].branchData = {};
  _$jscoverage['/timer.js'].branchData['17'] = [];
  _$jscoverage['/timer.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['34'] = [];
  _$jscoverage['/timer.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['45'] = [];
  _$jscoverage['/timer.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['55'] = [];
  _$jscoverage['/timer.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['84'] = [];
  _$jscoverage['/timer.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['104'] = [];
  _$jscoverage['/timer.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['109'] = [];
  _$jscoverage['/timer.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['109'][3] = new BranchData();
  _$jscoverage['/timer.js'].branchData['117'] = [];
  _$jscoverage['/timer.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['124'] = [];
  _$jscoverage['/timer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['125'] = [];
  _$jscoverage['/timer.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['152'] = [];
  _$jscoverage['/timer.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['154'] = [];
  _$jscoverage['/timer.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['159'] = [];
  _$jscoverage['/timer.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['161'] = [];
  _$jscoverage['/timer.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['162'] = [];
  _$jscoverage['/timer.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['167'] = [];
  _$jscoverage['/timer.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['171'] = [];
  _$jscoverage['/timer.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['176'] = [];
  _$jscoverage['/timer.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['177'] = [];
  _$jscoverage['/timer.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['180'] = [];
  _$jscoverage['/timer.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['183'] = [];
  _$jscoverage['/timer.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['191'] = [];
  _$jscoverage['/timer.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/timer.js'].branchData['205'] = [];
  _$jscoverage['/timer.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['210'] = [];
  _$jscoverage['/timer.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['212'] = [];
  _$jscoverage['/timer.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['214'] = [];
  _$jscoverage['/timer.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/timer.js'].branchData['218'] = [];
  _$jscoverage['/timer.js'].branchData['218'][1] = new BranchData();
}
_$jscoverage['/timer.js'].branchData['218'][1].init(265, 11, 'c !== false');
function visit113_218_1(result) {
  _$jscoverage['/timer.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['214'][1].init(70, 15, '_propData.frame');
function visit112_214_1(result) {
  _$jscoverage['/timer.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['212'][1].init(67, 12, 'fx.isBasicFx');
function visit111_212_1(result) {
  _$jscoverage['/timer.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['210'][1].init(150, 20, 'fx && !(fx.finished)');
function visit110_210_1(result) {
  _$jscoverage['/timer.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['205'][1].init(215, 6, 'finish');
function visit109_205_1(result) {
  _$jscoverage['/timer.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['191'][2].init(1949, 27, 'self.fire(\'step\') === false');
function visit108_191_2(result) {
  _$jscoverage['/timer.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['191'][1].init(1949, 35, '(self.fire(\'step\') === false) || end');
function visit107_191_1(result) {
  _$jscoverage['/timer.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['183'][1].init(191, 17, '!self.isRunning()');
function visit106_183_1(result) {
  _$jscoverage['/timer.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['180'][2].init(55, 8, 'pos == 1');
function visit105_180_2(result) {
  _$jscoverage['/timer.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['180'][1].init(40, 23, 'fx.finished || pos == 1');
function visit104_180_1(result) {
  _$jscoverage['/timer.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['177'][1].init(39, 18, 'fx.finished || pos');
function visit103_177_1(result) {
  _$jscoverage['/timer.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['176'][1].init(755, 11, 'c !== false');
function visit102_176_1(result) {
  _$jscoverage['/timer.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['171'][1].init(205, 17, '!self.isRunning()');
function visit101_171_1(result) {
  _$jscoverage['/timer.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['167'][1].init(339, 15, '_propData.frame');
function visit100_167_1(result) {
  _$jscoverage['/timer.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['162'][2].init(59, 8, 'pos == 1');
function visit99_162_2(result) {
  _$jscoverage['/timer.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['162'][1].init(44, 23, 'fx.finished || pos == 1');
function visit98_162_1(result) {
  _$jscoverage['/timer.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['161'][1].init(86, 16, 'fx.from == fx.to');
function visit97_161_1(result) {
  _$jscoverage['/timer.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['159'][1].init(245, 12, 'fx.isBasicFx');
function visit96_159_1(result) {
  _$jscoverage['/timer.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['154'][1].init(81, 8, 'pos == 0');
function visit95_154_1(result) {
  _$jscoverage['/timer.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['152'][1].init(134, 14, '!(fx.finished)');
function visit94_152_1(result) {
  _$jscoverage['/timer.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['125'][1].init(34, 19, 'parts[1] === \'-=\'');
function visit93_125_1(result) {
  _$jscoverage['/timer.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['124'][1].init(783, 8, 'parts[1]');
function visit92_124_1(result) {
  _$jscoverage['/timer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['117'][1].init(234, 11, 'tmpCur == 0');
function visit91_117_1(result) {
  _$jscoverage['/timer.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['109'][3].init(158, 13, 'unit !== \'px\'');
function visit90_109_3(result) {
  _$jscoverage['/timer.js'].branchData['109'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['109'][2].init(158, 21, 'unit !== \'px\' && from');
function visit89_109_2(result) {
  _$jscoverage['/timer.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['109'][1].init(150, 29, 'unit && unit !== \'px\' && from');
function visit88_109_1(result) {
  _$jscoverage['/timer.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['104'][1].init(641, 5, 'parts');
function visit87_104_1(result) {
  _$jscoverage['/timer.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['84'][1].init(97, 12, '_propData.fx');
function visit86_84_1(result) {
  _$jscoverage['/timer.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['55'][1].init(83, 19, '!(sh in _propsData)');
function visit85_55_1(result) {
  _$jscoverage['/timer.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['45'][1].init(157, 26, '_propData && !_propData.fx');
function visit84_45_1(result) {
  _$jscoverage['/timer.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['34'][1].init(132, 35, 'typeof _propData.easing == \'string\'');
function visit83_34_1(result) {
  _$jscoverage['/timer.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].branchData['17'][1].init(64, 17, 'prop != camelProp');
function visit82_17_1(result) {
  _$jscoverage['/timer.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer.js'].lineData[6]++;
KISSY.add('anim/timer', function(S, Dom, Event, AnimBase, Easing, AM, Fx, SHORT_HANDS) {
  _$jscoverage['/timer.js'].functionData[0]++;
  _$jscoverage['/timer.js'].lineData[7]++;
  var camelCase = Dom._camelCase, NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
  _$jscoverage['/timer.js'].lineData[10]++;
  function Anim() {
    _$jscoverage['/timer.js'].functionData[1]++;
    _$jscoverage['/timer.js'].lineData[11]++;
    var self = this, to;
    _$jscoverage['/timer.js'].lineData[13]++;
    Anim.superclass.constructor.apply(self, arguments);
    _$jscoverage['/timer.js'].lineData[15]++;
    S.each(to = self.to, function(v, prop) {
  _$jscoverage['/timer.js'].functionData[2]++;
  _$jscoverage['/timer.js'].lineData[16]++;
  var camelProp = camelCase(prop);
  _$jscoverage['/timer.js'].lineData[17]++;
  if (visit82_17_1(prop != camelProp)) {
    _$jscoverage['/timer.js'].lineData[18]++;
    to[camelProp] = to[prop];
    _$jscoverage['/timer.js'].lineData[19]++;
    delete to[prop];
  }
});
  }
  _$jscoverage['/timer.js'].lineData[24]++;
  S.extend(Anim, AnimBase, {
  prepareFx: function() {
  _$jscoverage['/timer.js'].functionData[3]++;
  _$jscoverage['/timer.js'].lineData[26]++;
  var self = this, node = self.node, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[30]++;
  S.each(_propsData, function(_propData) {
  _$jscoverage['/timer.js'].functionData[4]++;
  _$jscoverage['/timer.js'].lineData[32]++;
  _propData.duration *= 1000;
  _$jscoverage['/timer.js'].lineData[33]++;
  _propData.delay *= 1000;
  _$jscoverage['/timer.js'].lineData[34]++;
  if (visit83_34_1(typeof _propData.easing == 'string')) {
    _$jscoverage['/timer.js'].lineData[35]++;
    _propData.easing = Easing.toFn(_propData.easing);
  }
});
  _$jscoverage['/timer.js'].lineData[40]++;
  S.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/timer.js'].functionData[5]++;
  _$jscoverage['/timer.js'].lineData[41]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/timer.js'].lineData[45]++;
  if (visit84_45_1(_propData && !_propData.fx)) {
    _$jscoverage['/timer.js'].lineData[46]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[47]++;
    origin = {};
    _$jscoverage['/timer.js'].lineData[48]++;
    S.each(shortHands, function(sh) {
  _$jscoverage['/timer.js'].functionData[6]++;
  _$jscoverage['/timer.js'].lineData[50]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/timer.js'].lineData[52]++;
    Dom.css(node, p, val);
    _$jscoverage['/timer.js'].lineData[53]++;
    S.each(origin, function(val, sh) {
  _$jscoverage['/timer.js'].functionData[7]++;
  _$jscoverage['/timer.js'].lineData[55]++;
  if (visit85_55_1(!(sh in _propsData))) {
    _$jscoverage['/timer.js'].lineData[56]++;
    _propsData[sh] = S.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/timer.js'].lineData[61]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/timer.js'].lineData[64]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/timer.js'].lineData[68]++;
  var prop, _propData, val, to, from, propCfg, fx, unit, parts;
  _$jscoverage['/timer.js'].lineData[79]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[81]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[84]++;
    if (visit86_84_1(_propData.fx)) {
      _$jscoverage['/timer.js'].lineData[85]++;
      _propData.fx.prop = prop;
      _$jscoverage['/timer.js'].lineData[86]++;
      continue;
    }
    _$jscoverage['/timer.js'].lineData[89]++;
    val = _propData.value;
    _$jscoverage['/timer.js'].lineData[90]++;
    propCfg = {
  prop: prop, 
  anim: self, 
  propData: _propData};
    _$jscoverage['/timer.js'].lineData[95]++;
    fx = Fx.getFx(propCfg);
    _$jscoverage['/timer.js'].lineData[96]++;
    to = val;
    _$jscoverage['/timer.js'].lineData[98]++;
    from = fx.cur();
    _$jscoverage['/timer.js'].lineData[100]++;
    val += '';
    _$jscoverage['/timer.js'].lineData[101]++;
    unit = '';
    _$jscoverage['/timer.js'].lineData[102]++;
    parts = val.match(NUMBER_REG);
    _$jscoverage['/timer.js'].lineData[104]++;
    if (visit87_104_1(parts)) {
      _$jscoverage['/timer.js'].lineData[105]++;
      to = parseFloat(parts[2]);
      _$jscoverage['/timer.js'].lineData[106]++;
      unit = parts[3];
      _$jscoverage['/timer.js'].lineData[109]++;
      if (visit88_109_1(unit && visit89_109_2(visit90_109_3(unit !== 'px') && from))) {
        _$jscoverage['/timer.js'].lineData[110]++;
        var tmpCur = 0, to2 = to;
        _$jscoverage['/timer.js'].lineData[112]++;
        do {
          _$jscoverage['/timer.js'].lineData[113]++;
          ++to2;
          _$jscoverage['/timer.js'].lineData[114]++;
          Dom.css(node, prop, to2 + unit);
          _$jscoverage['/timer.js'].lineData[116]++;
          tmpCur = fx.cur();
        } while (visit91_117_1(tmpCur == 0));
        _$jscoverage['/timer.js'].lineData[119]++;
        from = (to2 / tmpCur) * from;
        _$jscoverage['/timer.js'].lineData[120]++;
        Dom.css(node, prop, from + unit);
      }
      _$jscoverage['/timer.js'].lineData[124]++;
      if (visit92_124_1(parts[1])) {
        _$jscoverage['/timer.js'].lineData[125]++;
        to = ((visit93_125_1(parts[1] === '-=') ? -1 : 1) * to) + from;
      }
    }
    _$jscoverage['/timer.js'].lineData[129]++;
    propCfg.from = from;
    _$jscoverage['/timer.js'].lineData[130]++;
    propCfg.to = to;
    _$jscoverage['/timer.js'].lineData[131]++;
    propCfg.unit = unit;
    _$jscoverage['/timer.js'].lineData[132]++;
    fx.load(propCfg);
    _$jscoverage['/timer.js'].lineData[133]++;
    _propData.fx = fx;
  }
}, 
  frame: function() {
  _$jscoverage['/timer.js'].functionData[8]++;
  _$jscoverage['/timer.js'].lineData[139]++;
  var self = this, prop, end = 1, c, fx, pos, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[148]++;
  for (prop in _propsData) {
    _$jscoverage['/timer.js'].lineData[149]++;
    _propData = _propsData[prop];
    _$jscoverage['/timer.js'].lineData[150]++;
    fx = _propData.fx;
    _$jscoverage['/timer.js'].lineData[152]++;
    if (visit94_152_1(!(fx.finished))) {
      _$jscoverage['/timer.js'].lineData[153]++;
      pos = Fx.getPos(self, _propData);
      _$jscoverage['/timer.js'].lineData[154]++;
      if (visit95_154_1(pos == 0)) {
        _$jscoverage['/timer.js'].lineData[155]++;
        end = 0;
        _$jscoverage['/timer.js'].lineData[156]++;
        continue;
      }
      _$jscoverage['/timer.js'].lineData[158]++;
      fx.pos = pos;
      _$jscoverage['/timer.js'].lineData[159]++;
      if (visit96_159_1(fx.isBasicFx)) {
        _$jscoverage['/timer.js'].lineData[161]++;
        if (visit97_161_1(fx.from == fx.to)) {
          _$jscoverage['/timer.js'].lineData[162]++;
          fx.finished = visit98_162_1(fx.finished || visit99_162_2(pos == 1));
          _$jscoverage['/timer.js'].lineData[163]++;
          end = 0;
          _$jscoverage['/timer.js'].lineData[164]++;
          continue;
        }
        _$jscoverage['/timer.js'].lineData[166]++;
        c = 0;
        _$jscoverage['/timer.js'].lineData[167]++;
        if (visit100_167_1(_propData.frame)) {
          _$jscoverage['/timer.js'].lineData[169]++;
          c = _propData.frame(self, fx);
          _$jscoverage['/timer.js'].lineData[171]++;
          if (visit101_171_1(!self.isRunning())) {
            _$jscoverage['/timer.js'].lineData[172]++;
            return;
          }
        }
        _$jscoverage['/timer.js'].lineData[176]++;
        if (visit102_176_1(c !== false)) {
          _$jscoverage['/timer.js'].lineData[177]++;
          fx.frame(visit103_177_1(fx.finished || pos));
        }
      } else {
        _$jscoverage['/timer.js'].lineData[180]++;
        fx.finished = visit104_180_1(fx.finished || visit105_180_2(pos == 1));
        _$jscoverage['/timer.js'].lineData[181]++;
        fx.frame(self, fx);
        _$jscoverage['/timer.js'].lineData[183]++;
        if (visit106_183_1(!self.isRunning())) {
          _$jscoverage['/timer.js'].lineData[184]++;
          return;
        }
      }
      _$jscoverage['/timer.js'].lineData[187]++;
      end &= fx.finished;
    }
  }
  _$jscoverage['/timer.js'].lineData[191]++;
  if (visit107_191_1((visit108_191_2(self.fire('step') === false)) || end)) {
    _$jscoverage['/timer.js'].lineData[193]++;
    self['stop'](end);
  }
}, 
  doStop: function(finish) {
  _$jscoverage['/timer.js'].functionData[9]++;
  _$jscoverage['/timer.js'].lineData[198]++;
  var self = this, prop, fx, c, _propData, _propsData = self._propsData;
  _$jscoverage['/timer.js'].lineData[204]++;
  AM.stop(self);
  _$jscoverage['/timer.js'].lineData[205]++;
  if (visit109_205_1(finish)) {
    _$jscoverage['/timer.js'].lineData[206]++;
    for (prop in _propsData) {
      _$jscoverage['/timer.js'].lineData[207]++;
      _propData = _propsData[prop];
      _$jscoverage['/timer.js'].lineData[208]++;
      fx = _propData.fx;
      _$jscoverage['/timer.js'].lineData[210]++;
      if (visit110_210_1(fx && !(fx.finished))) {
        _$jscoverage['/timer.js'].lineData[211]++;
        fx.pos = 1;
        _$jscoverage['/timer.js'].lineData[212]++;
        if (visit111_212_1(fx.isBasicFx)) {
          _$jscoverage['/timer.js'].lineData[213]++;
          c = 0;
          _$jscoverage['/timer.js'].lineData[214]++;
          if (visit112_214_1(_propData.frame)) {
            _$jscoverage['/timer.js'].lineData[215]++;
            c = _propData.frame(self, fx);
          }
          _$jscoverage['/timer.js'].lineData[218]++;
          if (visit113_218_1(c !== false)) {
            _$jscoverage['/timer.js'].lineData[219]++;
            fx.frame(1);
          }
        } else {
          _$jscoverage['/timer.js'].lineData[222]++;
          fx.frame(self, fx);
        }
        _$jscoverage['/timer.js'].lineData[224]++;
        fx.finished = 1;
      }
    }
  }
}, 
  doStart: function() {
  _$jscoverage['/timer.js'].functionData[10]++;
  _$jscoverage['/timer.js'].lineData[231]++;
  AM.start(this);
}});
  _$jscoverage['/timer.js'].lineData[235]++;
  Anim.Easing = Easing;
  _$jscoverage['/timer.js'].lineData[236]++;
  Anim.Fx = Fx;
  _$jscoverage['/timer.js'].lineData[238]++;
  return Anim;
}, {
  requires: ['dom', 'event', './base', './timer/easing', './timer/manager', './timer/fx', './timer/short-hand', './timer/color', './timer/transform']});
