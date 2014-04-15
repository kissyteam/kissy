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
  _$jscoverage['/runtime/commands.js'].lineData[49] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[50] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[52] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[56] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[57] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[58] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[60] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[61] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[62] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[63] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[64] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[66] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[70] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[71] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[72] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[73] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[74] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[76] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[77] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[79] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[83] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[84] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[88] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[90] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[91] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[92] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[93] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[95] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[100] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[104] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[105] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[109] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[110] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[111] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[112] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[113] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[114] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[115] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[117] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[118] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[120] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[124] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[125] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[126] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[127] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[128] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[129] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[130] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[131] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[132] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[133] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[134] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[135] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[137] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[138] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[142] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[143] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[144] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[145] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[146] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[148] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[152] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[156] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[157] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[158] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[159] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[160] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[162] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[163] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[168] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[169] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[170] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[171] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[172] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[173] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[174] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[176] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[178] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[180] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[181] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[184] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[188] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[189] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[190] = 0;
  _$jscoverage['/runtime/commands.js'].lineData[194] = 0;
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
  _$jscoverage['/runtime/commands.js'].branchData['49'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['58'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['63'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['72'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['73'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['76'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['90'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['113'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['117'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['124'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['126'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['127'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['130'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['133'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['142'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['145'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['160'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['162'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['171'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['172'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/runtime/commands.js'].branchData['188'] = [];
  _$jscoverage['/runtime/commands.js'].branchData['188'][1] = new BranchData();
}
_$jscoverage['/runtime/commands.js'].branchData['188'][1].init(6726, 9, '\'@DEBUG@\'');
function visit28_188_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['172'][1].init(63, 7, 'i < len');
function visit27_172_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['171'][1].init(142, 40, 'macro && (paramNames = macro.paramNames)');
function visit26_171_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['162'][1].init(265, 9, 'option.fn');
function visit25_162_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['160'][1].init(199, 20, 'payload.macros || {}');
function visit24_160_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['145'][1].init(26, 9, 'cursor.fn');
function visit23_145_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['142'][1].init(1189, 22, '!payload.extendTplName');
function visit22_142_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['133'][2].init(106, 25, 'cursor.type === \'prepend\'');
function visit21_133_2(result) {
  _$jscoverage['/runtime/commands.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['133'][1].init(96, 35, 'cursor && cursor.type === \'prepend\'');
function visit20_133_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['130'][1].init(169, 23, 'head.type === \'prepend\'');
function visit19_130_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['127'][1].init(22, 22, 'head.type === \'append\'');
function visit18_127_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['126'][1].init(600, 9, 'head.type');
function visit17_126_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['124'][1].init(520, 5, '!head');
function visit16_124_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['117'][1].init(308, 20, 'payload.blocks || {}');
function visit15_117_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['113'][1].init(152, 19, 'params.length === 2');
function visit14_113_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['90'][1].init(94, 11, 'option.hash');
function visit13_90_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['76'][1].init(240, 14, 'option.inverse');
function visit12_76_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['73'][1].init(22, 9, 'option.fn');
function visit11_73_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['72'][1].init(96, 6, 'param0');
function visit10_72_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['63'][1].init(332, 14, 'option.inverse');
function visit9_63_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['58'][1].init(96, 6, 'param0');
function visit8_58_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime/commands.js'].branchData['49'][1].init(1678, 14, 'option.inverse');
function visit7_49_1(result) {
  _$jscoverage['/runtime/commands.js'].branchData['49'][1].ranCondition(result);
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
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[49]++;
    if (visit7_49_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[50]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[52]++;
  return buffer;
}, 
  'with': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[2]++;
  _$jscoverage['/runtime/commands.js'].lineData[56]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[57]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[58]++;
  if (visit8_58_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[60]++;
    var opScope = new Scope(param0);
    _$jscoverage['/runtime/commands.js'].lineData[61]++;
    opScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[62]++;
    buffer = option.fn(opScope, buffer);
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[63]++;
    if (visit9_63_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[64]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[66]++;
  return buffer;
}, 
  'if': function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[3]++;
  _$jscoverage['/runtime/commands.js'].lineData[70]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[71]++;
  var param0 = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[72]++;
  if (visit10_72_1(param0)) {
    _$jscoverage['/runtime/commands.js'].lineData[73]++;
    if (visit11_73_1(option.fn)) {
      _$jscoverage['/runtime/commands.js'].lineData[74]++;
      buffer = option.fn(scope, buffer);
    }
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[76]++;
    if (visit12_76_1(option.inverse)) {
      _$jscoverage['/runtime/commands.js'].lineData[77]++;
      buffer = option.inverse(scope, buffer);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[79]++;
  return buffer;
}, 
  set: function(scope, option, buffer) {
  _$jscoverage['/runtime/commands.js'].functionData[4]++;
  _$jscoverage['/runtime/commands.js'].lineData[83]++;
  scope.mix(option.hash);
  _$jscoverage['/runtime/commands.js'].lineData[84]++;
  return buffer;
}, 
  include: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[5]++;
  _$jscoverage['/runtime/commands.js'].lineData[88]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[90]++;
  if (visit13_90_1(option.hash)) {
    _$jscoverage['/runtime/commands.js'].lineData[91]++;
    var newScope = new Scope(option.hash);
    _$jscoverage['/runtime/commands.js'].lineData[92]++;
    newScope.setParent(scope);
    _$jscoverage['/runtime/commands.js'].lineData[93]++;
    scope = newScope;
  }
  _$jscoverage['/runtime/commands.js'].lineData[95]++;
  return this.include(params[0], scope, buffer, payload);
}, 
  parse: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[6]++;
  _$jscoverage['/runtime/commands.js'].lineData[100]++;
  return commands.include.call(this, new Scope(), option, buffer, payload);
}, 
  extend: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[7]++;
  _$jscoverage['/runtime/commands.js'].lineData[104]++;
  payload.extendTplName = option.params[0];
  _$jscoverage['/runtime/commands.js'].lineData[105]++;
  return buffer;
}, 
  block: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[8]++;
  _$jscoverage['/runtime/commands.js'].lineData[109]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[110]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[111]++;
  var blockName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[112]++;
  var type;
  _$jscoverage['/runtime/commands.js'].lineData[113]++;
  if (visit14_113_1(params.length === 2)) {
    _$jscoverage['/runtime/commands.js'].lineData[114]++;
    type = params[0];
    _$jscoverage['/runtime/commands.js'].lineData[115]++;
    blockName = params[1];
  }
  _$jscoverage['/runtime/commands.js'].lineData[117]++;
  var blocks = payload.blocks = visit15_117_1(payload.blocks || {});
  _$jscoverage['/runtime/commands.js'].lineData[118]++;
  var head = blocks[blockName], cursor;
  _$jscoverage['/runtime/commands.js'].lineData[120]++;
  var current = {
  fn: option.fn, 
  type: type};
  _$jscoverage['/runtime/commands.js'].lineData[124]++;
  if (visit16_124_1(!head)) {
    _$jscoverage['/runtime/commands.js'].lineData[125]++;
    blocks[blockName] = current;
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[126]++;
    if (visit17_126_1(head.type)) {
      _$jscoverage['/runtime/commands.js'].lineData[127]++;
      if (visit18_127_1(head.type === 'append')) {
        _$jscoverage['/runtime/commands.js'].lineData[128]++;
        current.next = head;
        _$jscoverage['/runtime/commands.js'].lineData[129]++;
        blocks[blockName] = current;
      } else {
        _$jscoverage['/runtime/commands.js'].lineData[130]++;
        if (visit19_130_1(head.type === 'prepend')) {
          _$jscoverage['/runtime/commands.js'].lineData[131]++;
          var prev;
          _$jscoverage['/runtime/commands.js'].lineData[132]++;
          cursor = head;
          _$jscoverage['/runtime/commands.js'].lineData[133]++;
          while (visit20_133_1(cursor && visit21_133_2(cursor.type === 'prepend'))) {
            _$jscoverage['/runtime/commands.js'].lineData[134]++;
            prev = cursor;
            _$jscoverage['/runtime/commands.js'].lineData[135]++;
            cursor = cursor.next;
          }
          _$jscoverage['/runtime/commands.js'].lineData[137]++;
          current.next = cursor;
          _$jscoverage['/runtime/commands.js'].lineData[138]++;
          prev.next = current;
        }
      }
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[142]++;
  if (visit22_142_1(!payload.extendTplName)) {
    _$jscoverage['/runtime/commands.js'].lineData[143]++;
    cursor = blocks[blockName];
    _$jscoverage['/runtime/commands.js'].lineData[144]++;
    while (cursor) {
      _$jscoverage['/runtime/commands.js'].lineData[145]++;
      if (visit23_145_1(cursor.fn)) {
        _$jscoverage['/runtime/commands.js'].lineData[146]++;
        buffer = cursor.fn.call(self, scope, buffer);
      }
      _$jscoverage['/runtime/commands.js'].lineData[148]++;
      cursor = cursor.next;
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[152]++;
  return buffer;
}, 
  macro: function(scope, option, buffer, lineNumber, payload) {
  _$jscoverage['/runtime/commands.js'].functionData[9]++;
  _$jscoverage['/runtime/commands.js'].lineData[156]++;
  var params = option.params;
  _$jscoverage['/runtime/commands.js'].lineData[157]++;
  var macroName = params[0];
  _$jscoverage['/runtime/commands.js'].lineData[158]++;
  var params1 = params.slice(1);
  _$jscoverage['/runtime/commands.js'].lineData[159]++;
  var self = this;
  _$jscoverage['/runtime/commands.js'].lineData[160]++;
  var macros = payload.macros = visit24_160_1(payload.macros || {});
  _$jscoverage['/runtime/commands.js'].lineData[162]++;
  if (visit25_162_1(option.fn)) {
    _$jscoverage['/runtime/commands.js'].lineData[163]++;
    macros[macroName] = {
  paramNames: params1, 
  fn: option.fn};
  } else {
    _$jscoverage['/runtime/commands.js'].lineData[168]++;
    var paramValues = {};
    _$jscoverage['/runtime/commands.js'].lineData[169]++;
    var macro = macros[macroName];
    _$jscoverage['/runtime/commands.js'].lineData[170]++;
    var paramNames;
    _$jscoverage['/runtime/commands.js'].lineData[171]++;
    if (visit26_171_1(macro && (paramNames = macro.paramNames))) {
      _$jscoverage['/runtime/commands.js'].lineData[172]++;
      for (var i = 0, len = paramNames.length; visit27_172_1(i < len); i++) {
        _$jscoverage['/runtime/commands.js'].lineData[173]++;
        var p = paramNames[i];
        _$jscoverage['/runtime/commands.js'].lineData[174]++;
        paramValues[p] = params1[i];
      }
      _$jscoverage['/runtime/commands.js'].lineData[176]++;
      var newScope = new Scope(paramValues);
      _$jscoverage['/runtime/commands.js'].lineData[178]++;
      buffer = macro.fn.call(self, newScope, buffer);
    } else {
      _$jscoverage['/runtime/commands.js'].lineData[180]++;
      var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + lineNumber;
      _$jscoverage['/runtime/commands.js'].lineData[181]++;
      S.error(error);
    }
  }
  _$jscoverage['/runtime/commands.js'].lineData[184]++;
  return buffer;
}};
  _$jscoverage['/runtime/commands.js'].lineData[188]++;
  if (visit28_188_1('@DEBUG@')) {
    _$jscoverage['/runtime/commands.js'].lineData[189]++;
    commands['debugger'] = function() {
  _$jscoverage['/runtime/commands.js'].functionData[10]++;
  _$jscoverage['/runtime/commands.js'].lineData[190]++;
  S.globalEval('debugger');
};
  }
  _$jscoverage['/runtime/commands.js'].lineData[194]++;
  return commands;
});
