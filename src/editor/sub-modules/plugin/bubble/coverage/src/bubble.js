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
  _$jscoverage['/bubble.js'].lineData[10] = 0;
  _$jscoverage['/bubble.js'].lineData[22] = 0;
  _$jscoverage['/bubble.js'].lineData[23] = 0;
  _$jscoverage['/bubble.js'].lineData[28] = 0;
  _$jscoverage['/bubble.js'].lineData[29] = 0;
  _$jscoverage['/bubble.js'].lineData[34] = 0;
  _$jscoverage['/bubble.js'].lineData[40] = 0;
  _$jscoverage['/bubble.js'].lineData[41] = 0;
  _$jscoverage['/bubble.js'].lineData[44] = 0;
  _$jscoverage['/bubble.js'].lineData[45] = 0;
  _$jscoverage['/bubble.js'].lineData[49] = 0;
  _$jscoverage['/bubble.js'].lineData[50] = 0;
  _$jscoverage['/bubble.js'].lineData[51] = 0;
  _$jscoverage['/bubble.js'].lineData[52] = 0;
  _$jscoverage['/bubble.js'].lineData[56] = 0;
  _$jscoverage['/bubble.js'].lineData[59] = 0;
  _$jscoverage['/bubble.js'].lineData[61] = 0;
  _$jscoverage['/bubble.js'].lineData[64] = 0;
  _$jscoverage['/bubble.js'].lineData[65] = 0;
  _$jscoverage['/bubble.js'].lineData[68] = 0;
  _$jscoverage['/bubble.js'].lineData[79] = 0;
  _$jscoverage['/bubble.js'].lineData[81] = 0;
  _$jscoverage['/bubble.js'].lineData[83] = 0;
  _$jscoverage['/bubble.js'].lineData[91] = 0;
  _$jscoverage['/bubble.js'].lineData[94] = 0;
  _$jscoverage['/bubble.js'].lineData[99] = 0;
  _$jscoverage['/bubble.js'].lineData[101] = 0;
  _$jscoverage['/bubble.js'].lineData[104] = 0;
  _$jscoverage['/bubble.js'].lineData[105] = 0;
  _$jscoverage['/bubble.js'].lineData[109] = 0;
  _$jscoverage['/bubble.js'].lineData[110] = 0;
  _$jscoverage['/bubble.js'].lineData[111] = 0;
  _$jscoverage['/bubble.js'].lineData[112] = 0;
  _$jscoverage['/bubble.js'].lineData[115] = 0;
  _$jscoverage['/bubble.js'].lineData[116] = 0;
  _$jscoverage['/bubble.js'].lineData[118] = 0;
  _$jscoverage['/bubble.js'].lineData[121] = 0;
  _$jscoverage['/bubble.js'].lineData[122] = 0;
  _$jscoverage['/bubble.js'].lineData[126] = 0;
  _$jscoverage['/bubble.js'].lineData[128] = 0;
  _$jscoverage['/bubble.js'].lineData[130] = 0;
  _$jscoverage['/bubble.js'].lineData[132] = 0;
  _$jscoverage['/bubble.js'].lineData[136] = 0;
  _$jscoverage['/bubble.js'].lineData[140] = 0;
  _$jscoverage['/bubble.js'].lineData[142] = 0;
  _$jscoverage['/bubble.js'].lineData[144] = 0;
  _$jscoverage['/bubble.js'].lineData[147] = 0;
  _$jscoverage['/bubble.js'].lineData[148] = 0;
  _$jscoverage['/bubble.js'].lineData[152] = 0;
  _$jscoverage['/bubble.js'].lineData[153] = 0;
  _$jscoverage['/bubble.js'].lineData[154] = 0;
  _$jscoverage['/bubble.js'].lineData[155] = 0;
  _$jscoverage['/bubble.js'].lineData[157] = 0;
  _$jscoverage['/bubble.js'].lineData[158] = 0;
  _$jscoverage['/bubble.js'].lineData[159] = 0;
  _$jscoverage['/bubble.js'].lineData[161] = 0;
  _$jscoverage['/bubble.js'].lineData[163] = 0;
  _$jscoverage['/bubble.js'].lineData[165] = 0;
  _$jscoverage['/bubble.js'].lineData[172] = 0;
  _$jscoverage['/bubble.js'].lineData[173] = 0;
  _$jscoverage['/bubble.js'].lineData[174] = 0;
  _$jscoverage['/bubble.js'].lineData[176] = 0;
  _$jscoverage['/bubble.js'].lineData[177] = 0;
  _$jscoverage['/bubble.js'].lineData[178] = 0;
  _$jscoverage['/bubble.js'].lineData[182] = 0;
  _$jscoverage['/bubble.js'].lineData[184] = 0;
  _$jscoverage['/bubble.js'].lineData[185] = 0;
  _$jscoverage['/bubble.js'].lineData[186] = 0;
  _$jscoverage['/bubble.js'].lineData[187] = 0;
  _$jscoverage['/bubble.js'].lineData[188] = 0;
  _$jscoverage['/bubble.js'].lineData[189] = 0;
  _$jscoverage['/bubble.js'].lineData[190] = 0;
  _$jscoverage['/bubble.js'].lineData[191] = 0;
  _$jscoverage['/bubble.js'].lineData[193] = 0;
  _$jscoverage['/bubble.js'].lineData[194] = 0;
  _$jscoverage['/bubble.js'].lineData[196] = 0;
  _$jscoverage['/bubble.js'].lineData[201] = 0;
  _$jscoverage['/bubble.js'].lineData[203] = 0;
  _$jscoverage['/bubble.js'].lineData[204] = 0;
  _$jscoverage['/bubble.js'].lineData[205] = 0;
  _$jscoverage['/bubble.js'].lineData[207] = 0;
  _$jscoverage['/bubble.js'].lineData[208] = 0;
  _$jscoverage['/bubble.js'].lineData[209] = 0;
  _$jscoverage['/bubble.js'].lineData[212] = 0;
  _$jscoverage['/bubble.js'].lineData[213] = 0;
  _$jscoverage['/bubble.js'].lineData[214] = 0;
  _$jscoverage['/bubble.js'].lineData[215] = 0;
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
  _$jscoverage['/bubble.js'].branchData['23'] = [];
  _$jscoverage['/bubble.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['23'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['23'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['34'] = [];
  _$jscoverage['/bubble.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['45'] = [];
  _$jscoverage['/bubble.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['46'] = [];
  _$jscoverage['/bubble.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['47'] = [];
  _$jscoverage['/bubble.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['49'] = [];
  _$jscoverage['/bubble.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['51'] = [];
  _$jscoverage['/bubble.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['64'] = [];
  _$jscoverage['/bubble.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['91'] = [];
  _$jscoverage['/bubble.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['92'] = [];
  _$jscoverage['/bubble.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['93'] = [];
  _$jscoverage['/bubble.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['99'] = [];
  _$jscoverage['/bubble.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['104'] = [];
  _$jscoverage['/bubble.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['104'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['109'] = [];
  _$jscoverage['/bubble.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['109'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['111'] = [];
  _$jscoverage['/bubble.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['111'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['115'] = [];
  _$jscoverage['/bubble.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['115'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['126'] = [];
  _$jscoverage['/bubble.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['152'] = [];
  _$jscoverage['/bubble.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['154'] = [];
  _$jscoverage['/bubble.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['158'] = [];
  _$jscoverage['/bubble.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['176'] = [];
  _$jscoverage['/bubble.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['186'] = [];
  _$jscoverage['/bubble.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['189'] = [];
  _$jscoverage['/bubble.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['193'] = [];
  _$jscoverage['/bubble.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['204'] = [];
  _$jscoverage['/bubble.js'].branchData['204'][1] = new BranchData();
}
_$jscoverage['/bubble.js'].branchData['204'][1].init(17, 31, '!bubble.get("editorSelectedEl")');
function visit39_204_1(result) {
  _$jscoverage['/bubble.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['193'][1].init(288, 22, '!bubble.get("visible")');
function visit38_193_1(result) {
  _$jscoverage['/bubble.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['189'][1].init(116, 6, 'archor');
function visit37_189_1(result) {
  _$jscoverage['/bubble.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['186'][1].init(53, 2, 'xy');
function visit36_186_1(result) {
  _$jscoverage['/bubble.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['176'][1].init(134, 9, 'editorWin');
function visit35_176_1(result) {
  _$jscoverage['/bubble.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['158'][1].init(199, 1, 'a');
function visit34_158_1(result) {
  _$jscoverage['/bubble.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['154'][1].init(76, 12, '!lastElement');
function visit33_154_1(result) {
  _$jscoverage['/bubble.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['152'][1].init(153, 23, 'elementPath && elements');
function visit32_152_1(result) {
  _$jscoverage['/bubble.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['126'][1].init(112, 9, 'cfg || {}');
function visit31_126_1(result) {
  _$jscoverage['/bubble.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['115'][3].init(1490, 15, 'y !== undefined');
function visit30_115_3(result) {
  _$jscoverage['/bubble.js'].branchData['115'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['115'][2].init(1471, 15, 'x !== undefined');
function visit29_115_2(result) {
  _$jscoverage['/bubble.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['115'][1].init(1471, 34, 'x !== undefined && y !== undefined');
function visit28_115_1(result) {
  _$jscoverage['/bubble.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['111'][3].init(1407, 14, 'elLeft < right');
function visit27_111_3(result) {
  _$jscoverage['/bubble.js'].branchData['111'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['111'][2].init(1390, 13, 'elLeft > left');
function visit26_111_2(result) {
  _$jscoverage['/bubble.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['111'][1].init(1390, 31, 'elLeft > left && elLeft < right');
function visit25_111_1(result) {
  _$jscoverage['/bubble.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['109'][3].init(1331, 13, 'elLeft < left');
function visit24_109_3(result) {
  _$jscoverage['/bubble.js'].branchData['109'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['109'][2].init(1313, 14, 'elRight > left');
function visit23_109_2(result) {
  _$jscoverage['/bubble.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['109'][1].init(1313, 31, 'elRight > left && elLeft < left');
function visit22_109_1(result) {
  _$jscoverage['/bubble.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['104'][3].init(1225, 17, 'elBottom < bottom');
function visit21_104_3(result) {
  _$jscoverage['/bubble.js'].branchData['104'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['104'][2].init(1207, 14, 'elBottom > top');
function visit20_104_2(result) {
  _$jscoverage['/bubble.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['104'][1].init(1207, 35, 'elBottom > top && elBottom < bottom');
function visit19_104_1(result) {
  _$jscoverage['/bubble.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['99'][3].init(1082, 14, 'elTop < bottom');
function visit18_99_3(result) {
  _$jscoverage['/bubble.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['99'][2].init(1061, 17, 'elBottom > bottom');
function visit17_99_2(result) {
  _$jscoverage['/bubble.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['99'][1].init(1061, 35, 'elBottom > bottom && elTop < bottom');
function visit16_99_1(result) {
  _$jscoverage['/bubble.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['93'][1].init(52, 17, 'elBottom > bottom');
function visit15_93_1(result) {
  _$jscoverage['/bubble.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['92'][2].init(886, 37, 'el[0].nodeName.toLowerCase() == \'img\'');
function visit14_92_2(result) {
  _$jscoverage['/bubble.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['92'][1].init(22, 70, 'el[0].nodeName.toLowerCase() == \'img\' && elBottom > bottom');
function visit13_92_1(result) {
  _$jscoverage['/bubble.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['91'][1].init(861, 93, 'S.UA.ie && el[0].nodeName.toLowerCase() == \'img\' && elBottom > bottom');
function visit12_91_1(result) {
  _$jscoverage['/bubble.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['64'][1].init(65, 3, '!el');
function visit11_64_1(result) {
  _$jscoverage['/bubble.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['51'][1].init(97, 33, 'archor.get("y") < bubble.get("y")');
function visit10_51_1(result) {
  _$jscoverage['/bubble.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['49'][1].init(21, 7, '!archor');
function visit9_49_1(result) {
  _$jscoverage['/bubble.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['47'][1].init(34, 62, 'bubble.get("visible") && overlap(self, bubble)');
function visit8_47_1(result) {
  _$jscoverage['/bubble.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['46'][2].init(56, 15, 'bubble !== self');
function visit7_46_2(result) {
  _$jscoverage['/bubble.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['46'][1].init(36, 97, 'bubble !== self && bubble.get("visible") && overlap(self, bubble)');
function visit6_46_1(result) {
  _$jscoverage['/bubble.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['45'][1].init(17, 134, 'bubble.isKeBubble && bubble !== self && bubble.get("visible") && overlap(self, bubble)');
function visit5_45_1(result) {
  _$jscoverage['/bubble.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['34'][1].init(207, 87, 'inRange(b1_top, b1_bottom, b2_bottom) || inRange(b1_top, b1_bottom, b2_top)');
function visit4_34_1(result) {
  _$jscoverage['/bubble.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['23'][3].init(26, 6, 'b >= r');
function visit3_23_3(result) {
  _$jscoverage['/bubble.js'].branchData['23'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['23'][2].init(16, 6, 't <= r');
function visit2_23_2(result) {
  _$jscoverage['/bubble.js'].branchData['23'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['23'][1].init(16, 16, 't <= r && b >= r');
function visit1_23_1(result) {
  _$jscoverage['/bubble.js'].branchData['23'][1].ranCondition(result);
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
  _$jscoverage['/bubble.js'].lineData[10]++;
  var undefined = {}['a'], BUBBLE_CFG = {
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.BUBBLE_VIEW), 
  elCls: "{prefixCls}editor-bubble", 
  prefixCls: "{prefixCls}editor-", 
  effect: {
  effect: "fade", 
  duration: 0.3}};
  _$jscoverage['/bubble.js'].lineData[22]++;
  function inRange(t, b, r) {
    _$jscoverage['/bubble.js'].functionData[1]++;
    _$jscoverage['/bubble.js'].lineData[23]++;
    return visit1_23_1(visit2_23_2(t <= r) && visit3_23_3(b >= r));
  }
  _$jscoverage['/bubble.js'].lineData[28]++;
  function overlap(b1, b2) {
    _$jscoverage['/bubble.js'].functionData[2]++;
    _$jscoverage['/bubble.js'].lineData[29]++;
    var b1_top = b1.get("y"), b1_bottom = b1_top + b1.get("el").outerHeight(), b2_top = b2.get("y"), b2_bottom = b2_top + b2.get("el").outerHeight();
    _$jscoverage['/bubble.js'].lineData[34]++;
    return visit4_34_1(inRange(b1_top, b1_bottom, b2_bottom) || inRange(b1_top, b1_bottom, b2_top));
  }
  _$jscoverage['/bubble.js'].lineData[40]++;
  function getTopPosition(self) {
    _$jscoverage['/bubble.js'].functionData[3]++;
    _$jscoverage['/bubble.js'].lineData[41]++;
    var archor = null, editor = self.get("editor"), myBubbles = editor.getControls();
    _$jscoverage['/bubble.js'].lineData[44]++;
    S.each(myBubbles, function(bubble) {
  _$jscoverage['/bubble.js'].functionData[4]++;
  _$jscoverage['/bubble.js'].lineData[45]++;
  if (visit5_45_1(bubble.isKeBubble && visit6_46_1(visit7_46_2(bubble !== self) && visit8_47_1(bubble.get("visible") && overlap(self, bubble))))) {
    _$jscoverage['/bubble.js'].lineData[49]++;
    if (visit9_49_1(!archor)) {
      _$jscoverage['/bubble.js'].lineData[50]++;
      archor = bubble;
    } else {
      _$jscoverage['/bubble.js'].lineData[51]++;
      if (visit10_51_1(archor.get("y") < bubble.get("y"))) {
        _$jscoverage['/bubble.js'].lineData[52]++;
        archor = bubble;
      }
    }
  }
});
    _$jscoverage['/bubble.js'].lineData[56]++;
    return archor;
  }
  _$jscoverage['/bubble.js'].lineData[59]++;
  function getXy(bubble) {
    _$jscoverage['/bubble.js'].functionData[5]++;
    _$jscoverage['/bubble.js'].lineData[61]++;
    var el = bubble.get("editorSelectedEl");
    _$jscoverage['/bubble.js'].lineData[64]++;
    if (visit11_64_1(!el)) {
      _$jscoverage['/bubble.js'].lineData[65]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[68]++;
    var editor = bubble.get("editor"), editorWin = editor.get("window"), iframeXY = editor.get("iframe").offset(), top = iframeXY.top, left = iframeXY.left, right = left + editorWin.width(), bottom = top + editorWin.height();
    _$jscoverage['/bubble.js'].lineData[79]++;
    var elXY = el.offset();
    _$jscoverage['/bubble.js'].lineData[81]++;
    elXY = Editor.Utils.getXY(elXY, editor);
    _$jscoverage['/bubble.js'].lineData[83]++;
    var elTop = elXY.top, elLeft = elXY.left, elRight = elLeft + el.width(), elBottom = elTop + el.height(), x, y;
    _$jscoverage['/bubble.js'].lineData[91]++;
    if (visit12_91_1(S.UA.ie && visit13_92_1(visit14_92_2(el[0].nodeName.toLowerCase() == 'img') && visit15_93_1(elBottom > bottom)))) {
      _$jscoverage['/bubble.js'].lineData[94]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[99]++;
    if (visit16_99_1(visit17_99_2(elBottom > bottom) && visit18_99_3(elTop < bottom))) {
      _$jscoverage['/bubble.js'].lineData[101]++;
      y = bottom - 30;
    } else {
      _$jscoverage['/bubble.js'].lineData[104]++;
      if (visit19_104_1(visit20_104_2(elBottom > top) && visit21_104_3(elBottom < bottom))) {
        _$jscoverage['/bubble.js'].lineData[105]++;
        y = elBottom;
      }
    }
    _$jscoverage['/bubble.js'].lineData[109]++;
    if (visit22_109_1(visit23_109_2(elRight > left) && visit24_109_3(elLeft < left))) {
      _$jscoverage['/bubble.js'].lineData[110]++;
      x = left;
    } else {
      _$jscoverage['/bubble.js'].lineData[111]++;
      if (visit25_111_1(visit26_111_2(elLeft > left) && visit27_111_3(elLeft < right))) {
        _$jscoverage['/bubble.js'].lineData[112]++;
        x = elLeft;
      }
    }
    _$jscoverage['/bubble.js'].lineData[115]++;
    if (visit28_115_1(visit29_115_2(x !== undefined) && visit30_115_3(y !== undefined))) {
      _$jscoverage['/bubble.js'].lineData[116]++;
      return [x, y];
    }
    _$jscoverage['/bubble.js'].lineData[118]++;
    return undefined;
  }
  _$jscoverage['/bubble.js'].lineData[121]++;
  Editor.prototype.addBubble = function(id, filter, cfg) {
  _$jscoverage['/bubble.js'].functionData[6]++;
  _$jscoverage['/bubble.js'].lineData[122]++;
  var editor = this, prefixCls = editor.get('prefixCls'), bubble;
  _$jscoverage['/bubble.js'].lineData[126]++;
  cfg = visit31_126_1(cfg || {});
  _$jscoverage['/bubble.js'].lineData[128]++;
  cfg.editor = editor;
  _$jscoverage['/bubble.js'].lineData[130]++;
  S.mix(cfg, BUBBLE_CFG);
  _$jscoverage['/bubble.js'].lineData[132]++;
  cfg.elCls = S.substitute(cfg.elCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[136]++;
  cfg.prefixCls = S.substitute(cfg.prefixCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[140]++;
  bubble = new Overlay(cfg);
  _$jscoverage['/bubble.js'].lineData[142]++;
  bubble.isKeBubble = 1;
  _$jscoverage['/bubble.js'].lineData[144]++;
  editor.addControl(id + "/bubble", bubble);
  _$jscoverage['/bubble.js'].lineData[147]++;
  editor.on("selectionChange", function(ev) {
  _$jscoverage['/bubble.js'].functionData[7]++;
  _$jscoverage['/bubble.js'].lineData[148]++;
  var elementPath = ev.path, elements = elementPath.elements, a, lastElement;
  _$jscoverage['/bubble.js'].lineData[152]++;
  if (visit32_152_1(elementPath && elements)) {
    _$jscoverage['/bubble.js'].lineData[153]++;
    lastElement = elementPath.lastElement;
    _$jscoverage['/bubble.js'].lineData[154]++;
    if (visit33_154_1(!lastElement)) {
      _$jscoverage['/bubble.js'].lineData[155]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[157]++;
    a = filter(lastElement);
    _$jscoverage['/bubble.js'].lineData[158]++;
    if (visit34_158_1(a)) {
      _$jscoverage['/bubble.js'].lineData[159]++;
      bubble.set("editorSelectedEl", a);
      _$jscoverage['/bubble.js'].lineData[161]++;
      bubble.hide();
      _$jscoverage['/bubble.js'].lineData[163]++;
      S.later(onShow, 10);
    } else {
      _$jscoverage['/bubble.js'].lineData[165]++;
      onHide();
    }
  }
});
  _$jscoverage['/bubble.js'].lineData[172]++;
  function onHide() {
    _$jscoverage['/bubble.js'].functionData[8]++;
    _$jscoverage['/bubble.js'].lineData[173]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[174]++;
    var editorWin = editor.get("window");
    _$jscoverage['/bubble.js'].lineData[176]++;
    if (visit35_176_1(editorWin)) {
      _$jscoverage['/bubble.js'].lineData[177]++;
      editorWin.detach("scroll", onScroll);
      _$jscoverage['/bubble.js'].lineData[178]++;
      bufferScroll.stop();
    }
  }
  _$jscoverage['/bubble.js'].lineData[182]++;
  editor.on("sourceMode", onHide);
  _$jscoverage['/bubble.js'].lineData[184]++;
  function showImmediately() {
    _$jscoverage['/bubble.js'].functionData[9]++;
    _$jscoverage['/bubble.js'].lineData[185]++;
    var xy = getXy(bubble);
    _$jscoverage['/bubble.js'].lineData[186]++;
    if (visit36_186_1(xy)) {
      _$jscoverage['/bubble.js'].lineData[187]++;
      bubble.move(xy[0], xy[1]);
      _$jscoverage['/bubble.js'].lineData[188]++;
      var archor = getTopPosition(bubble);
      _$jscoverage['/bubble.js'].lineData[189]++;
      if (visit37_189_1(archor)) {
        _$jscoverage['/bubble.js'].lineData[190]++;
        xy[1] = archor.get("y") + archor.get("el").outerHeight();
        _$jscoverage['/bubble.js'].lineData[191]++;
        bubble.move(xy[0], xy[1]);
      }
      _$jscoverage['/bubble.js'].lineData[193]++;
      if (visit38_193_1(!bubble.get("visible"))) {
        _$jscoverage['/bubble.js'].lineData[194]++;
        bubble.show();
      } else {
        _$jscoverage['/bubble.js'].lineData[196]++;
        logger.debug("already show by selectionChange");
      }
    }
  }
  _$jscoverage['/bubble.js'].lineData[201]++;
  var bufferScroll = S.buffer(showImmediately, 350);
  _$jscoverage['/bubble.js'].lineData[203]++;
  function onScroll() {
    _$jscoverage['/bubble.js'].functionData[10]++;
    _$jscoverage['/bubble.js'].lineData[204]++;
    if (visit39_204_1(!bubble.get("editorSelectedEl"))) {
      _$jscoverage['/bubble.js'].lineData[205]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[207]++;
    var el = bubble.get("el");
    _$jscoverage['/bubble.js'].lineData[208]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[209]++;
    bufferScroll();
  }
  _$jscoverage['/bubble.js'].lineData[212]++;
  function onShow() {
    _$jscoverage['/bubble.js'].functionData[11]++;
    _$jscoverage['/bubble.js'].lineData[213]++;
    var editorWin = editor.get("window");
    _$jscoverage['/bubble.js'].lineData[214]++;
    editorWin.on("scroll", onScroll);
    _$jscoverage['/bubble.js'].lineData[215]++;
    showImmediately();
  }
};
});
