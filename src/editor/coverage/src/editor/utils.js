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
  _$jscoverage['/editor/utils.js'].lineData[33] = 0;
  _$jscoverage['/editor/utils.js'].lineData[36] = 0;
  _$jscoverage['/editor/utils.js'].lineData[40] = 0;
  _$jscoverage['/editor/utils.js'].lineData[41] = 0;
  _$jscoverage['/editor/utils.js'].lineData[42] = 0;
  _$jscoverage['/editor/utils.js'].lineData[43] = 0;
  _$jscoverage['/editor/utils.js'].lineData[44] = 0;
  _$jscoverage['/editor/utils.js'].lineData[49] = 0;
  _$jscoverage['/editor/utils.js'].lineData[53] = 0;
  _$jscoverage['/editor/utils.js'].lineData[54] = 0;
  _$jscoverage['/editor/utils.js'].lineData[57] = 0;
  _$jscoverage['/editor/utils.js'].lineData[58] = 0;
  _$jscoverage['/editor/utils.js'].lineData[59] = 0;
  _$jscoverage['/editor/utils.js'].lineData[61] = 0;
  _$jscoverage['/editor/utils.js'].lineData[65] = 0;
  _$jscoverage['/editor/utils.js'].lineData[66] = 0;
  _$jscoverage['/editor/utils.js'].lineData[67] = 0;
  _$jscoverage['/editor/utils.js'].lineData[68] = 0;
  _$jscoverage['/editor/utils.js'].lineData[69] = 0;
  _$jscoverage['/editor/utils.js'].lineData[70] = 0;
  _$jscoverage['/editor/utils.js'].lineData[75] = 0;
  _$jscoverage['/editor/utils.js'].lineData[79] = 0;
  _$jscoverage['/editor/utils.js'].lineData[80] = 0;
  _$jscoverage['/editor/utils.js'].lineData[85] = 0;
  _$jscoverage['/editor/utils.js'].lineData[89] = 0;
  _$jscoverage['/editor/utils.js'].lineData[93] = 0;
  _$jscoverage['/editor/utils.js'].lineData[97] = 0;
  _$jscoverage['/editor/utils.js'].lineData[98] = 0;
  _$jscoverage['/editor/utils.js'].lineData[102] = 0;
  _$jscoverage['/editor/utils.js'].lineData[104] = 0;
  _$jscoverage['/editor/utils.js'].lineData[105] = 0;
  _$jscoverage['/editor/utils.js'].lineData[108] = 0;
  _$jscoverage['/editor/utils.js'].lineData[112] = 0;
  _$jscoverage['/editor/utils.js'].lineData[113] = 0;
  _$jscoverage['/editor/utils.js'].lineData[117] = 0;
  _$jscoverage['/editor/utils.js'].lineData[118] = 0;
  _$jscoverage['/editor/utils.js'].lineData[119] = 0;
  _$jscoverage['/editor/utils.js'].lineData[120] = 0;
  _$jscoverage['/editor/utils.js'].lineData[121] = 0;
  _$jscoverage['/editor/utils.js'].lineData[122] = 0;
  _$jscoverage['/editor/utils.js'].lineData[127] = 0;
  _$jscoverage['/editor/utils.js'].lineData[128] = 0;
  _$jscoverage['/editor/utils.js'].lineData[129] = 0;
  _$jscoverage['/editor/utils.js'].lineData[131] = 0;
  _$jscoverage['/editor/utils.js'].lineData[134] = 0;
  _$jscoverage['/editor/utils.js'].lineData[135] = 0;
  _$jscoverage['/editor/utils.js'].lineData[137] = 0;
  _$jscoverage['/editor/utils.js'].lineData[141] = 0;
  _$jscoverage['/editor/utils.js'].lineData[142] = 0;
  _$jscoverage['/editor/utils.js'].lineData[143] = 0;
  _$jscoverage['/editor/utils.js'].lineData[145] = 0;
  _$jscoverage['/editor/utils.js'].lineData[146] = 0;
  _$jscoverage['/editor/utils.js'].lineData[147] = 0;
  _$jscoverage['/editor/utils.js'].lineData[148] = 0;
  _$jscoverage['/editor/utils.js'].lineData[151] = 0;
  _$jscoverage['/editor/utils.js'].lineData[152] = 0;
  _$jscoverage['/editor/utils.js'].lineData[153] = 0;
  _$jscoverage['/editor/utils.js'].lineData[154] = 0;
  _$jscoverage['/editor/utils.js'].lineData[165] = 0;
  _$jscoverage['/editor/utils.js'].lineData[166] = 0;
  _$jscoverage['/editor/utils.js'].lineData[168] = 0;
  _$jscoverage['/editor/utils.js'].lineData[169] = 0;
  _$jscoverage['/editor/utils.js'].lineData[170] = 0;
  _$jscoverage['/editor/utils.js'].lineData[174] = 0;
  _$jscoverage['/editor/utils.js'].lineData[182] = 0;
  _$jscoverage['/editor/utils.js'].lineData[184] = 0;
  _$jscoverage['/editor/utils.js'].lineData[186] = 0;
  _$jscoverage['/editor/utils.js'].lineData[191] = 0;
  _$jscoverage['/editor/utils.js'].lineData[192] = 0;
  _$jscoverage['/editor/utils.js'].lineData[194] = 0;
  _$jscoverage['/editor/utils.js'].lineData[195] = 0;
  _$jscoverage['/editor/utils.js'].lineData[196] = 0;
  _$jscoverage['/editor/utils.js'].lineData[197] = 0;
  _$jscoverage['/editor/utils.js'].lineData[198] = 0;
  _$jscoverage['/editor/utils.js'].lineData[199] = 0;
  _$jscoverage['/editor/utils.js'].lineData[200] = 0;
  _$jscoverage['/editor/utils.js'].lineData[202] = 0;
  _$jscoverage['/editor/utils.js'].lineData[203] = 0;
  _$jscoverage['/editor/utils.js'].lineData[204] = 0;
  _$jscoverage['/editor/utils.js'].lineData[207] = 0;
  _$jscoverage['/editor/utils.js'].lineData[215] = 0;
  _$jscoverage['/editor/utils.js'].lineData[216] = 0;
  _$jscoverage['/editor/utils.js'].lineData[217] = 0;
  _$jscoverage['/editor/utils.js'].lineData[221] = 0;
  _$jscoverage['/editor/utils.js'].lineData[222] = 0;
  _$jscoverage['/editor/utils.js'].lineData[223] = 0;
  _$jscoverage['/editor/utils.js'].lineData[224] = 0;
  _$jscoverage['/editor/utils.js'].lineData[225] = 0;
  _$jscoverage['/editor/utils.js'].lineData[227] = 0;
  _$jscoverage['/editor/utils.js'].lineData[228] = 0;
  _$jscoverage['/editor/utils.js'].lineData[229] = 0;
  _$jscoverage['/editor/utils.js'].lineData[230] = 0;
  _$jscoverage['/editor/utils.js'].lineData[234] = 0;
  _$jscoverage['/editor/utils.js'].lineData[238] = 0;
  _$jscoverage['/editor/utils.js'].lineData[239] = 0;
  _$jscoverage['/editor/utils.js'].lineData[244] = 0;
  _$jscoverage['/editor/utils.js'].lineData[246] = 0;
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
  _$jscoverage['/editor/utils.js'].branchData['32'] = [];
  _$jscoverage['/editor/utils.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['66'] = [];
  _$jscoverage['/editor/utils.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['97'] = [];
  _$jscoverage['/editor/utils.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['102'] = [];
  _$jscoverage['/editor/utils.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['118'] = [];
  _$jscoverage['/editor/utils.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['121'] = [];
  _$jscoverage['/editor/utils.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['127'] = [];
  _$jscoverage['/editor/utils.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['128'] = [];
  _$jscoverage['/editor/utils.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['142'] = [];
  _$jscoverage['/editor/utils.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['146'] = [];
  _$jscoverage['/editor/utils.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['153'] = [];
  _$jscoverage['/editor/utils.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['169'] = [];
  _$jscoverage['/editor/utils.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['182'] = [];
  _$jscoverage['/editor/utils.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['199'] = [];
  _$jscoverage['/editor/utils.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['202'] = [];
  _$jscoverage['/editor/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['203'] = [];
  _$jscoverage['/editor/utils.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['215'] = [];
  _$jscoverage['/editor/utils.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['221'] = [];
  _$jscoverage['/editor/utils.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['222'] = [];
  _$jscoverage['/editor/utils.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['224'] = [];
  _$jscoverage['/editor/utils.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['227'] = [];
  _$jscoverage['/editor/utils.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['229'] = [];
  _$jscoverage['/editor/utils.js'].branchData['229'][1] = new BranchData();
}
_$jscoverage['/editor/utils.js'].branchData['229'][1].init(122, 8, 'r.remove');
function visit1090_229_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['227'][1].init(30, 9, 'r.destroy');
function visit1089_227_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['224'][1].init(63, 23, 'typeof r === \'function\'');
function visit1088_224_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['222'][1].init(79, 14, 'i < res.length');
function visit1087_222_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['221'][1].init(28, 16, 'this.__res || []');
function visit1086_221_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['215'][1].init(31, 16, 'this.__res || []');
function visit1085_215_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['203'][2].init(64, 25, 'ret[0] && ret[0].nodeType');
function visit1084_203_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['203'][1].init(42, 48, 'ret.__IS_NODELIST || (ret[0] && ret[0].nodeType)');
function visit1083_203_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['202'][1].init(38, 14, 'S.isArray(ret)');
function visit1082_202_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['199'][2].init(235, 31, 'ret.nodeType || S.isWindow(ret)');
function visit1081_199_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['199'][1].init(227, 40, 'ret && (ret.nodeType || S.isWindow(ret))');
function visit1080_199_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['182'][1].init(22, 5, 'UA.ie');
function visit1079_182_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['169'][1].init(68, 23, 'typeof v === \'function\'');
function visit1078_169_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['153'][1].init(87, 25, 'S.trim(inp.val()) === tip');
function visit1077_153_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['146'][1].init(26, 18, '!S.trim(inp.val())');
function visit1076_146_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['142'][1].init(69, 6, '!UA.ie');
function visit1075_142_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['128'][1].init(26, 35, 'inp.hasClass(\'ks-editor-input-tip\')');
function visit1074_128_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['127'][1].init(22, 17, 'val === undefined');
function visit1073_127_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['121'][1].init(236, 6, '!UA.ie');
function visit1072_121_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['118'][1].init(82, 20, 'placeholder && UA.ie');
function visit1071_118_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['102'][1].init(264, 37, 'verify && !new RegExp(verify).test(v)');
function visit1070_102_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['97'][1].init(34, 17, 'i < inputs.length');
function visit1069_97_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['66'][1].init(95, 10, 'i < length');
function visit1068_66_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['32'][1].init(205, 10, 'Config.tag');
function visit1067_32_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['27'][1].init(26, 23, 'url.indexOf(\'?\') !== -1');
function visit1066_27_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['26'][1].init(186, 24, 'url.indexOf(\'?t\') === -1');
function visit1065_26_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['23'][1].init(62, 12, 'Config.debug');
function visit1064_23_1(result) {
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
  var TRUE = true, FALSE = false, NULL = null, Dom = require('dom'), UA = S.UA, Utils = {
  debugUrl: function(url) {
  _$jscoverage['/editor/utils.js'].functionData[1]++;
  _$jscoverage['/editor/utils.js'].lineData[22]++;
  var Config = S.Config;
  _$jscoverage['/editor/utils.js'].lineData[23]++;
  if (visit1064_23_1(Config.debug)) {
    _$jscoverage['/editor/utils.js'].lineData[24]++;
    url = url.replace(/\.(js|css)/i, '-debug.$1');
  }
  _$jscoverage['/editor/utils.js'].lineData[26]++;
  if (visit1065_26_1(url.indexOf('?t') === -1)) {
    _$jscoverage['/editor/utils.js'].lineData[27]++;
    if (visit1066_27_1(url.indexOf('?') !== -1)) {
      _$jscoverage['/editor/utils.js'].lineData[28]++;
      url += '&';
    } else {
      _$jscoverage['/editor/utils.js'].lineData[30]++;
      url += '?';
    }
    _$jscoverage['/editor/utils.js'].lineData[32]++;
    if (visit1067_32_1(Config.tag)) {
      _$jscoverage['/editor/utils.js'].lineData[33]++;
      url += 't=' + encodeURIComponent(Config.tag);
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[36]++;
  return S.config('base') + 'editor/' + url;
}, 
  lazyRun: function(obj, before, after) {
  _$jscoverage['/editor/utils.js'].functionData[2]++;
  _$jscoverage['/editor/utils.js'].lineData[40]++;
  var b = obj[before], a = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[41]++;
  obj[before] = function() {
  _$jscoverage['/editor/utils.js'].functionData[3]++;
  _$jscoverage['/editor/utils.js'].lineData[42]++;
  b.apply(this, arguments);
  _$jscoverage['/editor/utils.js'].lineData[43]++;
  obj[before] = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[44]++;
  return a.apply(this, arguments);
};
}, 
  getXY: function(offset, editor) {
  _$jscoverage['/editor/utils.js'].functionData[4]++;
  _$jscoverage['/editor/utils.js'].lineData[49]++;
  var x = offset.left, y = offset.top, currentWindow = editor.get('window')[0];
  _$jscoverage['/editor/utils.js'].lineData[53]++;
  x -= Dom.scrollLeft(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[54]++;
  y -= Dom.scrollTop(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[57]++;
  var iframePosition = editor.get('iframe').offset();
  _$jscoverage['/editor/utils.js'].lineData[58]++;
  x += iframePosition.left;
  _$jscoverage['/editor/utils.js'].lineData[59]++;
  y += iframePosition.top;
  _$jscoverage['/editor/utils.js'].lineData[61]++;
  return {
  left: x, 
  top: y};
}, 
  tryThese: function() {
  _$jscoverage['/editor/utils.js'].functionData[5]++;
  _$jscoverage['/editor/utils.js'].lineData[65]++;
  var returnValue;
  _$jscoverage['/editor/utils.js'].lineData[66]++;
  for (var i = 0, length = arguments.length; visit1068_66_1(i < length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[67]++;
    var lambda = arguments[i];
    _$jscoverage['/editor/utils.js'].lineData[68]++;
    try {
      _$jscoverage['/editor/utils.js'].lineData[69]++;
      returnValue = lambda();
      _$jscoverage['/editor/utils.js'].lineData[70]++;
      break;
    }    catch (e) {
}
  }
  _$jscoverage['/editor/utils.js'].lineData[75]++;
  return returnValue;
}, 
  clearAllMarkers: function(database) {
  _$jscoverage['/editor/utils.js'].functionData[6]++;
  _$jscoverage['/editor/utils.js'].lineData[79]++;
  for (var i in database) {
    _$jscoverage['/editor/utils.js'].lineData[80]++;
    database[i]._4eClearMarkers(database, TRUE, undefined);
  }
}, 
  ltrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[7]++;
  _$jscoverage['/editor/utils.js'].lineData[85]++;
  return str.replace(/^\s+/, '');
}, 
  rtrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[8]++;
  _$jscoverage['/editor/utils.js'].lineData[89]++;
  return str.replace(/\s+$/, '');
}, 
  isNumber: function(n) {
  _$jscoverage['/editor/utils.js'].functionData[9]++;
  _$jscoverage['/editor/utils.js'].lineData[93]++;
  return (/^\d+(.\d+)?$/).test(S.trim(n));
}, 
  verifyInputs: function(inputs) {
  _$jscoverage['/editor/utils.js'].functionData[10]++;
  _$jscoverage['/editor/utils.js'].lineData[97]++;
  for (var i = 0; visit1069_97_1(i < inputs.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[98]++;
    var input = new Node(inputs[i]), v = S.trim(Utils.valInput(input)), verify = input.attr('data-verify'), warning = input.attr('data-warning');
    _$jscoverage['/editor/utils.js'].lineData[102]++;
    if (visit1070_102_1(verify && !new RegExp(verify).test(v))) {
      _$jscoverage['/editor/utils.js'].lineData[104]++;
      alert(warning);
      _$jscoverage['/editor/utils.js'].lineData[105]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[108]++;
  return TRUE;
}, 
  sourceDisable: function(editor, plugin) {
  _$jscoverage['/editor/utils.js'].functionData[11]++;
  _$jscoverage['/editor/utils.js'].lineData[112]++;
  editor.on('sourceMode', plugin.disable, plugin);
  _$jscoverage['/editor/utils.js'].lineData[113]++;
  editor.on('wysiwygMode', plugin.enable, plugin);
}, 
  resetInput: function(inp) {
  _$jscoverage['/editor/utils.js'].functionData[12]++;
  _$jscoverage['/editor/utils.js'].lineData[117]++;
  var placeholder = inp.attr('placeholder');
  _$jscoverage['/editor/utils.js'].lineData[118]++;
  if (visit1071_118_1(placeholder && UA.ie)) {
    _$jscoverage['/editor/utils.js'].lineData[119]++;
    inp.addClass('ks-editor-input-tip');
    _$jscoverage['/editor/utils.js'].lineData[120]++;
    inp.val(placeholder);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[121]++;
    if (visit1072_121_1(!UA.ie)) {
      _$jscoverage['/editor/utils.js'].lineData[122]++;
      inp.val('');
    }
  }
}, 
  valInput: function(inp, val) {
  _$jscoverage['/editor/utils.js'].functionData[13]++;
  _$jscoverage['/editor/utils.js'].lineData[127]++;
  if (visit1073_127_1(val === undefined)) {
    _$jscoverage['/editor/utils.js'].lineData[128]++;
    if (visit1074_128_1(inp.hasClass('ks-editor-input-tip'))) {
      _$jscoverage['/editor/utils.js'].lineData[129]++;
      return '';
    } else {
      _$jscoverage['/editor/utils.js'].lineData[131]++;
      return inp.val();
    }
  } else {
    _$jscoverage['/editor/utils.js'].lineData[134]++;
    inp.removeClass('ks-editor-input-tip');
    _$jscoverage['/editor/utils.js'].lineData[135]++;
    inp.val(val);
  }
  _$jscoverage['/editor/utils.js'].lineData[137]++;
  return undefined;
}, 
  placeholder: function(inp, tip) {
  _$jscoverage['/editor/utils.js'].functionData[14]++;
  _$jscoverage['/editor/utils.js'].lineData[141]++;
  inp.attr('placeholder', tip);
  _$jscoverage['/editor/utils.js'].lineData[142]++;
  if (visit1075_142_1(!UA.ie)) {
    _$jscoverage['/editor/utils.js'].lineData[143]++;
    return;
  }
  _$jscoverage['/editor/utils.js'].lineData[145]++;
  inp.on('blur', function() {
  _$jscoverage['/editor/utils.js'].functionData[15]++;
  _$jscoverage['/editor/utils.js'].lineData[146]++;
  if (visit1076_146_1(!S.trim(inp.val()))) {
    _$jscoverage['/editor/utils.js'].lineData[147]++;
    inp.addClass('ks-editor-input-tip');
    _$jscoverage['/editor/utils.js'].lineData[148]++;
    inp.val(tip);
  }
});
  _$jscoverage['/editor/utils.js'].lineData[151]++;
  inp.on('focus', function() {
  _$jscoverage['/editor/utils.js'].functionData[16]++;
  _$jscoverage['/editor/utils.js'].lineData[152]++;
  inp.removeClass('ks-editor-input-tip');
  _$jscoverage['/editor/utils.js'].lineData[153]++;
  if (visit1077_153_1(S.trim(inp.val()) === tip)) {
    _$jscoverage['/editor/utils.js'].lineData[154]++;
    inp.val('');
  }
});
}, 
  normParams: function(params) {
  _$jscoverage['/editor/utils.js'].functionData[17]++;
  _$jscoverage['/editor/utils.js'].lineData[165]++;
  params = S.clone(params);
  _$jscoverage['/editor/utils.js'].lineData[166]++;
  for (var p in params) {
    _$jscoverage['/editor/utils.js'].lineData[168]++;
    var v = params[p];
    _$jscoverage['/editor/utils.js'].lineData[169]++;
    if (visit1078_169_1(typeof v === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[170]++;
      params[p] = v();
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[174]++;
  return params;
}, 
  preventFocus: function(el) {
  _$jscoverage['/editor/utils.js'].functionData[18]++;
  _$jscoverage['/editor/utils.js'].lineData[182]++;
  if (visit1079_182_1(UA.ie)) {
    _$jscoverage['/editor/utils.js'].lineData[184]++;
    el.unselectable();
  } else {
    _$jscoverage['/editor/utils.js'].lineData[186]++;
    el.attr('onmousedown', 'return false;');
  }
}, 
  injectDom: function(editorDom) {
  _$jscoverage['/editor/utils.js'].functionData[19]++;
  _$jscoverage['/editor/utils.js'].lineData[191]++;
  S.mix(Dom, editorDom);
  _$jscoverage['/editor/utils.js'].lineData[192]++;
  for (var dm in editorDom) {
    _$jscoverage['/editor/utils.js'].lineData[194]++;
    (function(dm) {
  _$jscoverage['/editor/utils.js'].functionData[20]++;
  _$jscoverage['/editor/utils.js'].lineData[195]++;
  Node.prototype[dm] = function() {
  _$jscoverage['/editor/utils.js'].functionData[21]++;
  _$jscoverage['/editor/utils.js'].lineData[196]++;
  var args = [].slice.call(arguments, 0);
  _$jscoverage['/editor/utils.js'].lineData[197]++;
  args.unshift(this[0]);
  _$jscoverage['/editor/utils.js'].lineData[198]++;
  var ret = editorDom[dm].apply(NULL, args);
  _$jscoverage['/editor/utils.js'].lineData[199]++;
  if (visit1080_199_1(ret && (visit1081_199_2(ret.nodeType || S.isWindow(ret))))) {
    _$jscoverage['/editor/utils.js'].lineData[200]++;
    return new Node(ret);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[202]++;
    if (visit1082_202_1(S.isArray(ret))) {
      _$jscoverage['/editor/utils.js'].lineData[203]++;
      if (visit1083_203_1(ret.__IS_NODELIST || (visit1084_203_2(ret[0] && ret[0].nodeType)))) {
        _$jscoverage['/editor/utils.js'].lineData[204]++;
        return new Node(ret);
      }
    }
    _$jscoverage['/editor/utils.js'].lineData[207]++;
    return ret;
  }
};
})(dm);
  }
}, 
  addRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[22]++;
  _$jscoverage['/editor/utils.js'].lineData[215]++;
  this.__res = visit1085_215_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[216]++;
  var res = this.__res;
  _$jscoverage['/editor/utils.js'].lineData[217]++;
  res.push.apply(res, S.makeArray(arguments));
}, 
  destroyRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[23]++;
  _$jscoverage['/editor/utils.js'].lineData[221]++;
  var res = visit1086_221_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[222]++;
  for (var i = 0; visit1087_222_1(i < res.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[223]++;
    var r = res[i];
    _$jscoverage['/editor/utils.js'].lineData[224]++;
    if (visit1088_224_1(typeof r === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[225]++;
      r();
    } else {
      _$jscoverage['/editor/utils.js'].lineData[227]++;
      if (visit1089_227_1(r.destroy)) {
        _$jscoverage['/editor/utils.js'].lineData[228]++;
        r.destroy();
      } else {
        _$jscoverage['/editor/utils.js'].lineData[229]++;
        if (visit1090_229_1(r.remove)) {
          _$jscoverage['/editor/utils.js'].lineData[230]++;
          r.remove();
        }
      }
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[234]++;
  this.__res = [];
}, 
  getQueryCmd: function(cmd) {
  _$jscoverage['/editor/utils.js'].functionData[24]++;
  _$jscoverage['/editor/utils.js'].lineData[238]++;
  return 'query' + ('-' + cmd).replace(/-(\w)/g, function(m, m1) {
  _$jscoverage['/editor/utils.js'].functionData[25]++;
  _$jscoverage['/editor/utils.js'].lineData[239]++;
  return m1.toUpperCase();
}) + 'Value';
}};
  _$jscoverage['/editor/utils.js'].lineData[244]++;
  Editor.Utils = Utils;
  _$jscoverage['/editor/utils.js'].lineData[246]++;
  return Utils;
});
