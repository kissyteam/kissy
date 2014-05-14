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
  _$jscoverage['/editor/utils.js'].lineData[10] = 0;
  _$jscoverage['/editor/utils.js'].lineData[23] = 0;
  _$jscoverage['/editor/utils.js'].lineData[24] = 0;
  _$jscoverage['/editor/utils.js'].lineData[25] = 0;
  _$jscoverage['/editor/utils.js'].lineData[27] = 0;
  _$jscoverage['/editor/utils.js'].lineData[28] = 0;
  _$jscoverage['/editor/utils.js'].lineData[29] = 0;
  _$jscoverage['/editor/utils.js'].lineData[31] = 0;
  _$jscoverage['/editor/utils.js'].lineData[33] = 0;
  _$jscoverage['/editor/utils.js'].lineData[34] = 0;
  _$jscoverage['/editor/utils.js'].lineData[37] = 0;
  _$jscoverage['/editor/utils.js'].lineData[41] = 0;
  _$jscoverage['/editor/utils.js'].lineData[42] = 0;
  _$jscoverage['/editor/utils.js'].lineData[43] = 0;
  _$jscoverage['/editor/utils.js'].lineData[44] = 0;
  _$jscoverage['/editor/utils.js'].lineData[45] = 0;
  _$jscoverage['/editor/utils.js'].lineData[50] = 0;
  _$jscoverage['/editor/utils.js'].lineData[54] = 0;
  _$jscoverage['/editor/utils.js'].lineData[55] = 0;
  _$jscoverage['/editor/utils.js'].lineData[58] = 0;
  _$jscoverage['/editor/utils.js'].lineData[59] = 0;
  _$jscoverage['/editor/utils.js'].lineData[60] = 0;
  _$jscoverage['/editor/utils.js'].lineData[62] = 0;
  _$jscoverage['/editor/utils.js'].lineData[66] = 0;
  _$jscoverage['/editor/utils.js'].lineData[67] = 0;
  _$jscoverage['/editor/utils.js'].lineData[68] = 0;
  _$jscoverage['/editor/utils.js'].lineData[69] = 0;
  _$jscoverage['/editor/utils.js'].lineData[70] = 0;
  _$jscoverage['/editor/utils.js'].lineData[71] = 0;
  _$jscoverage['/editor/utils.js'].lineData[76] = 0;
  _$jscoverage['/editor/utils.js'].lineData[80] = 0;
  _$jscoverage['/editor/utils.js'].lineData[81] = 0;
  _$jscoverage['/editor/utils.js'].lineData[86] = 0;
  _$jscoverage['/editor/utils.js'].lineData[90] = 0;
  _$jscoverage['/editor/utils.js'].lineData[94] = 0;
  _$jscoverage['/editor/utils.js'].lineData[98] = 0;
  _$jscoverage['/editor/utils.js'].lineData[99] = 0;
  _$jscoverage['/editor/utils.js'].lineData[103] = 0;
  _$jscoverage['/editor/utils.js'].lineData[105] = 0;
  _$jscoverage['/editor/utils.js'].lineData[106] = 0;
  _$jscoverage['/editor/utils.js'].lineData[109] = 0;
  _$jscoverage['/editor/utils.js'].lineData[113] = 0;
  _$jscoverage['/editor/utils.js'].lineData[114] = 0;
  _$jscoverage['/editor/utils.js'].lineData[118] = 0;
  _$jscoverage['/editor/utils.js'].lineData[119] = 0;
  _$jscoverage['/editor/utils.js'].lineData[120] = 0;
  _$jscoverage['/editor/utils.js'].lineData[121] = 0;
  _$jscoverage['/editor/utils.js'].lineData[122] = 0;
  _$jscoverage['/editor/utils.js'].lineData[123] = 0;
  _$jscoverage['/editor/utils.js'].lineData[128] = 0;
  _$jscoverage['/editor/utils.js'].lineData[129] = 0;
  _$jscoverage['/editor/utils.js'].lineData[130] = 0;
  _$jscoverage['/editor/utils.js'].lineData[132] = 0;
  _$jscoverage['/editor/utils.js'].lineData[135] = 0;
  _$jscoverage['/editor/utils.js'].lineData[136] = 0;
  _$jscoverage['/editor/utils.js'].lineData[138] = 0;
  _$jscoverage['/editor/utils.js'].lineData[142] = 0;
  _$jscoverage['/editor/utils.js'].lineData[143] = 0;
  _$jscoverage['/editor/utils.js'].lineData[144] = 0;
  _$jscoverage['/editor/utils.js'].lineData[146] = 0;
  _$jscoverage['/editor/utils.js'].lineData[147] = 0;
  _$jscoverage['/editor/utils.js'].lineData[148] = 0;
  _$jscoverage['/editor/utils.js'].lineData[149] = 0;
  _$jscoverage['/editor/utils.js'].lineData[152] = 0;
  _$jscoverage['/editor/utils.js'].lineData[153] = 0;
  _$jscoverage['/editor/utils.js'].lineData[154] = 0;
  _$jscoverage['/editor/utils.js'].lineData[155] = 0;
  _$jscoverage['/editor/utils.js'].lineData[166] = 0;
  _$jscoverage['/editor/utils.js'].lineData[167] = 0;
  _$jscoverage['/editor/utils.js'].lineData[169] = 0;
  _$jscoverage['/editor/utils.js'].lineData[170] = 0;
  _$jscoverage['/editor/utils.js'].lineData[171] = 0;
  _$jscoverage['/editor/utils.js'].lineData[175] = 0;
  _$jscoverage['/editor/utils.js'].lineData[183] = 0;
  _$jscoverage['/editor/utils.js'].lineData[185] = 0;
  _$jscoverage['/editor/utils.js'].lineData[187] = 0;
  _$jscoverage['/editor/utils.js'].lineData[192] = 0;
  _$jscoverage['/editor/utils.js'].lineData[193] = 0;
  _$jscoverage['/editor/utils.js'].lineData[195] = 0;
  _$jscoverage['/editor/utils.js'].lineData[196] = 0;
  _$jscoverage['/editor/utils.js'].lineData[197] = 0;
  _$jscoverage['/editor/utils.js'].lineData[198] = 0;
  _$jscoverage['/editor/utils.js'].lineData[199] = 0;
  _$jscoverage['/editor/utils.js'].lineData[200] = 0;
  _$jscoverage['/editor/utils.js'].lineData[201] = 0;
  _$jscoverage['/editor/utils.js'].lineData[203] = 0;
  _$jscoverage['/editor/utils.js'].lineData[204] = 0;
  _$jscoverage['/editor/utils.js'].lineData[205] = 0;
  _$jscoverage['/editor/utils.js'].lineData[208] = 0;
  _$jscoverage['/editor/utils.js'].lineData[216] = 0;
  _$jscoverage['/editor/utils.js'].lineData[217] = 0;
  _$jscoverage['/editor/utils.js'].lineData[218] = 0;
  _$jscoverage['/editor/utils.js'].lineData[222] = 0;
  _$jscoverage['/editor/utils.js'].lineData[223] = 0;
  _$jscoverage['/editor/utils.js'].lineData[224] = 0;
  _$jscoverage['/editor/utils.js'].lineData[225] = 0;
  _$jscoverage['/editor/utils.js'].lineData[226] = 0;
  _$jscoverage['/editor/utils.js'].lineData[228] = 0;
  _$jscoverage['/editor/utils.js'].lineData[229] = 0;
  _$jscoverage['/editor/utils.js'].lineData[230] = 0;
  _$jscoverage['/editor/utils.js'].lineData[231] = 0;
  _$jscoverage['/editor/utils.js'].lineData[235] = 0;
  _$jscoverage['/editor/utils.js'].lineData[239] = 0;
  _$jscoverage['/editor/utils.js'].lineData[240] = 0;
  _$jscoverage['/editor/utils.js'].lineData[245] = 0;
  _$jscoverage['/editor/utils.js'].lineData[247] = 0;
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
  _$jscoverage['/editor/utils.js'].branchData['24'] = [];
  _$jscoverage['/editor/utils.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['27'] = [];
  _$jscoverage['/editor/utils.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['28'] = [];
  _$jscoverage['/editor/utils.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['33'] = [];
  _$jscoverage['/editor/utils.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['67'] = [];
  _$jscoverage['/editor/utils.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['98'] = [];
  _$jscoverage['/editor/utils.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['103'] = [];
  _$jscoverage['/editor/utils.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['119'] = [];
  _$jscoverage['/editor/utils.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['122'] = [];
  _$jscoverage['/editor/utils.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['128'] = [];
  _$jscoverage['/editor/utils.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['129'] = [];
  _$jscoverage['/editor/utils.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['143'] = [];
  _$jscoverage['/editor/utils.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['147'] = [];
  _$jscoverage['/editor/utils.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['154'] = [];
  _$jscoverage['/editor/utils.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['170'] = [];
  _$jscoverage['/editor/utils.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['183'] = [];
  _$jscoverage['/editor/utils.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['200'] = [];
  _$jscoverage['/editor/utils.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['203'] = [];
  _$jscoverage['/editor/utils.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['204'] = [];
  _$jscoverage['/editor/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['216'] = [];
  _$jscoverage['/editor/utils.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['222'] = [];
  _$jscoverage['/editor/utils.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['223'] = [];
  _$jscoverage['/editor/utils.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['225'] = [];
  _$jscoverage['/editor/utils.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['228'] = [];
  _$jscoverage['/editor/utils.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['230'] = [];
  _$jscoverage['/editor/utils.js'].branchData['230'][1] = new BranchData();
}
_$jscoverage['/editor/utils.js'].branchData['230'][1].init(122, 8, 'r.remove');
function visit1089_230_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['228'][1].init(30, 9, 'r.destroy');
function visit1088_228_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['225'][1].init(63, 23, 'typeof r === \'function\'');
function visit1087_225_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['223'][1].init(79, 14, 'i < res.length');
function visit1086_223_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['222'][1].init(28, 16, 'this.__res || []');
function visit1085_222_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['216'][1].init(31, 16, 'this.__res || []');
function visit1084_216_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['204'][2].init(64, 25, 'ret[0] && ret[0].nodeType');
function visit1083_204_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['204'][1].init(42, 48, 'ret.__IS_NODELIST || (ret[0] && ret[0].nodeType)');
function visit1082_204_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['203'][1].init(38, 17, 'util.isArray(ret)');
function visit1081_203_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['200'][2].init(235, 34, 'ret.nodeType || util.isWindow(ret)');
function visit1080_200_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['200'][1].init(227, 43, 'ret && (ret.nodeType || util.isWindow(ret))');
function visit1079_200_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['183'][1].init(22, 5, 'UA.ie');
function visit1078_183_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['170'][1].init(68, 23, 'typeof v === \'function\'');
function visit1077_170_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['154'][1].init(87, 28, 'util.trim(inp.val()) === tip');
function visit1076_154_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['147'][1].init(26, 21, '!util.trim(inp.val())');
function visit1075_147_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['143'][1].init(69, 6, '!UA.ie');
function visit1074_143_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['129'][1].init(26, 35, 'inp.hasClass(\'ks-editor-input-tip\')');
function visit1073_129_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['128'][1].init(22, 17, 'val === undefined');
function visit1072_128_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['122'][1].init(236, 6, '!UA.ie');
function visit1071_122_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['119'][1].init(82, 20, 'placeholder && UA.ie');
function visit1070_119_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['103'][1].init(267, 37, 'verify && !new RegExp(verify).test(v)');
function visit1069_103_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['98'][1].init(34, 17, 'i < inputs.length');
function visit1068_98_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['67'][1].init(95, 10, 'i < length');
function visit1067_67_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['33'][1].init(205, 10, 'Config.tag');
function visit1066_33_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['28'][1].init(26, 23, 'url.indexOf(\'?\') !== -1');
function visit1065_28_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['27'][1].init(186, 24, 'url.indexOf(\'?t\') === -1');
function visit1064_27_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['24'][1].init(62, 12, 'Config.debug');
function visit1063_24_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/utils.js'].functionData[0]++;
  _$jscoverage['/editor/utils.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/editor/utils.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/editor/utils.js'].lineData[9]++;
  var Editor = require('./base');
  _$jscoverage['/editor/utils.js'].lineData[10]++;
  var TRUE = true, FALSE = false, NULL = null, Dom = require('dom'), UA = require('ua'), Utils = {
  debugUrl: function(url) {
  _$jscoverage['/editor/utils.js'].functionData[1]++;
  _$jscoverage['/editor/utils.js'].lineData[23]++;
  var Config = S.Config;
  _$jscoverage['/editor/utils.js'].lineData[24]++;
  if (visit1063_24_1(Config.debug)) {
    _$jscoverage['/editor/utils.js'].lineData[25]++;
    url = url.replace(/\.(js|css)/i, '-debug.$1');
  }
  _$jscoverage['/editor/utils.js'].lineData[27]++;
  if (visit1064_27_1(url.indexOf('?t') === -1)) {
    _$jscoverage['/editor/utils.js'].lineData[28]++;
    if (visit1065_28_1(url.indexOf('?') !== -1)) {
      _$jscoverage['/editor/utils.js'].lineData[29]++;
      url += '&';
    } else {
      _$jscoverage['/editor/utils.js'].lineData[31]++;
      url += '?';
    }
    _$jscoverage['/editor/utils.js'].lineData[33]++;
    if (visit1066_33_1(Config.tag)) {
      _$jscoverage['/editor/utils.js'].lineData[34]++;
      url += 't=' + encodeURIComponent(Config.tag);
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[37]++;
  return S.config('base') + 'editor/' + url;
}, 
  lazyRun: function(obj, before, after) {
  _$jscoverage['/editor/utils.js'].functionData[2]++;
  _$jscoverage['/editor/utils.js'].lineData[41]++;
  var b = obj[before], a = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[42]++;
  obj[before] = function() {
  _$jscoverage['/editor/utils.js'].functionData[3]++;
  _$jscoverage['/editor/utils.js'].lineData[43]++;
  b.apply(this, arguments);
  _$jscoverage['/editor/utils.js'].lineData[44]++;
  obj[before] = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[45]++;
  return a.apply(this, arguments);
};
}, 
  getXY: function(offset, editor) {
  _$jscoverage['/editor/utils.js'].functionData[4]++;
  _$jscoverage['/editor/utils.js'].lineData[50]++;
  var x = offset.left, y = offset.top, currentWindow = editor.get('window')[0];
  _$jscoverage['/editor/utils.js'].lineData[54]++;
  x -= Dom.scrollLeft(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[55]++;
  y -= Dom.scrollTop(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[58]++;
  var iframePosition = editor.get('iframe').offset();
  _$jscoverage['/editor/utils.js'].lineData[59]++;
  x += iframePosition.left;
  _$jscoverage['/editor/utils.js'].lineData[60]++;
  y += iframePosition.top;
  _$jscoverage['/editor/utils.js'].lineData[62]++;
  return {
  left: x, 
  top: y};
}, 
  tryThese: function() {
  _$jscoverage['/editor/utils.js'].functionData[5]++;
  _$jscoverage['/editor/utils.js'].lineData[66]++;
  var returnValue;
  _$jscoverage['/editor/utils.js'].lineData[67]++;
  for (var i = 0, length = arguments.length; visit1067_67_1(i < length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[68]++;
    var lambda = arguments[i];
    _$jscoverage['/editor/utils.js'].lineData[69]++;
    try {
      _$jscoverage['/editor/utils.js'].lineData[70]++;
      returnValue = lambda();
      _$jscoverage['/editor/utils.js'].lineData[71]++;
      break;
    }    catch (e) {
}
  }
  _$jscoverage['/editor/utils.js'].lineData[76]++;
  return returnValue;
}, 
  clearAllMarkers: function(database) {
  _$jscoverage['/editor/utils.js'].functionData[6]++;
  _$jscoverage['/editor/utils.js'].lineData[80]++;
  for (var i in database) {
    _$jscoverage['/editor/utils.js'].lineData[81]++;
    database[i]._4eClearMarkers(database, TRUE, undefined);
  }
}, 
  ltrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[7]++;
  _$jscoverage['/editor/utils.js'].lineData[86]++;
  return str.replace(/^\s+/, '');
}, 
  rtrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[8]++;
  _$jscoverage['/editor/utils.js'].lineData[90]++;
  return str.replace(/\s+$/, '');
}, 
  isNumber: function(n) {
  _$jscoverage['/editor/utils.js'].functionData[9]++;
  _$jscoverage['/editor/utils.js'].lineData[94]++;
  return (/^\d+(.\d+)?$/).test(util.trim(n));
}, 
  verifyInputs: function(inputs) {
  _$jscoverage['/editor/utils.js'].functionData[10]++;
  _$jscoverage['/editor/utils.js'].lineData[98]++;
  for (var i = 0; visit1068_98_1(i < inputs.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[99]++;
    var input = new Node(inputs[i]), v = util.trim(Utils.valInput(input)), verify = input.attr('data-verify'), warning = input.attr('data-warning');
    _$jscoverage['/editor/utils.js'].lineData[103]++;
    if (visit1069_103_1(verify && !new RegExp(verify).test(v))) {
      _$jscoverage['/editor/utils.js'].lineData[105]++;
      alert(warning);
      _$jscoverage['/editor/utils.js'].lineData[106]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[109]++;
  return TRUE;
}, 
  sourceDisable: function(editor, plugin) {
  _$jscoverage['/editor/utils.js'].functionData[11]++;
  _$jscoverage['/editor/utils.js'].lineData[113]++;
  editor.on('sourceMode', plugin.disable, plugin);
  _$jscoverage['/editor/utils.js'].lineData[114]++;
  editor.on('wysiwygMode', plugin.enable, plugin);
}, 
  resetInput: function(inp) {
  _$jscoverage['/editor/utils.js'].functionData[12]++;
  _$jscoverage['/editor/utils.js'].lineData[118]++;
  var placeholder = inp.attr('placeholder');
  _$jscoverage['/editor/utils.js'].lineData[119]++;
  if (visit1070_119_1(placeholder && UA.ie)) {
    _$jscoverage['/editor/utils.js'].lineData[120]++;
    inp.addClass('ks-editor-input-tip');
    _$jscoverage['/editor/utils.js'].lineData[121]++;
    inp.val(placeholder);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[122]++;
    if (visit1071_122_1(!UA.ie)) {
      _$jscoverage['/editor/utils.js'].lineData[123]++;
      inp.val('');
    }
  }
}, 
  valInput: function(inp, val) {
  _$jscoverage['/editor/utils.js'].functionData[13]++;
  _$jscoverage['/editor/utils.js'].lineData[128]++;
  if (visit1072_128_1(val === undefined)) {
    _$jscoverage['/editor/utils.js'].lineData[129]++;
    if (visit1073_129_1(inp.hasClass('ks-editor-input-tip'))) {
      _$jscoverage['/editor/utils.js'].lineData[130]++;
      return '';
    } else {
      _$jscoverage['/editor/utils.js'].lineData[132]++;
      return inp.val();
    }
  } else {
    _$jscoverage['/editor/utils.js'].lineData[135]++;
    inp.removeClass('ks-editor-input-tip');
    _$jscoverage['/editor/utils.js'].lineData[136]++;
    inp.val(val);
  }
  _$jscoverage['/editor/utils.js'].lineData[138]++;
  return undefined;
}, 
  placeholder: function(inp, tip) {
  _$jscoverage['/editor/utils.js'].functionData[14]++;
  _$jscoverage['/editor/utils.js'].lineData[142]++;
  inp.attr('placeholder', tip);
  _$jscoverage['/editor/utils.js'].lineData[143]++;
  if (visit1074_143_1(!UA.ie)) {
    _$jscoverage['/editor/utils.js'].lineData[144]++;
    return;
  }
  _$jscoverage['/editor/utils.js'].lineData[146]++;
  inp.on('blur', function() {
  _$jscoverage['/editor/utils.js'].functionData[15]++;
  _$jscoverage['/editor/utils.js'].lineData[147]++;
  if (visit1075_147_1(!util.trim(inp.val()))) {
    _$jscoverage['/editor/utils.js'].lineData[148]++;
    inp.addClass('ks-editor-input-tip');
    _$jscoverage['/editor/utils.js'].lineData[149]++;
    inp.val(tip);
  }
});
  _$jscoverage['/editor/utils.js'].lineData[152]++;
  inp.on('focus', function() {
  _$jscoverage['/editor/utils.js'].functionData[16]++;
  _$jscoverage['/editor/utils.js'].lineData[153]++;
  inp.removeClass('ks-editor-input-tip');
  _$jscoverage['/editor/utils.js'].lineData[154]++;
  if (visit1076_154_1(util.trim(inp.val()) === tip)) {
    _$jscoverage['/editor/utils.js'].lineData[155]++;
    inp.val('');
  }
});
}, 
  normParams: function(params) {
  _$jscoverage['/editor/utils.js'].functionData[17]++;
  _$jscoverage['/editor/utils.js'].lineData[166]++;
  params = util.clone(params);
  _$jscoverage['/editor/utils.js'].lineData[167]++;
  for (var p in params) {
    _$jscoverage['/editor/utils.js'].lineData[169]++;
    var v = params[p];
    _$jscoverage['/editor/utils.js'].lineData[170]++;
    if (visit1077_170_1(typeof v === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[171]++;
      params[p] = v();
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[175]++;
  return params;
}, 
  preventFocus: function(el) {
  _$jscoverage['/editor/utils.js'].functionData[18]++;
  _$jscoverage['/editor/utils.js'].lineData[183]++;
  if (visit1078_183_1(UA.ie)) {
    _$jscoverage['/editor/utils.js'].lineData[185]++;
    el.unselectable();
  } else {
    _$jscoverage['/editor/utils.js'].lineData[187]++;
    el.attr('onmousedown', 'return false;');
  }
}, 
  injectDom: function(editorDom) {
  _$jscoverage['/editor/utils.js'].functionData[19]++;
  _$jscoverage['/editor/utils.js'].lineData[192]++;
  util.mix(Dom, editorDom);
  _$jscoverage['/editor/utils.js'].lineData[193]++;
  for (var dm in editorDom) {
    _$jscoverage['/editor/utils.js'].lineData[195]++;
    (function(dm) {
  _$jscoverage['/editor/utils.js'].functionData[20]++;
  _$jscoverage['/editor/utils.js'].lineData[196]++;
  Node.prototype[dm] = function() {
  _$jscoverage['/editor/utils.js'].functionData[21]++;
  _$jscoverage['/editor/utils.js'].lineData[197]++;
  var args = [].slice.call(arguments, 0);
  _$jscoverage['/editor/utils.js'].lineData[198]++;
  args.unshift(this[0]);
  _$jscoverage['/editor/utils.js'].lineData[199]++;
  var ret = editorDom[dm].apply(NULL, args);
  _$jscoverage['/editor/utils.js'].lineData[200]++;
  if (visit1079_200_1(ret && (visit1080_200_2(ret.nodeType || util.isWindow(ret))))) {
    _$jscoverage['/editor/utils.js'].lineData[201]++;
    return new Node(ret);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[203]++;
    if (visit1081_203_1(util.isArray(ret))) {
      _$jscoverage['/editor/utils.js'].lineData[204]++;
      if (visit1082_204_1(ret.__IS_NODELIST || (visit1083_204_2(ret[0] && ret[0].nodeType)))) {
        _$jscoverage['/editor/utils.js'].lineData[205]++;
        return new Node(ret);
      }
    }
    _$jscoverage['/editor/utils.js'].lineData[208]++;
    return ret;
  }
};
})(dm);
  }
}, 
  addRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[22]++;
  _$jscoverage['/editor/utils.js'].lineData[216]++;
  this.__res = visit1084_216_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[217]++;
  var res = this.__res;
  _$jscoverage['/editor/utils.js'].lineData[218]++;
  res.push.apply(res, util.makeArray(arguments));
}, 
  destroyRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[23]++;
  _$jscoverage['/editor/utils.js'].lineData[222]++;
  var res = visit1085_222_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[223]++;
  for (var i = 0; visit1086_223_1(i < res.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[224]++;
    var r = res[i];
    _$jscoverage['/editor/utils.js'].lineData[225]++;
    if (visit1087_225_1(typeof r === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[226]++;
      r();
    } else {
      _$jscoverage['/editor/utils.js'].lineData[228]++;
      if (visit1088_228_1(r.destroy)) {
        _$jscoverage['/editor/utils.js'].lineData[229]++;
        r.destroy();
      } else {
        _$jscoverage['/editor/utils.js'].lineData[230]++;
        if (visit1089_230_1(r.remove)) {
          _$jscoverage['/editor/utils.js'].lineData[231]++;
          r.remove();
        }
      }
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[235]++;
  this.__res = [];
}, 
  getQueryCmd: function(cmd) {
  _$jscoverage['/editor/utils.js'].functionData[24]++;
  _$jscoverage['/editor/utils.js'].lineData[239]++;
  return 'query' + ('-' + cmd).replace(/-(\w)/g, function(m, m1) {
  _$jscoverage['/editor/utils.js'].functionData[25]++;
  _$jscoverage['/editor/utils.js'].lineData[240]++;
  return m1.toUpperCase();
}) + 'Value';
}};
  _$jscoverage['/editor/utils.js'].lineData[245]++;
  Editor.Utils = Utils;
  _$jscoverage['/editor/utils.js'].lineData[247]++;
  return Utils;
});
