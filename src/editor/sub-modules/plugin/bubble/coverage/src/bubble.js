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
  _$jscoverage['/bubble.js'].lineData[20] = 0;
  _$jscoverage['/bubble.js'].lineData[21] = 0;
  _$jscoverage['/bubble.js'].lineData[26] = 0;
  _$jscoverage['/bubble.js'].lineData[27] = 0;
  _$jscoverage['/bubble.js'].lineData[32] = 0;
  _$jscoverage['/bubble.js'].lineData[38] = 0;
  _$jscoverage['/bubble.js'].lineData[39] = 0;
  _$jscoverage['/bubble.js'].lineData[42] = 0;
  _$jscoverage['/bubble.js'].lineData[43] = 0;
  _$jscoverage['/bubble.js'].lineData[47] = 0;
  _$jscoverage['/bubble.js'].lineData[48] = 0;
  _$jscoverage['/bubble.js'].lineData[49] = 0;
  _$jscoverage['/bubble.js'].lineData[50] = 0;
  _$jscoverage['/bubble.js'].lineData[54] = 0;
  _$jscoverage['/bubble.js'].lineData[57] = 0;
  _$jscoverage['/bubble.js'].lineData[59] = 0;
  _$jscoverage['/bubble.js'].lineData[62] = 0;
  _$jscoverage['/bubble.js'].lineData[63] = 0;
  _$jscoverage['/bubble.js'].lineData[66] = 0;
  _$jscoverage['/bubble.js'].lineData[77] = 0;
  _$jscoverage['/bubble.js'].lineData[79] = 0;
  _$jscoverage['/bubble.js'].lineData[81] = 0;
  _$jscoverage['/bubble.js'].lineData[89] = 0;
  _$jscoverage['/bubble.js'].lineData[92] = 0;
  _$jscoverage['/bubble.js'].lineData[97] = 0;
  _$jscoverage['/bubble.js'].lineData[99] = 0;
  _$jscoverage['/bubble.js'].lineData[102] = 0;
  _$jscoverage['/bubble.js'].lineData[103] = 0;
  _$jscoverage['/bubble.js'].lineData[107] = 0;
  _$jscoverage['/bubble.js'].lineData[108] = 0;
  _$jscoverage['/bubble.js'].lineData[109] = 0;
  _$jscoverage['/bubble.js'].lineData[110] = 0;
  _$jscoverage['/bubble.js'].lineData[113] = 0;
  _$jscoverage['/bubble.js'].lineData[114] = 0;
  _$jscoverage['/bubble.js'].lineData[116] = 0;
  _$jscoverage['/bubble.js'].lineData[119] = 0;
  _$jscoverage['/bubble.js'].lineData[120] = 0;
  _$jscoverage['/bubble.js'].lineData[124] = 0;
  _$jscoverage['/bubble.js'].lineData[126] = 0;
  _$jscoverage['/bubble.js'].lineData[128] = 0;
  _$jscoverage['/bubble.js'].lineData[130] = 0;
  _$jscoverage['/bubble.js'].lineData[134] = 0;
  _$jscoverage['/bubble.js'].lineData[138] = 0;
  _$jscoverage['/bubble.js'].lineData[140] = 0;
  _$jscoverage['/bubble.js'].lineData[142] = 0;
  _$jscoverage['/bubble.js'].lineData[145] = 0;
  _$jscoverage['/bubble.js'].lineData[146] = 0;
  _$jscoverage['/bubble.js'].lineData[150] = 0;
  _$jscoverage['/bubble.js'].lineData[151] = 0;
  _$jscoverage['/bubble.js'].lineData[152] = 0;
  _$jscoverage['/bubble.js'].lineData[153] = 0;
  _$jscoverage['/bubble.js'].lineData[155] = 0;
  _$jscoverage['/bubble.js'].lineData[156] = 0;
  _$jscoverage['/bubble.js'].lineData[157] = 0;
  _$jscoverage['/bubble.js'].lineData[159] = 0;
  _$jscoverage['/bubble.js'].lineData[161] = 0;
  _$jscoverage['/bubble.js'].lineData[163] = 0;
  _$jscoverage['/bubble.js'].lineData[170] = 0;
  _$jscoverage['/bubble.js'].lineData[171] = 0;
  _$jscoverage['/bubble.js'].lineData[172] = 0;
  _$jscoverage['/bubble.js'].lineData[174] = 0;
  _$jscoverage['/bubble.js'].lineData[175] = 0;
  _$jscoverage['/bubble.js'].lineData[176] = 0;
  _$jscoverage['/bubble.js'].lineData[180] = 0;
  _$jscoverage['/bubble.js'].lineData[182] = 0;
  _$jscoverage['/bubble.js'].lineData[183] = 0;
  _$jscoverage['/bubble.js'].lineData[184] = 0;
  _$jscoverage['/bubble.js'].lineData[185] = 0;
  _$jscoverage['/bubble.js'].lineData[186] = 0;
  _$jscoverage['/bubble.js'].lineData[187] = 0;
  _$jscoverage['/bubble.js'].lineData[188] = 0;
  _$jscoverage['/bubble.js'].lineData[189] = 0;
  _$jscoverage['/bubble.js'].lineData[191] = 0;
  _$jscoverage['/bubble.js'].lineData[192] = 0;
  _$jscoverage['/bubble.js'].lineData[194] = 0;
  _$jscoverage['/bubble.js'].lineData[199] = 0;
  _$jscoverage['/bubble.js'].lineData[201] = 0;
  _$jscoverage['/bubble.js'].lineData[202] = 0;
  _$jscoverage['/bubble.js'].lineData[203] = 0;
  _$jscoverage['/bubble.js'].lineData[205] = 0;
  _$jscoverage['/bubble.js'].lineData[206] = 0;
  _$jscoverage['/bubble.js'].lineData[209] = 0;
  _$jscoverage['/bubble.js'].lineData[210] = 0;
  _$jscoverage['/bubble.js'].lineData[211] = 0;
  _$jscoverage['/bubble.js'].lineData[212] = 0;
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
  _$jscoverage['/bubble.js'].branchData['21'] = [];
  _$jscoverage['/bubble.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['21'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['32'] = [];
  _$jscoverage['/bubble.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['43'] = [];
  _$jscoverage['/bubble.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['44'] = [];
  _$jscoverage['/bubble.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['45'] = [];
  _$jscoverage['/bubble.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['47'] = [];
  _$jscoverage['/bubble.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['49'] = [];
  _$jscoverage['/bubble.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['62'] = [];
  _$jscoverage['/bubble.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['89'] = [];
  _$jscoverage['/bubble.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['90'] = [];
  _$jscoverage['/bubble.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['91'] = [];
  _$jscoverage['/bubble.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['97'] = [];
  _$jscoverage['/bubble.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['97'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['102'] = [];
  _$jscoverage['/bubble.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['107'] = [];
  _$jscoverage['/bubble.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['107'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['109'] = [];
  _$jscoverage['/bubble.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['109'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['113'] = [];
  _$jscoverage['/bubble.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['113'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['124'] = [];
  _$jscoverage['/bubble.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['150'] = [];
  _$jscoverage['/bubble.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['152'] = [];
  _$jscoverage['/bubble.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['156'] = [];
  _$jscoverage['/bubble.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['174'] = [];
  _$jscoverage['/bubble.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['184'] = [];
  _$jscoverage['/bubble.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['187'] = [];
  _$jscoverage['/bubble.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['191'] = [];
  _$jscoverage['/bubble.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['202'] = [];
  _$jscoverage['/bubble.js'].branchData['202'][1] = new BranchData();
}
_$jscoverage['/bubble.js'].branchData['202'][1].init(18, 31, '!bubble.get(\'editorSelectedEl\')');
function visit39_202_1(result) {
  _$jscoverage['/bubble.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['191'][1].init(297, 22, '!bubble.get(\'visible\')');
function visit38_191_1(result) {
  _$jscoverage['/bubble.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['187'][1].init(120, 6, 'archor');
function visit37_187_1(result) {
  _$jscoverage['/bubble.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['184'][1].init(55, 2, 'xy');
function visit36_184_1(result) {
  _$jscoverage['/bubble.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['174'][1].init(138, 9, 'editorWin');
function visit35_174_1(result) {
  _$jscoverage['/bubble.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['156'][1].init(205, 1, 'a');
function visit34_156_1(result) {
  _$jscoverage['/bubble.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['152'][1].init(78, 12, '!lastElement');
function visit33_152_1(result) {
  _$jscoverage['/bubble.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['150'][1].init(158, 23, 'elementPath && elements');
function visit32_150_1(result) {
  _$jscoverage['/bubble.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['124'][1].init(117, 9, 'cfg || {}');
function visit31_124_1(result) {
  _$jscoverage['/bubble.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['113'][3].init(1547, 15, 'y !== undefined');
function visit30_113_3(result) {
  _$jscoverage['/bubble.js'].branchData['113'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['113'][2].init(1528, 15, 'x !== undefined');
function visit29_113_2(result) {
  _$jscoverage['/bubble.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['113'][1].init(1528, 34, 'x !== undefined && y !== undefined');
function visit28_113_1(result) {
  _$jscoverage['/bubble.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['109'][3].init(1460, 14, 'elLeft < right');
function visit27_109_3(result) {
  _$jscoverage['/bubble.js'].branchData['109'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['109'][2].init(1443, 13, 'elLeft > left');
function visit26_109_2(result) {
  _$jscoverage['/bubble.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['109'][1].init(1443, 31, 'elLeft > left && elLeft < right');
function visit25_109_1(result) {
  _$jscoverage['/bubble.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['107'][3].init(1382, 13, 'elLeft < left');
function visit24_107_3(result) {
  _$jscoverage['/bubble.js'].branchData['107'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['107'][2].init(1364, 14, 'elRight > left');
function visit23_107_2(result) {
  _$jscoverage['/bubble.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['107'][1].init(1364, 31, 'elRight > left && elLeft < left');
function visit22_107_1(result) {
  _$jscoverage['/bubble.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['102'][3].init(1271, 17, 'elBottom < bottom');
function visit21_102_3(result) {
  _$jscoverage['/bubble.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['102'][2].init(1253, 14, 'elBottom > top');
function visit20_102_2(result) {
  _$jscoverage['/bubble.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['102'][1].init(1253, 35, 'elBottom > top && elBottom < bottom');
function visit19_102_1(result) {
  _$jscoverage['/bubble.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['97'][3].init(1123, 14, 'elTop < bottom');
function visit18_97_3(result) {
  _$jscoverage['/bubble.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['97'][2].init(1102, 17, 'elBottom > bottom');
function visit17_97_2(result) {
  _$jscoverage['/bubble.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['97'][1].init(1102, 35, 'elBottom > bottom && elTop < bottom');
function visit16_97_1(result) {
  _$jscoverage['/bubble.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['91'][1].init(54, 17, 'elBottom > bottom');
function visit15_91_1(result) {
  _$jscoverage['/bubble.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['90'][2].init(919, 38, 'el[0].nodeName.toLowerCase() === \'img\'');
function visit14_90_2(result) {
  _$jscoverage['/bubble.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['90'][1].init(23, 72, 'el[0].nodeName.toLowerCase() === \'img\' && elBottom > bottom');
function visit13_90_1(result) {
  _$jscoverage['/bubble.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['89'][1].init(893, 96, 'S.UA.ie && el[0].nodeName.toLowerCase() === \'img\' && elBottom > bottom');
function visit12_89_1(result) {
  _$jscoverage['/bubble.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['62'][1].init(70, 3, '!el');
function visit11_62_1(result) {
  _$jscoverage['/bubble.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['49'][1].init(100, 33, 'archor.get(\'y\') < bubble.get(\'y\')');
function visit10_49_1(result) {
  _$jscoverage['/bubble.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['47'][1].init(22, 7, '!archor');
function visit9_47_1(result) {
  _$jscoverage['/bubble.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['45'][1].init(35, 63, 'bubble.get(\'visible\') && overlap(self, bubble)');
function visit8_45_1(result) {
  _$jscoverage['/bubble.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['44'][2].init(58, 15, 'bubble !== self');
function visit7_44_2(result) {
  _$jscoverage['/bubble.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['44'][1].init(37, 99, 'bubble !== self && bubble.get(\'visible\') && overlap(self, bubble)');
function visit6_44_1(result) {
  _$jscoverage['/bubble.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['43'][1].init(18, 137, 'bubble.isKeBubble && bubble !== self && bubble.get(\'visible\') && overlap(self, bubble)');
function visit5_43_1(result) {
  _$jscoverage['/bubble.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['32'][1].init(207, 82, 'inRange(b1Top, b1Bottom, b2Bottom) || inRange(b1Top, b1Bottom, b2Top)');
function visit4_32_1(result) {
  _$jscoverage['/bubble.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['21'][3].init(27, 6, 'b >= r');
function visit3_21_3(result) {
  _$jscoverage['/bubble.js'].branchData['21'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['21'][2].init(17, 6, 't <= r');
function visit2_21_2(result) {
  _$jscoverage['/bubble.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['21'][1].init(17, 16, 't <= r && b >= r');
function visit1_21_1(result) {
  _$jscoverage['/bubble.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/bubble.js'].functionData[0]++;
  _$jscoverage['/bubble.js'].lineData[7]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/bubble.js'].lineData[8]++;
  var Overlay = require('overlay');
  _$jscoverage['/bubble.js'].lineData[9]++;
  var Editor = require('editor');
  _$jscoverage['/bubble.js'].lineData[10]++;
  var BUBBLE_CFG = {
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.BUBBLE_VIEW), 
  elCls: '{prefixCls}editor-bubble', 
  prefixCls: '{prefixCls}editor-', 
  effect: {
  effect: 'fade', 
  duration: 0.3}};
  _$jscoverage['/bubble.js'].lineData[20]++;
  function inRange(t, b, r) {
    _$jscoverage['/bubble.js'].functionData[1]++;
    _$jscoverage['/bubble.js'].lineData[21]++;
    return visit1_21_1(visit2_21_2(t <= r) && visit3_21_3(b >= r));
  }
  _$jscoverage['/bubble.js'].lineData[26]++;
  function overlap(b1, b2) {
    _$jscoverage['/bubble.js'].functionData[2]++;
    _$jscoverage['/bubble.js'].lineData[27]++;
    var b1Top = b1.get('y'), b1Bottom = b1Top + b1.get('el').outerHeight(), b2Top = b2.get('y'), b2Bottom = b2Top + b2.get('el').outerHeight();
    _$jscoverage['/bubble.js'].lineData[32]++;
    return visit4_32_1(inRange(b1Top, b1Bottom, b2Bottom) || inRange(b1Top, b1Bottom, b2Top));
  }
  _$jscoverage['/bubble.js'].lineData[38]++;
  function getTopPosition(self) {
    _$jscoverage['/bubble.js'].functionData[3]++;
    _$jscoverage['/bubble.js'].lineData[39]++;
    var archor = null, editor = self.get('editor'), myBubbles = editor.getControls();
    _$jscoverage['/bubble.js'].lineData[42]++;
    S.each(myBubbles, function(bubble) {
  _$jscoverage['/bubble.js'].functionData[4]++;
  _$jscoverage['/bubble.js'].lineData[43]++;
  if (visit5_43_1(bubble.isKeBubble && visit6_44_1(visit7_44_2(bubble !== self) && visit8_45_1(bubble.get('visible') && overlap(self, bubble))))) {
    _$jscoverage['/bubble.js'].lineData[47]++;
    if (visit9_47_1(!archor)) {
      _$jscoverage['/bubble.js'].lineData[48]++;
      archor = bubble;
    } else {
      _$jscoverage['/bubble.js'].lineData[49]++;
      if (visit10_49_1(archor.get('y') < bubble.get('y'))) {
        _$jscoverage['/bubble.js'].lineData[50]++;
        archor = bubble;
      }
    }
  }
});
    _$jscoverage['/bubble.js'].lineData[54]++;
    return archor;
  }
  _$jscoverage['/bubble.js'].lineData[57]++;
  function getXy(bubble) {
    _$jscoverage['/bubble.js'].functionData[5]++;
    _$jscoverage['/bubble.js'].lineData[59]++;
    var el = bubble.get('editorSelectedEl');
    _$jscoverage['/bubble.js'].lineData[62]++;
    if (visit11_62_1(!el)) {
      _$jscoverage['/bubble.js'].lineData[63]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[66]++;
    var editor = bubble.get('editor'), editorWin = editor.get('window'), iframeXY = editor.get('iframe').offset(), top = iframeXY.top, left = iframeXY.left, right = left + editorWin.width(), bottom = top + editorWin.height();
    _$jscoverage['/bubble.js'].lineData[77]++;
    var elXY = el.offset();
    _$jscoverage['/bubble.js'].lineData[79]++;
    elXY = Editor.Utils.getXY(elXY, editor);
    _$jscoverage['/bubble.js'].lineData[81]++;
    var elTop = elXY.top, elLeft = elXY.left, elRight = elLeft + el.width(), elBottom = elTop + el.height(), x, y;
    _$jscoverage['/bubble.js'].lineData[89]++;
    if (visit12_89_1(S.UA.ie && visit13_90_1(visit14_90_2(el[0].nodeName.toLowerCase() === 'img') && visit15_91_1(elBottom > bottom)))) {
      _$jscoverage['/bubble.js'].lineData[92]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[97]++;
    if (visit16_97_1(visit17_97_2(elBottom > bottom) && visit18_97_3(elTop < bottom))) {
      _$jscoverage['/bubble.js'].lineData[99]++;
      y = bottom - 30;
    } else {
      _$jscoverage['/bubble.js'].lineData[102]++;
      if (visit19_102_1(visit20_102_2(elBottom > top) && visit21_102_3(elBottom < bottom))) {
        _$jscoverage['/bubble.js'].lineData[103]++;
        y = elBottom;
      }
    }
    _$jscoverage['/bubble.js'].lineData[107]++;
    if (visit22_107_1(visit23_107_2(elRight > left) && visit24_107_3(elLeft < left))) {
      _$jscoverage['/bubble.js'].lineData[108]++;
      x = left;
    } else {
      _$jscoverage['/bubble.js'].lineData[109]++;
      if (visit25_109_1(visit26_109_2(elLeft > left) && visit27_109_3(elLeft < right))) {
        _$jscoverage['/bubble.js'].lineData[110]++;
        x = elLeft;
      }
    }
    _$jscoverage['/bubble.js'].lineData[113]++;
    if (visit28_113_1(visit29_113_2(x !== undefined) && visit30_113_3(y !== undefined))) {
      _$jscoverage['/bubble.js'].lineData[114]++;
      return [x, y];
    }
    _$jscoverage['/bubble.js'].lineData[116]++;
    return undefined;
  }
  _$jscoverage['/bubble.js'].lineData[119]++;
  Editor.prototype.addBubble = function(id, filter, cfg) {
  _$jscoverage['/bubble.js'].functionData[6]++;
  _$jscoverage['/bubble.js'].lineData[120]++;
  var editor = this, prefixCls = editor.get('prefixCls'), bubble;
  _$jscoverage['/bubble.js'].lineData[124]++;
  cfg = visit31_124_1(cfg || {});
  _$jscoverage['/bubble.js'].lineData[126]++;
  cfg.editor = editor;
  _$jscoverage['/bubble.js'].lineData[128]++;
  S.mix(cfg, BUBBLE_CFG);
  _$jscoverage['/bubble.js'].lineData[130]++;
  cfg.elCls = S.substitute(cfg.elCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[134]++;
  cfg.prefixCls = S.substitute(cfg.prefixCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[138]++;
  bubble = new Overlay(cfg);
  _$jscoverage['/bubble.js'].lineData[140]++;
  bubble.isKeBubble = 1;
  _$jscoverage['/bubble.js'].lineData[142]++;
  editor.addControl(id + '/bubble', bubble);
  _$jscoverage['/bubble.js'].lineData[145]++;
  editor.on('selectionChange', function(ev) {
  _$jscoverage['/bubble.js'].functionData[7]++;
  _$jscoverage['/bubble.js'].lineData[146]++;
  var elementPath = ev.path, elements = elementPath.elements, a, lastElement;
  _$jscoverage['/bubble.js'].lineData[150]++;
  if (visit32_150_1(elementPath && elements)) {
    _$jscoverage['/bubble.js'].lineData[151]++;
    lastElement = elementPath.lastElement;
    _$jscoverage['/bubble.js'].lineData[152]++;
    if (visit33_152_1(!lastElement)) {
      _$jscoverage['/bubble.js'].lineData[153]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[155]++;
    a = filter(lastElement);
    _$jscoverage['/bubble.js'].lineData[156]++;
    if (visit34_156_1(a)) {
      _$jscoverage['/bubble.js'].lineData[157]++;
      bubble.set('editorSelectedEl', a);
      _$jscoverage['/bubble.js'].lineData[159]++;
      bubble.hide();
      _$jscoverage['/bubble.js'].lineData[161]++;
      S.later(onShow, 10);
    } else {
      _$jscoverage['/bubble.js'].lineData[163]++;
      onHide();
    }
  }
});
  _$jscoverage['/bubble.js'].lineData[170]++;
  function onHide() {
    _$jscoverage['/bubble.js'].functionData[8]++;
    _$jscoverage['/bubble.js'].lineData[171]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[172]++;
    var editorWin = editor.get('window');
    _$jscoverage['/bubble.js'].lineData[174]++;
    if (visit35_174_1(editorWin)) {
      _$jscoverage['/bubble.js'].lineData[175]++;
      editorWin.detach('scroll', onScroll);
      _$jscoverage['/bubble.js'].lineData[176]++;
      bufferScroll.stop();
    }
  }
  _$jscoverage['/bubble.js'].lineData[180]++;
  editor.on('sourceMode', onHide);
  _$jscoverage['/bubble.js'].lineData[182]++;
  function showImmediately() {
    _$jscoverage['/bubble.js'].functionData[9]++;
    _$jscoverage['/bubble.js'].lineData[183]++;
    var xy = getXy(bubble);
    _$jscoverage['/bubble.js'].lineData[184]++;
    if (visit36_184_1(xy)) {
      _$jscoverage['/bubble.js'].lineData[185]++;
      bubble.move(xy[0], xy[1]);
      _$jscoverage['/bubble.js'].lineData[186]++;
      var archor = getTopPosition(bubble);
      _$jscoverage['/bubble.js'].lineData[187]++;
      if (visit37_187_1(archor)) {
        _$jscoverage['/bubble.js'].lineData[188]++;
        xy[1] = archor.get('y') + archor.get('el').outerHeight();
        _$jscoverage['/bubble.js'].lineData[189]++;
        bubble.move(xy[0], xy[1]);
      }
      _$jscoverage['/bubble.js'].lineData[191]++;
      if (visit38_191_1(!bubble.get('visible'))) {
        _$jscoverage['/bubble.js'].lineData[192]++;
        bubble.show();
      } else {
        _$jscoverage['/bubble.js'].lineData[194]++;
        logger.debug('already show by selectionChange');
      }
    }
  }
  _$jscoverage['/bubble.js'].lineData[199]++;
  var bufferScroll = S.buffer(showImmediately, 350);
  _$jscoverage['/bubble.js'].lineData[201]++;
  function onScroll() {
    _$jscoverage['/bubble.js'].functionData[10]++;
    _$jscoverage['/bubble.js'].lineData[202]++;
    if (visit39_202_1(!bubble.get('editorSelectedEl'))) {
      _$jscoverage['/bubble.js'].lineData[203]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[205]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[206]++;
    bufferScroll();
  }
  _$jscoverage['/bubble.js'].lineData[209]++;
  function onShow() {
    _$jscoverage['/bubble.js'].functionData[11]++;
    _$jscoverage['/bubble.js'].lineData[210]++;
    var editorWin = editor.get('window');
    _$jscoverage['/bubble.js'].lineData[211]++;
    editorWin.on('scroll', onScroll);
    _$jscoverage['/bubble.js'].lineData[212]++;
    showImmediately();
  }
};
});
