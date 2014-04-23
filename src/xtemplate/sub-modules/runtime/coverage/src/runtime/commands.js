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
if (! _$jscoverage['/runtime/commands.js']) {
  _$jscoverage['/runtime/commands.js'] = {};
  _$jscoverage['/runtime/commands.js'].lineData = [];
  _$jscoverage['/runtime/commands.js'].lineData[6] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[7] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[9] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[11] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[12] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[13] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[14] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[15] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[16] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[17] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[19] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[20] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[21] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[22] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[23] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[26] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[29] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[30] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[33] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[34] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[37] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[38] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[41] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[42] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[45] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[46] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[50] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[54] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[68] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[69] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[72] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[73] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[75] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[80] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[84] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[86] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[87] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[88] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[96] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[100] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[101] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[105] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[106] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[107] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[108] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[109] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[116] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[120] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[121] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[123] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[125] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[126] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[127] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[128] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[129] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[130] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[131] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[133] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[134] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[138] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[139] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[140] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[142] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[144] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[152] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[153] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[154] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[155] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[156] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[158] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[159] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[164] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[165] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[166] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[167] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[168] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[169] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[170] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[172] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[174] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[176] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[177] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[180] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[184] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[185] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[186] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[190] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].functionData) {
  _$jscoverage['/runtime/commands.js'].functionData = [];
  _$jscoverage['/runtime/commands.js'].functionData[0] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[1] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[2] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[3] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[4] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[5] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[6] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[7] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[8] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[9] = 0;
  _$jscoverage['/runtime/commands.js'].functionData[10] = 0;
}
if (! _$jscoverage['/runtime/commands.js'].branchData) {
  _$jscoverage['/runtime/commands.js'].branchData = {};
  _$jscoverage['/runtime/commands.js'].branchData['13'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['19'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['20'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['26'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['30'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['42'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['56'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['68'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['69'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['72'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['86'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['109'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['113'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['120'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['122'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['123'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['126'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['129'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['138'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['141'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['156'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['158'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['167'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['168'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['184'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['184'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['184'][1].init(6528, 9, '\'@DEBUG@\'');
function visit26_184_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['168'][1].init(63, 7, 'i < len');
function visit25_168_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['167'][1].init(142, 40, 'macro && (paramNames = macro.paramNames)');
function visit24_167_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['158'][1].init(265, 9, 'option.fn');
function visit23_158_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['156'][1].init(199, 20, 'payload.macros || {}');
function visit22_156_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['141'][1].init(26, 9, 'cursor.fn');
function visit21_141_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['138'][1].init(1189, 22, '!payload.extendTplName');
function visit20_138_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['129'][2].init(106, 25, 'cursor.type === \'prepend\'');
function visit19_129_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['129'][1].init(96, 35, 'cursor && cursor.type === \'prepend\'');
function visit18_129_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['126'][1].init(169, 23, 'head.type === \'prepend\'');
function visit17_126_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['123'][1].init(22, 22, 'head.type === \'append\'');
function visit16_123_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['122'][1].init(600, 9, 'head.type');
function visit15_122_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['120'][1].init(520, 5, '!head');
function visit14_120_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['113'][1].init(308, 20, 'payload.blocks || {}');
function visit13_113_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['109'][1].init(152, 19, 'params.length === 2');
function visit12_109_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['86'][1].init(94, 11, 'option.hash');
function visit11_86_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['72'][1].init(240, 14, 'option.inverse');
function visit10_72_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['69'][1].init(22, 9, 'option.fn');
function visit9_69_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['68'][1].init(96, 6, 'param0');
function visit8_68_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['56'][1].init(96, 6, 'param0');
function visit7_56_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['42'][1].init(135, 9, 'valueName');
function visit6_42_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['30'][1].init(209, 9, 'valueName');
function visit5_30_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['26'][1].init(243, 15, 'xindex < xcount');
function visit4_26_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['20'][1].init(22, 17, 'S.isArray(param0)');
function visit3_20_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['19'][1].init(324, 6, 'param0');
function visit2_19_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['13'][1].init(109, 21, 'params[2] || \'xindex\'');
function visit1_13_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime/commands.js'].functionData[0]++;
  _$jscoverage['/runtime/commands.js'].lineData[7]++;
  var Scope = require('./scope');
  _$jscoverage['/runtime/commands.js'].lineData[9]++;
  var commands = {
  each: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[1]++;
  _$jscoverage['/runtime/commands.js'].lineData[11]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[12]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[13]++;
  var xindexName = visit1_13_1(params[2] || 'xindex');
  _$jscoverage['/runtime/commands.js'].lineData[14]++;
  var valueName = params[1];
  _$jscoverage['/runtime/commands.js'].lineData[15]++;
  var xcount;
  _$jscoverage['/runtime/commands.js'].lineData[16]++;
  var opScope;
  _$jscoverage['/runtime/commands.js'].lineData[17]++;
  var affix;
  _$jscoverage['/runtime/commands.js'].lineData[19]++;
  if (visit2_19_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[20]++;
    if (visit3_20_1(S.isArray(param0))) {
      _$jscoverage['/runtime/commands.js'].lineData[21]++;
      xcount = param0.length;
      _$jscoverage['/runtime/commands.js'].lineData[22]++;
      opScope = new Scope();
      _$jscoverage['/runtime/commands.js'].lineData[23]++;
      affix = opScope.affix = {
  xcount: xcount};
      _$jscoverage['/runtime/commands.js'].lineData[26]++;
      for (var xindex = 0; visit4_26_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[28]++;
        opScope.data = param0[xindex];
        _$jscoverage['/runtime/commands.js'].lineData[29]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[30]++;
        if (visit5_30_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[31]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[33]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[34]++;
        buffer = option.fn(opScope, buffer);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[37]++;
      opScope = new Scope();
      _$jscoverage['/runtime/commands.js'].lineData[38]++;
      affix = opScope.affix = {};
      _$jscoverage['/runtime/commands.js'].lineData[39]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[40]++;
        opScope.data = param0[name];
        _$jscoverage['/runtime/commands.js'].lineData[41]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[42]++;
        if (visit6_42_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[43]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[45]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[46]++;
        buffer = option.fn(opScope, buffer);
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[50]++;
  return buffer;
}, 
  'with': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[54]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[55]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[56]++;
  if (visit7_56_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[58]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[59]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[60]++;
    buffer = option.fn(opScope, buffer);
  }
  _$jscoverage['/runtime/commands.js'].lineData[62]++;
  return buffer;
}, 
  'if': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[66]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[67]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[68]++;
  if (visit8_68_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[69]++;
    if (visit9_69_1(option.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[70]++;
      buffer = option.fn(scope, buffer);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[72]++;
    if (visit10_72_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[73]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[75]++;
  return buffer;
}, 
  set: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[79]++;
  scope.mix(option.hash);
  _$jscoverage['/runtime/commands.js'].lineData[80]++;
  return buffer;
}, 
  include: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[84]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[86]++;
  if (visit11_86_1(option.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[87]++;
    var newScope = new Scope(option.hash);
    _$jscoverage['/runtime/commands.js'].lineData[88]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[89]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[91]++;
  return this.include(params[0], scope, buffer, payload);
}, 
  parse: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[96]++;
  return commands.include.call(this, new Scope(), option, buffer, payload);
}, 
  extend: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[100]++;
  payload.extendTplName = option.params[0];
  _$jscoverage['/runtime/commands.js'].lineData[101]++;
  return buffer;
}, 
  block: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[105]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[106]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[107]++;
  var blockName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[108]++;
  var type;
  _$jscoverage['/runtime/commands.js'].lineData[109]++;
  if (visit12_109_1(params.length === 2)) {
    _$jscoverage['/runtime/commands.js'].lineData[110]++;
    type = params[0];
    _$jscoverage['/runtime/commands.js'].lineData[111]++;
    blockName = params[1];
  }
  _$jscoverage['/runtime/commands.js'].lineData[113]++;
  var blocks = payload.blocks = visit13_113_1(payload.blocks || {});
  _$jscoverage['/runtime/commands.js'].lineData[114]++;
  var head = blocks[blockName], cursor;
  _$jscoverage['/runtime/commands.js'].lineData[116]++;
  var current = {
  fn: option.fn, 
  type: type};
  _$jscoverage['/runtime/commands.js'].lineData[120]++;
  if (visit14_120_1(!head)) {
    _$jscoverage['/runtime/commands.js'].lineData[121]++;
    blocks[blockName] = current;
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[122]++;
    if (visit15_122_1(head.type)) {
      _$jscoverage['/runtime/commands.js'].lineData[123]++;
      if (visit16_123_1(head.type === 'append')) {
        _$jscoverage['/runtime/commands.js'].lineData[124]++;
        current.next = head;
        _$jscoverage['/runtime/commands.js'].lineData[125]++;
        blocks[blockName] = current;
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[126]++;
        if (visit17_126_1(head.type === 'prepend')) {
          _$jscoverage['/runtime/commands.js'].lineData[127]++;
          var prev;
          _$jscoverage['/runtime/commands.js'].lineData[128]++;
          cursor = head;
          _$jscoverage['/runtime/commands.js'].lineData[129]++;
          while (visit18_129_1(cursor && visit19_129_2(cursor.type === 'prepend'))) {
            _$jscoverage['/runtime/commands.js'].lineData[130]++;
            prev = cursor;
            _$jscoverage['/runtime/commands.js'].lineData[131]++;
            cursor = cursor.next;
          }
          _$jscoverage['/runtime/commands.js'].lineData[133]++;
          current.next = cursor;
          _$jscoverage['/runtime/commands.js'].lineData[134]++;
          prev.next = current;
        }
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[138]++;
  if (visit20_138_1(!payload.extendTplName)) {
    _$jscoverage['/runtime/commands.js'].lineData[139]++;
    cursor = blocks[blockName];
    _$jscoverage['/runtime/commands.js'].lineData[140]++;
    while (cursor) {
      _$jscoverage['/runtime/commands.js'].lineData[141]++;
      if (visit21_141_1(cursor.fn)) {
        _$jscoverage['/runtime/commands.js'].lineData[142]++;
        buffer = cursor.fn.call(self, scope, buffer);
      }
      _$jscoverage['/runtime/commands.js'].lineData[144]++;
      cursor = cursor.next;
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[148]++;
  return buffer;
}, 
  macro: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[152]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[153]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[154]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[155]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[156]++;
  var macros = payload.macros = visit22_156_1(payload.macros || {});
  _$jscoverage['/runtime/commands.js'].lineData[158]++;
  if (visit23_158_1(option.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[159]++;
    macros[macroName] = {
  paramNames: params1, 
  fn: option.fn};
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[164]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[165]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[166]++;
    var paramNames;
    _$jscoverage['/runtime/commands.js'].lineData[167]++;
    if (visit24_167_1(macro && (paramNames = macro.paramNames))) {
      _$jscoverage['/runtime/commands.js'].lineData[168]++;
      for (var i = 0, len = paramNames.length; visit25_168_1(i < len); i++) {
        _$jscoverage['/runtime/commands.js'].lineData[169]++;
        var p = paramNames[i];
        _$jscoverage['/runtime/commands.js'].lineData[170]++;
        paramValues[p] = params1[i];
      }
      _$jscoverage['/runtime/commands.js'].lineData[172]++;
      var newScope = new Scope(paramValues);
      _$jscoverage['/runtime/commands.js'].lineData[174]++;
      buffer = macro.fn.call(self, newScope, buffer);
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[176]++;
      var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + lineNumber;
      _$jscoverage['/runtime/commands.js'].lineData[177]++;
      S.error(error);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[180]++;
  return buffer;
}};
  _$jscoverage['/runtime/commands.js'].lineData[184]++;
  if (visit26_184_1('@DEBUG@')) {
    _$jscoverage['/runtime/commands.js'].lineData[185]++;
    commands['debugger'] = function() {
  _$jscoverage['/runtime/commands.js'].functionData[10]++;
  _$jscoverage['/runtime/commands.js'].lineData[186]++;
  S.globalEval('debugger');
};
  }
  _$jscoverage['/runtime/commands.js'].lineData[190]++;
  return commands;
});
