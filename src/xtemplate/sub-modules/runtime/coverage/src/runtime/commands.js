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
  _$jscoverage['/runtime/commands.js'].lineData[24] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[27] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[28] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[29] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[31] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[32] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[35] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[36] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[37] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[38] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[39] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[40] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[42] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[43] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[47] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[51] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[52] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[53] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[55] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[59] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[63] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[64] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[65] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[67] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[69] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[72] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[78] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[87] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[89] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[90] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[94] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[95] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[98] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[103] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[107] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[108] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[112] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[115] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[116] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[117] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[119] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[121] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[122] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[128] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[129] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[130] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[131] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[132] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[133] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[134] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[135] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[136] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[137] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[138] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[139] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[141] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[142] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[146] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[147] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[149] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[150] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[152] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[156] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[160] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[161] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[162] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[163] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[164] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[165] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[167] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[168] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[173] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[174] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[175] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[176] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[177] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[178] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[179] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[181] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[183] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[185] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[186] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[189] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[193] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[194] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[195] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[199] = 0;
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
  _$jscoverage['/runtime/commands.js'].branchData['22'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['28'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['39'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['53'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['65'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['66'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['69'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['89'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['94'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['117'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['121'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['128'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['130'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['131'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['134'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['137'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['146'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['149'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['165'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['167'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['176'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['177'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['193'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['193'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['193'][1].init(6624, 9, '\'@DEBUG@\'');
function visit27_193_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['177'][1].init(63, 7, 'i < len');
function visit26_177_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['176'][1].init(142, 40, 'macro && (paramNames = macro.paramNames)');
function visit25_176_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['167'][1].init(306, 9, 'option.fn');
function visit24_167_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['165'][1].init(240, 20, 'session.macros || {}');
function visit23_165_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['149'][1].init(26, 9, 'cursor.fn');
function visit22_149_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['146'][1].init(1230, 22, '!session.extendTplName');
function visit21_146_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['137'][2].init(106, 25, 'cursor.type === \'prepend\'');
function visit20_137_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['137'][1].init(96, 35, 'cursor && cursor.type === \'prepend\'');
function visit19_137_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['134'][1].init(169, 23, 'head.type === \'prepend\'');
function visit18_134_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['131'][1].init(22, 22, 'head.type === \'append\'');
function visit17_131_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['130'][1].init(641, 9, 'head.type');
function visit16_130_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['128'][1].init(561, 5, '!head');
function visit15_128_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['121'][1].init(349, 20, 'session.blocks || {}');
function visit14_121_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['117'][1].init(193, 19, 'params.length === 2');
function visit13_117_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['94'][1].init(346, 5, 'i < l');
function visit12_94_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['89'][1].init(193, 11, 'option.hash');
function visit11_89_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['69'][1].init(240, 14, 'option.inverse');
function visit10_69_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['66'][1].init(22, 9, 'option.fn');
function visit9_66_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['65'][1].init(96, 6, 'param0');
function visit8_65_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['53'][1].init(96, 6, 'param0');
function visit7_53_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['39'][1].init(194, 9, 'valueName');
function visit6_39_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['28'][1].init(268, 9, 'valueName');
function visit5_28_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['22'][1].init(88, 15, 'xindex < xcount');
function visit4_22_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['22'][1].ranCondition(result);
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
      for (var xindex = 0; visit4_22_1(xindex < xcount); xindex++) {
        _$jscoverage['/runtime/commands.js'].lineData[23]++;
        opScope = new Scope(param0[xindex]);
        _$jscoverage['/runtime/commands.js'].lineData[24]++;
        affix = opScope.affix = {
  xcount: xcount};
        _$jscoverage['/runtime/commands.js'].lineData[27]++;
        affix[xindexName] = xindex;
        _$jscoverage['/runtime/commands.js'].lineData[28]++;
        if (visit5_28_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[29]++;
          affix[valueName] = param0[xindex];
        }
        _$jscoverage['/runtime/commands.js'].lineData[31]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[32]++;
        buffer = option.fn(opScope, buffer);
      }
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[35]++;
      for (var name in param0) {
        _$jscoverage['/runtime/commands.js'].lineData[36]++;
        opScope = new Scope(param0[name]);
        _$jscoverage['/runtime/commands.js'].lineData[37]++;
        affix = opScope.affix = {};
        _$jscoverage['/runtime/commands.js'].lineData[38]++;
        affix[xindexName] = name;
        _$jscoverage['/runtime/commands.js'].lineData[39]++;
        if (visit6_39_1(valueName)) {
          _$jscoverage['/runtime/commands.js'].lineData[40]++;
          affix[valueName] = param0[name];
        }
        _$jscoverage['/runtime/commands.js'].lineData[42]++;
        opScope.setParent(scope);
        _$jscoverage['/runtime/commands.js'].lineData[43]++;
        buffer = option.fn(opScope, buffer);
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[47]++;
  return buffer;
}, 
  'with': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[51]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[52]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[53]++;
  if (visit7_53_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[55]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[56]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[57]++;
    buffer = option.fn(opScope, buffer);
  }
  _$jscoverage['/runtime/commands.js'].lineData[59]++;
  return buffer;
}, 
  'if': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[63]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[64]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[65]++;
  if (visit8_65_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[66]++;
    if (visit9_66_1(option.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[67]++;
      buffer = option.fn(scope, buffer);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[69]++;
    if (visit10_69_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[70]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[72]++;
  return buffer;
}, 
  set: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[78]++;
  scope.mix(option.hash);
  _$jscoverage['/runtime/commands.js'].lineData[79]++;
  return buffer;
}, 
  include: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[83]++;
  var params = option.params, i, newScope, l = params.length;
  _$jscoverage['/runtime/commands.js'].lineData[87]++;
  newScope = scope;
  _$jscoverage['/runtime/commands.js'].lineData[89]++;
  if (visit11_89_1(option.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[90]++;
    newScope = new Scope(option.hash);
    _$jscoverage['/runtime/commands.js'].lineData[91]++;
    newScope.setParent(scope);
  }
  _$jscoverage['/runtime/commands.js'].lineData[94]++;
  for (i = 0; visit12_94_1(i < l); i++) {
    _$jscoverage['/runtime/commands.js'].lineData[95]++;
    buffer = this.root.include(params[i], this, newScope, buffer);
  }
  _$jscoverage['/runtime/commands.js'].lineData[98]++;
  return buffer;
}, 
  parse: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[103]++;
  return commands.include.call(this, new Scope(), option, buffer);
}, 
  extend: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[107]++;
  this.session.extendTplName = option.params[0];
  _$jscoverage['/runtime/commands.js'].lineData[108]++;
  return buffer;
}, 
  block: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[113]++;
  var session = self.session;
  _$jscoverage['/runtime/commands.js'].lineData[114]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[115]++;
  var blockName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[116]++;
  var type;
  _$jscoverage['/runtime/commands.js'].lineData[117]++;
  if (visit13_117_1(params.length === 2)) {
    _$jscoverage['/runtime/commands.js'].lineData[118]++;
    type = params[0];
    _$jscoverage['/runtime/commands.js'].lineData[119]++;
    blockName = params[1];
  }
  _$jscoverage['/runtime/commands.js'].lineData[121]++;
  var blocks = session.blocks = visit14_121_1(session.blocks || {});
  _$jscoverage['/runtime/commands.js'].lineData[122]++;
  var head = blocks[blockName], cursor;
  _$jscoverage['/runtime/commands.js'].lineData[124]++;
  var current = {
  fn: option.fn, 
  type: type};
  _$jscoverage['/runtime/commands.js'].lineData[128]++;
  if (visit15_128_1(!head)) {
    _$jscoverage['/runtime/commands.js'].lineData[129]++;
    blocks[blockName] = current;
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[130]++;
    if (visit16_130_1(head.type)) {
      _$jscoverage['/runtime/commands.js'].lineData[131]++;
      if (visit17_131_1(head.type === 'append')) {
        _$jscoverage['/runtime/commands.js'].lineData[132]++;
        current.next = head;
        _$jscoverage['/runtime/commands.js'].lineData[133]++;
        blocks[blockName] = current;
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[134]++;
        if (visit18_134_1(head.type === 'prepend')) {
          _$jscoverage['/runtime/commands.js'].lineData[135]++;
          var prev;
          _$jscoverage['/runtime/commands.js'].lineData[136]++;
          cursor = head;
          _$jscoverage['/runtime/commands.js'].lineData[137]++;
          while (visit19_137_1(cursor && visit20_137_2(cursor.type === 'prepend'))) {
            _$jscoverage['/runtime/commands.js'].lineData[138]++;
            prev = cursor;
            _$jscoverage['/runtime/commands.js'].lineData[139]++;
            cursor = cursor.next;
          }
          _$jscoverage['/runtime/commands.js'].lineData[141]++;
          current.next = cursor;
          _$jscoverage['/runtime/commands.js'].lineData[142]++;
          prev.next = current;
        }
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[146]++;
  if (visit21_146_1(!session.extendTplName)) {
    _$jscoverage['/runtime/commands.js'].lineData[147]++;
    cursor = blocks[blockName];
    _$jscoverage['/runtime/commands.js'].lineData[148]++;
    while (cursor) {
      _$jscoverage['/runtime/commands.js'].lineData[149]++;
      if (visit22_149_1(cursor.fn)) {
        _$jscoverage['/runtime/commands.js'].lineData[150]++;
        buffer = cursor.fn.call(self, scope, buffer);
      }
      _$jscoverage['/runtime/commands.js'].lineData[152]++;
      cursor = cursor.next;
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[156]++;
  return buffer;
}, 
  macro: function(scope, option, buffer, lineNumber) {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[160]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[161]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[162]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[163]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[164]++;
  var session = self.session;
  _$jscoverage['/runtime/commands.js'].lineData[165]++;
  var macros = session.macros = visit23_165_1(session.macros || {});
  _$jscoverage['/runtime/commands.js'].lineData[167]++;
  if (visit24_167_1(option.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[168]++;
    macros[macroName] = {
  paramNames: params1, 
  fn: option.fn};
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[173]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[174]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[175]++;
    var paramNames;
    _$jscoverage['/runtime/commands.js'].lineData[176]++;
    if (visit25_176_1(macro && (paramNames = macro.paramNames))) {
      _$jscoverage['/runtime/commands.js'].lineData[177]++;
      for (var i = 0, len = paramNames.length; visit26_177_1(i < len); i++) {
        _$jscoverage['/runtime/commands.js'].lineData[178]++;
        var p = paramNames[i];
        _$jscoverage['/runtime/commands.js'].lineData[179]++;
        paramValues[p] = params1[i];
      }
      _$jscoverage['/runtime/commands.js'].lineData[181]++;
      var newScope = new Scope(paramValues);
      _$jscoverage['/runtime/commands.js'].lineData[183]++;
      buffer = macro.fn.call(self, newScope, buffer);
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[185]++;
      var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + lineNumber;
      _$jscoverage['/runtime/commands.js'].lineData[186]++;
      S.error(error);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[189]++;
  return buffer;
}};
  _$jscoverage['/runtime/commands.js'].lineData[193]++;
  if (visit27_193_1('@DEBUG@')) {
    _$jscoverage['/runtime/commands.js'].lineData[194]++;
    commands['debugger'] = function() {
  _$jscoverage['/runtime/commands.js'].functionData[10]++;
  _$jscoverage['/runtime/commands.js'].lineData[195]++;
  S.globalEval('debugger');
};
  }
  _$jscoverage['/runtime/commands.js'].lineData[199]++;
  return commands;
});
