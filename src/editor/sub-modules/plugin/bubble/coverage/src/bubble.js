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
if (! _$jscoverage['/bubble.js']) {
  _$jscoverage['/bubble.js'] = {};
  _$jscoverage['/bubble.js'].lineData = [];
  _$jscoverage['/bubble.js'].lineData[6] = 0;
  _$jscoverage['/bubble.js'].lineData[7] = 0;
  _$jscoverage['/bubble.js'].lineData[8] = 0;
  _$jscoverage['/bubble.js'].lineData[9] = 0;
  _$jscoverage['/bubble.js'].lineData[11] = 0;
  _$jscoverage['/bubble.js'].lineData[21] = 0;
  _$jscoverage['/bubble.js'].lineData[22] = 0;
  _$jscoverage['/bubble.js'].lineData[27] = 0;
  _$jscoverage['/bubble.js'].lineData[28] = 0;
  _$jscoverage['/bubble.js'].lineData[33] = 0;
  _$jscoverage['/bubble.js'].lineData[39] = 0;
  _$jscoverage['/bubble.js'].lineData[40] = 0;
  _$jscoverage['/bubble.js'].lineData[43] = 0;
  _$jscoverage['/bubble.js'].lineData[44] = 0;
  _$jscoverage['/bubble.js'].lineData[48] = 0;
  _$jscoverage['/bubble.js'].lineData[49] = 0;
  _$jscoverage['/bubble.js'].lineData[50] = 0;
  _$jscoverage['/bubble.js'].lineData[51] = 0;
  _$jscoverage['/bubble.js'].lineData[55] = 0;
  _$jscoverage['/bubble.js'].lineData[58] = 0;
  _$jscoverage['/bubble.js'].lineData[60] = 0;
  _$jscoverage['/bubble.js'].lineData[63] = 0;
  _$jscoverage['/bubble.js'].lineData[64] = 0;
  _$jscoverage['/bubble.js'].lineData[67] = 0;
  _$jscoverage['/bubble.js'].lineData[78] = 0;
  _$jscoverage['/bubble.js'].lineData[80] = 0;
  _$jscoverage['/bubble.js'].lineData[82] = 0;
  _$jscoverage['/bubble.js'].lineData[90] = 0;
  _$jscoverage['/bubble.js'].lineData[93] = 0;
  _$jscoverage['/bubble.js'].lineData[98] = 0;
  _$jscoverage['/bubble.js'].lineData[100] = 0;
  _$jscoverage['/bubble.js'].lineData[103] = 0;
  _$jscoverage['/bubble.js'].lineData[104] = 0;
  _$jscoverage['/bubble.js'].lineData[108] = 0;
  _$jscoverage['/bubble.js'].lineData[109] = 0;
  _$jscoverage['/bubble.js'].lineData[110] = 0;
  _$jscoverage['/bubble.js'].lineData[111] = 0;
  _$jscoverage['/bubble.js'].lineData[114] = 0;
  _$jscoverage['/bubble.js'].lineData[115] = 0;
  _$jscoverage['/bubble.js'].lineData[117] = 0;
  _$jscoverage['/bubble.js'].lineData[120] = 0;
  _$jscoverage['/bubble.js'].lineData[121] = 0;
  _$jscoverage['/bubble.js'].lineData[125] = 0;
  _$jscoverage['/bubble.js'].lineData[127] = 0;
  _$jscoverage['/bubble.js'].lineData[129] = 0;
  _$jscoverage['/bubble.js'].lineData[131] = 0;
  _$jscoverage['/bubble.js'].lineData[135] = 0;
  _$jscoverage['/bubble.js'].lineData[139] = 0;
  _$jscoverage['/bubble.js'].lineData[141] = 0;
  _$jscoverage['/bubble.js'].lineData[143] = 0;
  _$jscoverage['/bubble.js'].lineData[146] = 0;
  _$jscoverage['/bubble.js'].lineData[147] = 0;
  _$jscoverage['/bubble.js'].lineData[151] = 0;
  _$jscoverage['/bubble.js'].lineData[152] = 0;
  _$jscoverage['/bubble.js'].lineData[153] = 0;
  _$jscoverage['/bubble.js'].lineData[154] = 0;
  _$jscoverage['/bubble.js'].lineData[156] = 0;
  _$jscoverage['/bubble.js'].lineData[157] = 0;
  _$jscoverage['/bubble.js'].lineData[158] = 0;
  _$jscoverage['/bubble.js'].lineData[160] = 0;
  _$jscoverage['/bubble.js'].lineData[162] = 0;
  _$jscoverage['/bubble.js'].lineData[164] = 0;
  _$jscoverage['/bubble.js'].lineData[171] = 0;
  _$jscoverage['/bubble.js'].lineData[172] = 0;
  _$jscoverage['/bubble.js'].lineData[173] = 0;
  _$jscoverage['/bubble.js'].lineData[175] = 0;
  _$jscoverage['/bubble.js'].lineData[176] = 0;
  _$jscoverage['/bubble.js'].lineData[177] = 0;
  _$jscoverage['/bubble.js'].lineData[181] = 0;
  _$jscoverage['/bubble.js'].lineData[183] = 0;
  _$jscoverage['/bubble.js'].lineData[184] = 0;
  _$jscoverage['/bubble.js'].lineData[185] = 0;
  _$jscoverage['/bubble.js'].lineData[186] = 0;
  _$jscoverage['/bubble.js'].lineData[187] = 0;
  _$jscoverage['/bubble.js'].lineData[188] = 0;
  _$jscoverage['/bubble.js'].lineData[189] = 0;
  _$jscoverage['/bubble.js'].lineData[190] = 0;
  _$jscoverage['/bubble.js'].lineData[192] = 0;
  _$jscoverage['/bubble.js'].lineData[193] = 0;
  _$jscoverage['/bubble.js'].lineData[195] = 0;
  _$jscoverage['/bubble.js'].lineData[200] = 0;
  _$jscoverage['/bubble.js'].lineData[202] = 0;
  _$jscoverage['/bubble.js'].lineData[203] = 0;
  _$jscoverage['/bubble.js'].lineData[204] = 0;
  _$jscoverage['/bubble.js'].lineData[206] = 0;
  _$jscoverage['/bubble.js'].lineData[207] = 0;
  _$jscoverage['/bubble.js'].lineData[210] = 0;
  _$jscoverage['/bubble.js'].lineData[211] = 0;
  _$jscoverage['/bubble.js'].lineData[212] = 0;
  _$jscoverage['/bubble.js'].lineData[213] = 0;
}
if (! _$jscoverage['/bubble.js'].functionData) {
  _$jscoverage['/bubble.js'].functionData = [];
  _$jscoverage['/bubble.js'].functionData[0] = 0;
  _$jscoverage['/bubble.js'].functionData[1] = 0;
  _$jscoverage['/bubble.js'].functionData[2] = 0;
  _$jscoverage['/bubble.js'].functionData[3] = 0;
  _$jscoverage['/bubble.js'].functionData[4] = 0;
  _$jscoverage['/bubble.js'].functionData[5] = 0;
  _$jscoverage['/bubble.js'].functionData[6] = 0;
  _$jscoverage['/bubble.js'].functionData[7] = 0;
  _$jscoverage['/bubble.js'].functionData[8] = 0;
  _$jscoverage['/bubble.js'].functionData[9] = 0;
  _$jscoverage['/bubble.js'].functionData[10] = 0;
  _$jscoverage['/bubble.js'].functionData[11] = 0;
}
if (! _$jscoverage['/bubble.js'].branchData) {
  _$jscoverage['/bubble.js'].branchData = {};
  _$jscoverage['/bubble.js'].branchData['22'] = [];
  _$jscoverage['/bubble.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['22'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['33'] = [];
  _$jscoverage['/bubble.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['44'] = [];
  _$jscoverage['/bubble.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['45'] = [];
  _$jscoverage['/bubble.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['46'] = [];
  _$jscoverage['/bubble.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['48'] = [];
  _$jscoverage['/bubble.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['50'] = [];
  _$jscoverage['/bubble.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['63'] = [];
  _$jscoverage['/bubble.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['90'] = [];
  _$jscoverage['/bubble.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['91'] = [];
  _$jscoverage['/bubble.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['92'] = [];
  _$jscoverage['/bubble.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['98'] = [];
  _$jscoverage['/bubble.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['103'] = [];
  _$jscoverage['/bubble.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['103'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['108'] = [];
  _$jscoverage['/bubble.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['108'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['110'] = [];
  _$jscoverage['/bubble.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['110'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['114'] = [];
  _$jscoverage['/bubble.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['114'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['125'] = [];
  _$jscoverage['/bubble.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['151'] = [];
  _$jscoverage['/bubble.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['153'] = [];
  _$jscoverage['/bubble.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['157'] = [];
  _$jscoverage['/bubble.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['175'] = [];
  _$jscoverage['/bubble.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['185'] = [];
  _$jscoverage['/bubble.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['188'] = [];
  _$jscoverage['/bubble.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['192'] = [];
  _$jscoverage['/bubble.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['203'] = [];
  _$jscoverage['/bubble.js'].branchData['203'][1] = new BranchData();
}
_$jscoverage['/bubble.js'].branchData['203'][1].init(17, 31, '!bubble.get(\'editorSelectedEl\')');
function visit39_203_1(result) {
  _$jscoverage['/bubble.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['192'][1].init(290, 22, '!bubble.get(\'visible\')');
function visit38_192_1(result) {
  _$jscoverage['/bubble.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['188'][1].init(117, 6, 'archor');
function visit37_188_1(result) {
  _$jscoverage['/bubble.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['185'][1].init(53, 2, 'xy');
function visit36_185_1(result) {
  _$jscoverage['/bubble.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['175'][1].init(134, 9, 'editorWin');
function visit35_175_1(result) {
  _$jscoverage['/bubble.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['157'][1].init(199, 1, 'a');
function visit34_157_1(result) {
  _$jscoverage['/bubble.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['153'][1].init(76, 12, '!lastElement');
function visit33_153_1(result) {
  _$jscoverage['/bubble.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['151'][1].init(153, 23, 'elementPath && elements');
function visit32_151_1(result) {
  _$jscoverage['/bubble.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['125'][1].init(112, 9, 'cfg || {}');
function visit31_125_1(result) {
  _$jscoverage['/bubble.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['114'][3].init(1491, 15, 'y !== undefined');
function visit30_114_3(result) {
  _$jscoverage['/bubble.js'].branchData['114'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['114'][2].init(1472, 15, 'x !== undefined');
function visit29_114_2(result) {
  _$jscoverage['/bubble.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['114'][1].init(1472, 34, 'x !== undefined && y !== undefined');
function visit28_114_1(result) {
  _$jscoverage['/bubble.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['110'][3].init(1408, 14, 'elLeft < right');
function visit27_110_3(result) {
  _$jscoverage['/bubble.js'].branchData['110'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['110'][2].init(1391, 13, 'elLeft > left');
function visit26_110_2(result) {
  _$jscoverage['/bubble.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['110'][1].init(1391, 31, 'elLeft > left && elLeft < right');
function visit25_110_1(result) {
  _$jscoverage['/bubble.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['108'][3].init(1332, 13, 'elLeft < left');
function visit24_108_3(result) {
  _$jscoverage['/bubble.js'].branchData['108'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['108'][2].init(1314, 14, 'elRight > left');
function visit23_108_2(result) {
  _$jscoverage['/bubble.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['108'][1].init(1314, 31, 'elRight > left && elLeft < left');
function visit22_108_1(result) {
  _$jscoverage['/bubble.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['103'][3].init(1226, 17, 'elBottom < bottom');
function visit21_103_3(result) {
  _$jscoverage['/bubble.js'].branchData['103'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['103'][2].init(1208, 14, 'elBottom > top');
function visit20_103_2(result) {
  _$jscoverage['/bubble.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['103'][1].init(1208, 35, 'elBottom > top && elBottom < bottom');
function visit19_103_1(result) {
  _$jscoverage['/bubble.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['98'][3].init(1083, 14, 'elTop < bottom');
function visit18_98_3(result) {
  _$jscoverage['/bubble.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['98'][2].init(1062, 17, 'elBottom > bottom');
function visit17_98_2(result) {
  _$jscoverage['/bubble.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['98'][1].init(1062, 35, 'elBottom > bottom && elTop < bottom');
function visit16_98_1(result) {
  _$jscoverage['/bubble.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['92'][1].init(53, 17, 'elBottom > bottom');
function visit15_92_1(result) {
  _$jscoverage['/bubble.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['91'][2].init(886, 38, 'el[0].nodeName.toLowerCase() === \'img\'');
function visit14_91_2(result) {
  _$jscoverage['/bubble.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['91'][1].init(22, 71, 'el[0].nodeName.toLowerCase() === \'img\' && elBottom > bottom');
function visit13_91_1(result) {
  _$jscoverage['/bubble.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['90'][1].init(861, 94, 'S.UA.ie && el[0].nodeName.toLowerCase() === \'img\' && elBottom > bottom');
function visit12_90_1(result) {
  _$jscoverage['/bubble.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['63'][1].init(65, 3, '!el');
function visit11_63_1(result) {
  _$jscoverage['/bubble.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['50'][1].init(97, 33, 'archor.get(\'y\') < bubble.get(\'y\')');
function visit10_50_1(result) {
  _$jscoverage['/bubble.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['48'][1].init(21, 7, '!archor');
function visit9_48_1(result) {
  _$jscoverage['/bubble.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['46'][1].init(34, 62, 'bubble.get(\'visible\') && overlap(self, bubble)');
function visit8_46_1(result) {
  _$jscoverage['/bubble.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['45'][2].init(56, 15, 'bubble !== self');
function visit7_45_2(result) {
  _$jscoverage['/bubble.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['45'][1].init(36, 97, 'bubble !== self && bubble.get(\'visible\') && overlap(self, bubble)');
function visit6_45_1(result) {
  _$jscoverage['/bubble.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['44'][1].init(17, 134, 'bubble.isKeBubble && bubble !== self && bubble.get(\'visible\') && overlap(self, bubble)');
function visit5_44_1(result) {
  _$jscoverage['/bubble.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['33'][1].init(201, 81, 'inRange(b1Top, b1Bottom, b2Bottom) || inRange(b1Top, b1Bottom, b2Top)');
function visit4_33_1(result) {
  _$jscoverage['/bubble.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['22'][3].init(26, 6, 'b >= r');
function visit3_22_3(result) {
  _$jscoverage['/bubble.js'].branchData['22'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['22'][2].init(16, 6, 't <= r');
function visit2_22_2(result) {
  _$jscoverage['/bubble.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['22'][1].init(16, 16, 't <= r && b >= r');
function visit1_22_1(result) {
  _$jscoverage['/bubble.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/bubble.js'].functionData[0]++;
  _$jscoverage['/bubble.js'].lineData[7]++;
  var Overlay = require('overlay');
  _$jscoverage['/bubble.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/bubble.js'].lineData[9]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/bubble.js'].lineData[11]++;
  var BUBBLE_CFG = {
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.BUBBLE_VIEW), 
  elCls: '{prefixCls}editor-bubble', 
  prefixCls: '{prefixCls}editor-', 
  effect: {
  effect: 'fade', 
  duration: 0.3}};
  _$jscoverage['/bubble.js'].lineData[21]++;
  function inRange(t, b, r) {
    _$jscoverage['/bubble.js'].functionData[1]++;
    _$jscoverage['/bubble.js'].lineData[22]++;
    return visit1_22_1(visit2_22_2(t <= r) && visit3_22_3(b >= r));
  }
  _$jscoverage['/bubble.js'].lineData[27]++;
  function overlap(b1, b2) {
    _$jscoverage['/bubble.js'].functionData[2]++;
    _$jscoverage['/bubble.js'].lineData[28]++;
    var b1Top = b1.get('y'), b1Bottom = b1Top + b1.get('el').outerHeight(), b2Top = b2.get('y'), b2Bottom = b2Top + b2.get('el').outerHeight();
    _$jscoverage['/bubble.js'].lineData[33]++;
    return visit4_33_1(inRange(b1Top, b1Bottom, b2Bottom) || inRange(b1Top, b1Bottom, b2Top));
  }
  _$jscoverage['/bubble.js'].lineData[39]++;
  function getTopPosition(self) {
    _$jscoverage['/bubble.js'].functionData[3]++;
    _$jscoverage['/bubble.js'].lineData[40]++;
    var archor = null, editor = self.get('editor'), myBubbles = editor.getControls();
    _$jscoverage['/bubble.js'].lineData[43]++;
    S.each(myBubbles, function(bubble) {
  _$jscoverage['/bubble.js'].functionData[4]++;
  _$jscoverage['/bubble.js'].lineData[44]++;
  if (visit5_44_1(bubble.isKeBubble && visit6_45_1(visit7_45_2(bubble !== self) && visit8_46_1(bubble.get('visible') && overlap(self, bubble))))) {
    _$jscoverage['/bubble.js'].lineData[48]++;
    if (visit9_48_1(!archor)) {
      _$jscoverage['/bubble.js'].lineData[49]++;
      archor = bubble;
    } else {
      _$jscoverage['/bubble.js'].lineData[50]++;
      if (visit10_50_1(archor.get('y') < bubble.get('y'))) {
        _$jscoverage['/bubble.js'].lineData[51]++;
        archor = bubble;
      }
    }
  }
});
    _$jscoverage['/bubble.js'].lineData[55]++;
    return archor;
  }
  _$jscoverage['/bubble.js'].lineData[58]++;
  function getXy(bubble) {
    _$jscoverage['/bubble.js'].functionData[5]++;
    _$jscoverage['/bubble.js'].lineData[60]++;
    var el = bubble.get('editorSelectedEl');
    _$jscoverage['/bubble.js'].lineData[63]++;
    if (visit11_63_1(!el)) {
      _$jscoverage['/bubble.js'].lineData[64]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[67]++;
    var editor = bubble.get('editor'), editorWin = editor.get('window'), iframeXY = editor.get('iframe').offset(), top = iframeXY.top, left = iframeXY.left, right = left + editorWin.width(), bottom = top + editorWin.height();
    _$jscoverage['/bubble.js'].lineData[78]++;
    var elXY = el.offset();
    _$jscoverage['/bubble.js'].lineData[80]++;
    elXY = Editor.Utils.getXY(elXY, editor);
    _$jscoverage['/bubble.js'].lineData[82]++;
    var elTop = elXY.top, elLeft = elXY.left, elRight = elLeft + el.width(), elBottom = elTop + el.height(), x, y;
    _$jscoverage['/bubble.js'].lineData[90]++;
    if (visit12_90_1(S.UA.ie && visit13_91_1(visit14_91_2(el[0].nodeName.toLowerCase() === 'img') && visit15_92_1(elBottom > bottom)))) {
      _$jscoverage['/bubble.js'].lineData[93]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[98]++;
    if (visit16_98_1(visit17_98_2(elBottom > bottom) && visit18_98_3(elTop < bottom))) {
      _$jscoverage['/bubble.js'].lineData[100]++;
      y = bottom - 30;
    } else {
      _$jscoverage['/bubble.js'].lineData[103]++;
      if (visit19_103_1(visit20_103_2(elBottom > top) && visit21_103_3(elBottom < bottom))) {
        _$jscoverage['/bubble.js'].lineData[104]++;
        y = elBottom;
      }
    }
    _$jscoverage['/bubble.js'].lineData[108]++;
    if (visit22_108_1(visit23_108_2(elRight > left) && visit24_108_3(elLeft < left))) {
      _$jscoverage['/bubble.js'].lineData[109]++;
      x = left;
    } else {
      _$jscoverage['/bubble.js'].lineData[110]++;
      if (visit25_110_1(visit26_110_2(elLeft > left) && visit27_110_3(elLeft < right))) {
        _$jscoverage['/bubble.js'].lineData[111]++;
        x = elLeft;
      }
    }
    _$jscoverage['/bubble.js'].lineData[114]++;
    if (visit28_114_1(visit29_114_2(x !== undefined) && visit30_114_3(y !== undefined))) {
      _$jscoverage['/bubble.js'].lineData[115]++;
      return [x, y];
    }
    _$jscoverage['/bubble.js'].lineData[117]++;
    return undefined;
  }
  _$jscoverage['/bubble.js'].lineData[120]++;
  Editor.prototype.addBubble = function(id, filter, cfg) {
  _$jscoverage['/bubble.js'].functionData[6]++;
  _$jscoverage['/bubble.js'].lineData[121]++;
  var editor = this, prefixCls = editor.get('prefixCls'), bubble;
  _$jscoverage['/bubble.js'].lineData[125]++;
  cfg = visit31_125_1(cfg || {});
  _$jscoverage['/bubble.js'].lineData[127]++;
  cfg.editor = editor;
  _$jscoverage['/bubble.js'].lineData[129]++;
  S.mix(cfg, BUBBLE_CFG);
  _$jscoverage['/bubble.js'].lineData[131]++;
  cfg.elCls = S.substitute(cfg.elCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[135]++;
  cfg.prefixCls = S.substitute(cfg.prefixCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[139]++;
  bubble = new Overlay(cfg);
  _$jscoverage['/bubble.js'].lineData[141]++;
  bubble.isKeBubble = 1;
  _$jscoverage['/bubble.js'].lineData[143]++;
  editor.addControl(id + '/bubble', bubble);
  _$jscoverage['/bubble.js'].lineData[146]++;
  editor.on('selectionChange', function(ev) {
  _$jscoverage['/bubble.js'].functionData[7]++;
  _$jscoverage['/bubble.js'].lineData[147]++;
  var elementPath = ev.path, elements = elementPath.elements, a, lastElement;
  _$jscoverage['/bubble.js'].lineData[151]++;
  if (visit32_151_1(elementPath && elements)) {
    _$jscoverage['/bubble.js'].lineData[152]++;
    lastElement = elementPath.lastElement;
    _$jscoverage['/bubble.js'].lineData[153]++;
    if (visit33_153_1(!lastElement)) {
      _$jscoverage['/bubble.js'].lineData[154]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[156]++;
    a = filter(lastElement);
    _$jscoverage['/bubble.js'].lineData[157]++;
    if (visit34_157_1(a)) {
      _$jscoverage['/bubble.js'].lineData[158]++;
      bubble.set('editorSelectedEl', a);
      _$jscoverage['/bubble.js'].lineData[160]++;
      bubble.hide();
      _$jscoverage['/bubble.js'].lineData[162]++;
      S.later(onShow, 10);
    } else {
      _$jscoverage['/bubble.js'].lineData[164]++;
      onHide();
    }
  }
});
  _$jscoverage['/bubble.js'].lineData[171]++;
  function onHide() {
    _$jscoverage['/bubble.js'].functionData[8]++;
    _$jscoverage['/bubble.js'].lineData[172]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[173]++;
    var editorWin = editor.get('window');
    _$jscoverage['/bubble.js'].lineData[175]++;
    if (visit35_175_1(editorWin)) {
      _$jscoverage['/bubble.js'].lineData[176]++;
      editorWin.detach('scroll', onScroll);
      _$jscoverage['/bubble.js'].lineData[177]++;
      bufferScroll.stop();
    }
  }
  _$jscoverage['/bubble.js'].lineData[181]++;
  editor.on('sourceMode', onHide);
  _$jscoverage['/bubble.js'].lineData[183]++;
  function showImmediately() {
    _$jscoverage['/bubble.js'].functionData[9]++;
    _$jscoverage['/bubble.js'].lineData[184]++;
    var xy = getXy(bubble);
    _$jscoverage['/bubble.js'].lineData[185]++;
    if (visit36_185_1(xy)) {
      _$jscoverage['/bubble.js'].lineData[186]++;
      bubble.move(xy[0], xy[1]);
      _$jscoverage['/bubble.js'].lineData[187]++;
      var archor = getTopPosition(bubble);
      _$jscoverage['/bubble.js'].lineData[188]++;
      if (visit37_188_1(archor)) {
        _$jscoverage['/bubble.js'].lineData[189]++;
        xy[1] = archor.get('y') + archor.get('el').outerHeight();
        _$jscoverage['/bubble.js'].lineData[190]++;
        bubble.move(xy[0], xy[1]);
      }
      _$jscoverage['/bubble.js'].lineData[192]++;
      if (visit38_192_1(!bubble.get('visible'))) {
        _$jscoverage['/bubble.js'].lineData[193]++;
        bubble.show();
      } else {
        _$jscoverage['/bubble.js'].lineData[195]++;
        logger.debug('already show by selectionChange');
      }
    }
  }
  _$jscoverage['/bubble.js'].lineData[200]++;
  var bufferScroll = S.buffer(showImmediately, 350);
  _$jscoverage['/bubble.js'].lineData[202]++;
  function onScroll() {
    _$jscoverage['/bubble.js'].functionData[10]++;
    _$jscoverage['/bubble.js'].lineData[203]++;
    if (visit39_203_1(!bubble.get('editorSelectedEl'))) {
      _$jscoverage['/bubble.js'].lineData[204]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[206]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[207]++;
    bufferScroll();
  }
  _$jscoverage['/bubble.js'].lineData[210]++;
  function onShow() {
    _$jscoverage['/bubble.js'].functionData[11]++;
    _$jscoverage['/bubble.js'].lineData[211]++;
    var editorWin = editor.get('window');
    _$jscoverage['/bubble.js'].lineData[212]++;
    editorWin.on('scroll', onScroll);
    _$jscoverage['/bubble.js'].lineData[213]++;
    showImmediately();
  }
};
});
