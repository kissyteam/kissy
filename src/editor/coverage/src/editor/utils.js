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
if (! _$jscoverage['/editor/utils.js']) {
  _$jscoverage['/editor/utils.js'] = {};
  _$jscoverage['/editor/utils.js'].lineData = [];
  _$jscoverage['/editor/utils.js'].lineData[6] = 0;
  _$jscoverage['/editor/utils.js'].lineData[7] = 0;
  _$jscoverage['/editor/utils.js'].lineData[8] = 0;
  _$jscoverage['/editor/utils.js'].lineData[9] = 0;
  _$jscoverage['/editor/utils.js'].lineData[22] = 0;
  _$jscoverage['/editor/utils.js'].lineData[23] = 0;
  _$jscoverage['/editor/utils.js'].lineData[24] = 0;
  _$jscoverage['/editor/utils.js'].lineData[26] = 0;
  _$jscoverage['/editor/utils.js'].lineData[27] = 0;
  _$jscoverage['/editor/utils.js'].lineData[28] = 0;
  _$jscoverage['/editor/utils.js'].lineData[30] = 0;
  _$jscoverage['/editor/utils.js'].lineData[32] = 0;
  _$jscoverage['/editor/utils.js'].lineData[34] = 0;
  _$jscoverage['/editor/utils.js'].lineData[38] = 0;
  _$jscoverage['/editor/utils.js'].lineData[39] = 0;
  _$jscoverage['/editor/utils.js'].lineData[40] = 0;
  _$jscoverage['/editor/utils.js'].lineData[41] = 0;
  _$jscoverage['/editor/utils.js'].lineData[42] = 0;
  _$jscoverage['/editor/utils.js'].lineData[47] = 0;
  _$jscoverage['/editor/utils.js'].lineData[51] = 0;
  _$jscoverage['/editor/utils.js'].lineData[52] = 0;
  _$jscoverage['/editor/utils.js'].lineData[55] = 0;
  _$jscoverage['/editor/utils.js'].lineData[56] = 0;
  _$jscoverage['/editor/utils.js'].lineData[57] = 0;
  _$jscoverage['/editor/utils.js'].lineData[59] = 0;
  _$jscoverage['/editor/utils.js'].lineData[63] = 0;
  _$jscoverage['/editor/utils.js'].lineData[64] = 0;
  _$jscoverage['/editor/utils.js'].lineData[65] = 0;
  _$jscoverage['/editor/utils.js'].lineData[66] = 0;
  _$jscoverage['/editor/utils.js'].lineData[67] = 0;
  _$jscoverage['/editor/utils.js'].lineData[68] = 0;
  _$jscoverage['/editor/utils.js'].lineData[73] = 0;
  _$jscoverage['/editor/utils.js'].lineData[77] = 0;
  _$jscoverage['/editor/utils.js'].lineData[78] = 0;
  _$jscoverage['/editor/utils.js'].lineData[83] = 0;
  _$jscoverage['/editor/utils.js'].lineData[87] = 0;
  _$jscoverage['/editor/utils.js'].lineData[91] = 0;
  _$jscoverage['/editor/utils.js'].lineData[95] = 0;
  _$jscoverage['/editor/utils.js'].lineData[96] = 0;
  _$jscoverage['/editor/utils.js'].lineData[100] = 0;
  _$jscoverage['/editor/utils.js'].lineData[101] = 0;
  _$jscoverage['/editor/utils.js'].lineData[102] = 0;
  _$jscoverage['/editor/utils.js'].lineData[105] = 0;
  _$jscoverage['/editor/utils.js'].lineData[109] = 0;
  _$jscoverage['/editor/utils.js'].lineData[110] = 0;
  _$jscoverage['/editor/utils.js'].lineData[114] = 0;
  _$jscoverage['/editor/utils.js'].lineData[115] = 0;
  _$jscoverage['/editor/utils.js'].lineData[116] = 0;
  _$jscoverage['/editor/utils.js'].lineData[117] = 0;
  _$jscoverage['/editor/utils.js'].lineData[118] = 0;
  _$jscoverage['/editor/utils.js'].lineData[119] = 0;
  _$jscoverage['/editor/utils.js'].lineData[124] = 0;
  _$jscoverage['/editor/utils.js'].lineData[125] = 0;
  _$jscoverage['/editor/utils.js'].lineData[126] = 0;
  _$jscoverage['/editor/utils.js'].lineData[128] = 0;
  _$jscoverage['/editor/utils.js'].lineData[131] = 0;
  _$jscoverage['/editor/utils.js'].lineData[132] = 0;
  _$jscoverage['/editor/utils.js'].lineData[134] = 0;
  _$jscoverage['/editor/utils.js'].lineData[138] = 0;
  _$jscoverage['/editor/utils.js'].lineData[139] = 0;
  _$jscoverage['/editor/utils.js'].lineData[140] = 0;
  _$jscoverage['/editor/utils.js'].lineData[142] = 0;
  _$jscoverage['/editor/utils.js'].lineData[143] = 0;
  _$jscoverage['/editor/utils.js'].lineData[144] = 0;
  _$jscoverage['/editor/utils.js'].lineData[145] = 0;
  _$jscoverage['/editor/utils.js'].lineData[148] = 0;
  _$jscoverage['/editor/utils.js'].lineData[149] = 0;
  _$jscoverage['/editor/utils.js'].lineData[150] = 0;
  _$jscoverage['/editor/utils.js'].lineData[151] = 0;
  _$jscoverage['/editor/utils.js'].lineData[162] = 0;
  _$jscoverage['/editor/utils.js'].lineData[163] = 0;
  _$jscoverage['/editor/utils.js'].lineData[165] = 0;
  _$jscoverage['/editor/utils.js'].lineData[166] = 0;
  _$jscoverage['/editor/utils.js'].lineData[167] = 0;
  _$jscoverage['/editor/utils.js'].lineData[171] = 0;
  _$jscoverage['/editor/utils.js'].lineData[179] = 0;
  _$jscoverage['/editor/utils.js'].lineData[181] = 0;
  _$jscoverage['/editor/utils.js'].lineData[183] = 0;
  _$jscoverage['/editor/utils.js'].lineData[188] = 0;
  _$jscoverage['/editor/utils.js'].lineData[189] = 0;
  _$jscoverage['/editor/utils.js'].lineData[190] = 0;
  _$jscoverage['/editor/utils.js'].lineData[191] = 0;
  _$jscoverage['/editor/utils.js'].lineData[192] = 0;
  _$jscoverage['/editor/utils.js'].lineData[193] = 0;
  _$jscoverage['/editor/utils.js'].lineData[194] = 0;
  _$jscoverage['/editor/utils.js'].lineData[195] = 0;
  _$jscoverage['/editor/utils.js'].lineData[196] = 0;
  _$jscoverage['/editor/utils.js'].lineData[198] = 0;
  _$jscoverage['/editor/utils.js'].lineData[199] = 0;
  _$jscoverage['/editor/utils.js'].lineData[200] = 0;
  _$jscoverage['/editor/utils.js'].lineData[203] = 0;
  _$jscoverage['/editor/utils.js'].lineData[211] = 0;
  _$jscoverage['/editor/utils.js'].lineData[212] = 0;
  _$jscoverage['/editor/utils.js'].lineData[213] = 0;
  _$jscoverage['/editor/utils.js'].lineData[217] = 0;
  _$jscoverage['/editor/utils.js'].lineData[218] = 0;
  _$jscoverage['/editor/utils.js'].lineData[219] = 0;
  _$jscoverage['/editor/utils.js'].lineData[220] = 0;
  _$jscoverage['/editor/utils.js'].lineData[221] = 0;
  _$jscoverage['/editor/utils.js'].lineData[223] = 0;
  _$jscoverage['/editor/utils.js'].lineData[224] = 0;
  _$jscoverage['/editor/utils.js'].lineData[226] = 0;
  _$jscoverage['/editor/utils.js'].lineData[227] = 0;
  _$jscoverage['/editor/utils.js'].lineData[231] = 0;
  _$jscoverage['/editor/utils.js'].lineData[235] = 0;
  _$jscoverage['/editor/utils.js'].lineData[236] = 0;
  _$jscoverage['/editor/utils.js'].lineData[241] = 0;
  _$jscoverage['/editor/utils.js'].lineData[243] = 0;
}
if (! _$jscoverage['/editor/utils.js'].functionData) {
  _$jscoverage['/editor/utils.js'].functionData = [];
  _$jscoverage['/editor/utils.js'].functionData[0] = 0;
  _$jscoverage['/editor/utils.js'].functionData[1] = 0;
  _$jscoverage['/editor/utils.js'].functionData[2] = 0;
  _$jscoverage['/editor/utils.js'].functionData[3] = 0;
  _$jscoverage['/editor/utils.js'].functionData[4] = 0;
  _$jscoverage['/editor/utils.js'].functionData[5] = 0;
  _$jscoverage['/editor/utils.js'].functionData[6] = 0;
  _$jscoverage['/editor/utils.js'].functionData[7] = 0;
  _$jscoverage['/editor/utils.js'].functionData[8] = 0;
  _$jscoverage['/editor/utils.js'].functionData[9] = 0;
  _$jscoverage['/editor/utils.js'].functionData[10] = 0;
  _$jscoverage['/editor/utils.js'].functionData[11] = 0;
  _$jscoverage['/editor/utils.js'].functionData[12] = 0;
  _$jscoverage['/editor/utils.js'].functionData[13] = 0;
  _$jscoverage['/editor/utils.js'].functionData[14] = 0;
  _$jscoverage['/editor/utils.js'].functionData[15] = 0;
  _$jscoverage['/editor/utils.js'].functionData[16] = 0;
  _$jscoverage['/editor/utils.js'].functionData[17] = 0;
  _$jscoverage['/editor/utils.js'].functionData[18] = 0;
  _$jscoverage['/editor/utils.js'].functionData[19] = 0;
  _$jscoverage['/editor/utils.js'].functionData[20] = 0;
  _$jscoverage['/editor/utils.js'].functionData[21] = 0;
  _$jscoverage['/editor/utils.js'].functionData[22] = 0;
  _$jscoverage['/editor/utils.js'].functionData[23] = 0;
  _$jscoverage['/editor/utils.js'].functionData[24] = 0;
  _$jscoverage['/editor/utils.js'].functionData[25] = 0;
}
if (! _$jscoverage['/editor/utils.js'].branchData) {
  _$jscoverage['/editor/utils.js'].branchData = {};
  _$jscoverage['/editor/utils.js'].branchData['23'] = [];
  _$jscoverage['/editor/utils.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['26'] = [];
  _$jscoverage['/editor/utils.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['27'] = [];
  _$jscoverage['/editor/utils.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['64'] = [];
  _$jscoverage['/editor/utils.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['95'] = [];
  _$jscoverage['/editor/utils.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['100'] = [];
  _$jscoverage['/editor/utils.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['115'] = [];
  _$jscoverage['/editor/utils.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['118'] = [];
  _$jscoverage['/editor/utils.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['124'] = [];
  _$jscoverage['/editor/utils.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['125'] = [];
  _$jscoverage['/editor/utils.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['139'] = [];
  _$jscoverage['/editor/utils.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['143'] = [];
  _$jscoverage['/editor/utils.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['150'] = [];
  _$jscoverage['/editor/utils.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['166'] = [];
  _$jscoverage['/editor/utils.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['179'] = [];
  _$jscoverage['/editor/utils.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['195'] = [];
  _$jscoverage['/editor/utils.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['198'] = [];
  _$jscoverage['/editor/utils.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['199'] = [];
  _$jscoverage['/editor/utils.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['211'] = [];
  _$jscoverage['/editor/utils.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['217'] = [];
  _$jscoverage['/editor/utils.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['218'] = [];
  _$jscoverage['/editor/utils.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['220'] = [];
  _$jscoverage['/editor/utils.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['223'] = [];
  _$jscoverage['/editor/utils.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['226'] = [];
  _$jscoverage['/editor/utils.js'].branchData['226'][1] = new BranchData();
}
_$jscoverage['/editor/utils.js'].branchData['226'][1].init(143, 8, 'r.remove');
function visit1082_226_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['223'][1].init(29, 9, 'r.destroy');
function visit1081_223_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['220'][1].init(61, 23, 'typeof r === \'function\'');
function visit1080_220_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['218'][1].init(77, 14, 'i < res.length');
function visit1079_218_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['217'][1].init(27, 16, 'this.__res || []');
function visit1078_217_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['211'][1].init(30, 16, 'this.__res || []');
function visit1077_211_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['199'][2].init(63, 25, 'ret[0] && ret[0].nodeType');
function visit1076_199_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['199'][1].init(41, 48, 'ret.__IS_NODELIST || (ret[0] && ret[0].nodeType)');
function visit1075_199_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['198'][1].init(37, 14, 'S.isArray(ret)');
function visit1074_198_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['195'][2].init(231, 31, 'ret.nodeType || S.isWindow(ret)');
function visit1073_195_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['195'][1].init(223, 40, 'ret && (ret.nodeType || S.isWindow(ret))');
function visit1072_195_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['179'][1].init(21, 8, 'UA[\'ie\']');
function visit1071_179_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['166'][1].init(65, 23, 'typeof v === \'function\'');
function visit1070_166_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['150'][1].init(85, 24, 'S.trim(inp.val()) == tip');
function visit1069_150_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['143'][1].init(25, 18, '!S.trim(inp.val())');
function visit1068_143_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['139'][1].init(67, 9, '!UA[\'ie\']');
function visit1067_139_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['125'][1].init(25, 35, 'inp.hasClass("ks-editor-input-tip")');
function visit1066_125_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['124'][1].init(21, 17, 'val === undefined');
function visit1065_124_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['118'][1].init(234, 9, '!UA[\'ie\']');
function visit1064_118_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['115'][1].init(80, 23, 'placeholder && UA[\'ie\']');
function visit1063_115_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['100'][1].init(259, 37, 'verify && !new RegExp(verify).test(v)');
function visit1062_100_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['95'][1].init(33, 17, 'i < inputs.length');
function visit1061_95_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['64'][1].init(93, 10, 'i < length');
function visit1060_64_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['27'][1].init(25, 22, 'url.indexOf("?") != -1');
function visit1059_27_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['26'][1].init(180, 23, 'url.indexOf("?t") == -1');
function visit1058_26_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['23'][1].init(60, 13, '!Config.debug');
function visit1057_23_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/utils.js'].functionData[0]++;
  _$jscoverage['/editor/utils.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor/utils.js'].lineData[8]++;
  var Editor = require('./base');
  _$jscoverage['/editor/utils.js'].lineData[9]++;
  var TRUE = true, FALSE = false, NULL = null, Dom = S.DOM, UA = S.UA, Utils = {
  debugUrl: function(url) {
  _$jscoverage['/editor/utils.js'].functionData[1]++;
  _$jscoverage['/editor/utils.js'].lineData[22]++;
  var Config = S.Config;
  _$jscoverage['/editor/utils.js'].lineData[23]++;
  if (visit1057_23_1(!Config.debug)) {
    _$jscoverage['/editor/utils.js'].lineData[24]++;
    url = url.replace(/\.(js|css)/i, "-min.$1");
  }
  _$jscoverage['/editor/utils.js'].lineData[26]++;
  if (visit1058_26_1(url.indexOf("?t") == -1)) {
    _$jscoverage['/editor/utils.js'].lineData[27]++;
    if (visit1059_27_1(url.indexOf("?") != -1)) {
      _$jscoverage['/editor/utils.js'].lineData[28]++;
      url += "&";
    } else {
      _$jscoverage['/editor/utils.js'].lineData[30]++;
      url += "?";
    }
    _$jscoverage['/editor/utils.js'].lineData[32]++;
    url += "t=" + encodeURIComponent(Config.tag);
  }
  _$jscoverage['/editor/utils.js'].lineData[34]++;
  return Config.base + "editor/" + url;
}, 
  lazyRun: function(obj, before, after) {
  _$jscoverage['/editor/utils.js'].functionData[2]++;
  _$jscoverage['/editor/utils.js'].lineData[38]++;
  var b = obj[before], a = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[39]++;
  obj[before] = function() {
  _$jscoverage['/editor/utils.js'].functionData[3]++;
  _$jscoverage['/editor/utils.js'].lineData[40]++;
  b.apply(this, arguments);
  _$jscoverage['/editor/utils.js'].lineData[41]++;
  obj[before] = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[42]++;
  return a.apply(this, arguments);
};
}, 
  getXY: function(offset, editor) {
  _$jscoverage['/editor/utils.js'].functionData[4]++;
  _$jscoverage['/editor/utils.js'].lineData[47]++;
  var x = offset.left, y = offset.top, currentWindow = editor.get("window")[0];
  _$jscoverage['/editor/utils.js'].lineData[51]++;
  x -= Dom.scrollLeft(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[52]++;
  y -= Dom.scrollTop(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[55]++;
  var iframePosition = editor.get("iframe").offset();
  _$jscoverage['/editor/utils.js'].lineData[56]++;
  x += iframePosition.left;
  _$jscoverage['/editor/utils.js'].lineData[57]++;
  y += iframePosition.top;
  _$jscoverage['/editor/utils.js'].lineData[59]++;
  return {
  left: x, 
  top: y};
}, 
  tryThese: function(var_args) {
  _$jscoverage['/editor/utils.js'].functionData[5]++;
  _$jscoverage['/editor/utils.js'].lineData[63]++;
  var returnValue;
  _$jscoverage['/editor/utils.js'].lineData[64]++;
  for (var i = 0, length = arguments.length; visit1060_64_1(i < length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[65]++;
    var lambda = arguments[i];
    _$jscoverage['/editor/utils.js'].lineData[66]++;
    try {
      _$jscoverage['/editor/utils.js'].lineData[67]++;
      returnValue = lambda();
      _$jscoverage['/editor/utils.js'].lineData[68]++;
      break;
    }    catch (e) {
}
  }
  _$jscoverage['/editor/utils.js'].lineData[73]++;
  return returnValue;
}, 
  clearAllMarkers: function(database) {
  _$jscoverage['/editor/utils.js'].functionData[6]++;
  _$jscoverage['/editor/utils.js'].lineData[77]++;
  for (var i in database) {
    _$jscoverage['/editor/utils.js'].lineData[78]++;
    database[i]._4e_clearMarkers(database, TRUE, undefined);
  }
}, 
  ltrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[7]++;
  _$jscoverage['/editor/utils.js'].lineData[83]++;
  return str.replace(/^\s+/, "");
}, 
  rtrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[8]++;
  _$jscoverage['/editor/utils.js'].lineData[87]++;
  return str.replace(/\s+$/, "");
}, 
  isNumber: function(n) {
  _$jscoverage['/editor/utils.js'].functionData[9]++;
  _$jscoverage['/editor/utils.js'].lineData[91]++;
  return /^\d+(.\d+)?$/.test(S.trim(n));
}, 
  verifyInputs: function(inputs) {
  _$jscoverage['/editor/utils.js'].functionData[10]++;
  _$jscoverage['/editor/utils.js'].lineData[95]++;
  for (var i = 0; visit1061_95_1(i < inputs.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[96]++;
    var input = new Node(inputs[i]), v = S.trim(Utils.valInput(input)), verify = input.attr("data-verify"), warning = input.attr("data-warning");
    _$jscoverage['/editor/utils.js'].lineData[100]++;
    if (visit1062_100_1(verify && !new RegExp(verify).test(v))) {
      _$jscoverage['/editor/utils.js'].lineData[101]++;
      alert(warning);
      _$jscoverage['/editor/utils.js'].lineData[102]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[105]++;
  return TRUE;
}, 
  sourceDisable: function(editor, plugin) {
  _$jscoverage['/editor/utils.js'].functionData[11]++;
  _$jscoverage['/editor/utils.js'].lineData[109]++;
  editor.on("sourceMode", plugin.disable, plugin);
  _$jscoverage['/editor/utils.js'].lineData[110]++;
  editor.on("wysiwygMode", plugin.enable, plugin);
}, 
  resetInput: function(inp) {
  _$jscoverage['/editor/utils.js'].functionData[12]++;
  _$jscoverage['/editor/utils.js'].lineData[114]++;
  var placeholder = inp.attr("placeholder");
  _$jscoverage['/editor/utils.js'].lineData[115]++;
  if (visit1063_115_1(placeholder && UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[116]++;
    inp.addClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[117]++;
    inp.val(placeholder);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[118]++;
    if (visit1064_118_1(!UA['ie'])) {
      _$jscoverage['/editor/utils.js'].lineData[119]++;
      inp.val("");
    }
  }
}, 
  valInput: function(inp, val) {
  _$jscoverage['/editor/utils.js'].functionData[13]++;
  _$jscoverage['/editor/utils.js'].lineData[124]++;
  if (visit1065_124_1(val === undefined)) {
    _$jscoverage['/editor/utils.js'].lineData[125]++;
    if (visit1066_125_1(inp.hasClass("ks-editor-input-tip"))) {
      _$jscoverage['/editor/utils.js'].lineData[126]++;
      return "";
    } else {
      _$jscoverage['/editor/utils.js'].lineData[128]++;
      return inp.val();
    }
  } else {
    _$jscoverage['/editor/utils.js'].lineData[131]++;
    inp.removeClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[132]++;
    inp.val(val);
  }
  _$jscoverage['/editor/utils.js'].lineData[134]++;
  return undefined;
}, 
  placeholder: function(inp, tip) {
  _$jscoverage['/editor/utils.js'].functionData[14]++;
  _$jscoverage['/editor/utils.js'].lineData[138]++;
  inp.attr("placeholder", tip);
  _$jscoverage['/editor/utils.js'].lineData[139]++;
  if (visit1067_139_1(!UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[140]++;
    return;
  }
  _$jscoverage['/editor/utils.js'].lineData[142]++;
  inp.on("blur", function() {
  _$jscoverage['/editor/utils.js'].functionData[15]++;
  _$jscoverage['/editor/utils.js'].lineData[143]++;
  if (visit1068_143_1(!S.trim(inp.val()))) {
    _$jscoverage['/editor/utils.js'].lineData[144]++;
    inp.addClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[145]++;
    inp.val(tip);
  }
});
  _$jscoverage['/editor/utils.js'].lineData[148]++;
  inp.on("focus", function() {
  _$jscoverage['/editor/utils.js'].functionData[16]++;
  _$jscoverage['/editor/utils.js'].lineData[149]++;
  inp.removeClass("ks-editor-input-tip");
  _$jscoverage['/editor/utils.js'].lineData[150]++;
  if (visit1069_150_1(S.trim(inp.val()) == tip)) {
    _$jscoverage['/editor/utils.js'].lineData[151]++;
    inp.val("");
  }
});
}, 
  normParams: function(params) {
  _$jscoverage['/editor/utils.js'].functionData[17]++;
  _$jscoverage['/editor/utils.js'].lineData[162]++;
  params = S.clone(params);
  _$jscoverage['/editor/utils.js'].lineData[163]++;
  for (var p in params) {
    _$jscoverage['/editor/utils.js'].lineData[165]++;
    var v = params[p];
    _$jscoverage['/editor/utils.js'].lineData[166]++;
    if (visit1070_166_1(typeof v === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[167]++;
      params[p] = v();
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[171]++;
  return params;
}, 
  preventFocus: function(el) {
  _$jscoverage['/editor/utils.js'].functionData[18]++;
  _$jscoverage['/editor/utils.js'].lineData[179]++;
  if (visit1071_179_1(UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[181]++;
    el.unselectable();
  } else {
    _$jscoverage['/editor/utils.js'].lineData[183]++;
    el.attr("onmousedown", "return false;");
  }
}, 
  injectDom: function(editorDom) {
  _$jscoverage['/editor/utils.js'].functionData[19]++;
  _$jscoverage['/editor/utils.js'].lineData[188]++;
  S.mix(Dom, editorDom);
  _$jscoverage['/editor/utils.js'].lineData[189]++;
  for (var dm in editorDom) {
    _$jscoverage['/editor/utils.js'].lineData[190]++;
    (function(dm) {
  _$jscoverage['/editor/utils.js'].functionData[20]++;
  _$jscoverage['/editor/utils.js'].lineData[191]++;
  Node.prototype[dm] = function() {
  _$jscoverage['/editor/utils.js'].functionData[21]++;
  _$jscoverage['/editor/utils.js'].lineData[192]++;
  var args = [].slice.call(arguments, 0);
  _$jscoverage['/editor/utils.js'].lineData[193]++;
  args.unshift(this[0]);
  _$jscoverage['/editor/utils.js'].lineData[194]++;
  var ret = editorDom[dm].apply(NULL, args);
  _$jscoverage['/editor/utils.js'].lineData[195]++;
  if (visit1072_195_1(ret && (visit1073_195_2(ret.nodeType || S.isWindow(ret))))) {
    _$jscoverage['/editor/utils.js'].lineData[196]++;
    return new Node(ret);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[198]++;
    if (visit1074_198_1(S.isArray(ret))) {
      _$jscoverage['/editor/utils.js'].lineData[199]++;
      if (visit1075_199_1(ret.__IS_NODELIST || (visit1076_199_2(ret[0] && ret[0].nodeType)))) {
        _$jscoverage['/editor/utils.js'].lineData[200]++;
        return new Node(ret);
      }
    }
    _$jscoverage['/editor/utils.js'].lineData[203]++;
    return ret;
  }
};
})(dm);
  }
}, 
  addRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[22]++;
  _$jscoverage['/editor/utils.js'].lineData[211]++;
  this.__res = visit1077_211_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[212]++;
  var res = this.__res;
  _$jscoverage['/editor/utils.js'].lineData[213]++;
  res.push.apply(res, S.makeArray(arguments));
}, 
  destroyRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[23]++;
  _$jscoverage['/editor/utils.js'].lineData[217]++;
  var res = visit1078_217_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[218]++;
  for (var i = 0; visit1079_218_1(i < res.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[219]++;
    var r = res[i];
    _$jscoverage['/editor/utils.js'].lineData[220]++;
    if (visit1080_220_1(typeof r === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[221]++;
      r();
    } else {
      _$jscoverage['/editor/utils.js'].lineData[223]++;
      if (visit1081_223_1(r.destroy)) {
        _$jscoverage['/editor/utils.js'].lineData[224]++;
        r.destroy();
      } else {
        _$jscoverage['/editor/utils.js'].lineData[226]++;
        if (visit1082_226_1(r.remove)) {
          _$jscoverage['/editor/utils.js'].lineData[227]++;
          r.remove();
        }
      }
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[231]++;
  this.__res = [];
}, 
  getQueryCmd: function(cmd) {
  _$jscoverage['/editor/utils.js'].functionData[24]++;
  _$jscoverage['/editor/utils.js'].lineData[235]++;
  return "query" + ("-" + cmd).replace(/-(\w)/g, function(m, m1) {
  _$jscoverage['/editor/utils.js'].functionData[25]++;
  _$jscoverage['/editor/utils.js'].lineData[236]++;
  return m1.toUpperCase();
}) + "Value";
}};
  _$jscoverage['/editor/utils.js'].lineData[241]++;
  Editor.Utils = Utils;
  _$jscoverage['/editor/utils.js'].lineData[243]++;
  return Utils;
});
