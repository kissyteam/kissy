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
  _$jscoverage['/bubble.js'].lineData[5] = 0;
  _$jscoverage['/bubble.js'].lineData[6] = 0;
  _$jscoverage['/bubble.js'].lineData[17] = 0;
  _$jscoverage['/bubble.js'].lineData[18] = 0;
  _$jscoverage['/bubble.js'].lineData[24] = 0;
  _$jscoverage['/bubble.js'].lineData[25] = 0;
  _$jscoverage['/bubble.js'].lineData[30] = 0;
  _$jscoverage['/bubble.js'].lineData[37] = 0;
  _$jscoverage['/bubble.js'].lineData[38] = 0;
  _$jscoverage['/bubble.js'].lineData[41] = 0;
  _$jscoverage['/bubble.js'].lineData[42] = 0;
  _$jscoverage['/bubble.js'].lineData[46] = 0;
  _$jscoverage['/bubble.js'].lineData[47] = 0;
  _$jscoverage['/bubble.js'].lineData[48] = 0;
  _$jscoverage['/bubble.js'].lineData[49] = 0;
  _$jscoverage['/bubble.js'].lineData[53] = 0;
  _$jscoverage['/bubble.js'].lineData[56] = 0;
  _$jscoverage['/bubble.js'].lineData[58] = 0;
  _$jscoverage['/bubble.js'].lineData[61] = 0;
  _$jscoverage['/bubble.js'].lineData[62] = 0;
  _$jscoverage['/bubble.js'].lineData[65] = 0;
  _$jscoverage['/bubble.js'].lineData[76] = 0;
  _$jscoverage['/bubble.js'].lineData[78] = 0;
  _$jscoverage['/bubble.js'].lineData[80] = 0;
  _$jscoverage['/bubble.js'].lineData[88] = 0;
  _$jscoverage['/bubble.js'].lineData[91] = 0;
  _$jscoverage['/bubble.js'].lineData[96] = 0;
  _$jscoverage['/bubble.js'].lineData[98] = 0;
  _$jscoverage['/bubble.js'].lineData[101] = 0;
  _$jscoverage['/bubble.js'].lineData[102] = 0;
  _$jscoverage['/bubble.js'].lineData[106] = 0;
  _$jscoverage['/bubble.js'].lineData[107] = 0;
  _$jscoverage['/bubble.js'].lineData[108] = 0;
  _$jscoverage['/bubble.js'].lineData[109] = 0;
  _$jscoverage['/bubble.js'].lineData[112] = 0;
  _$jscoverage['/bubble.js'].lineData[113] = 0;
  _$jscoverage['/bubble.js'].lineData[115] = 0;
  _$jscoverage['/bubble.js'].lineData[118] = 0;
  _$jscoverage['/bubble.js'].lineData[119] = 0;
  _$jscoverage['/bubble.js'].lineData[123] = 0;
  _$jscoverage['/bubble.js'].lineData[125] = 0;
  _$jscoverage['/bubble.js'].lineData[127] = 0;
  _$jscoverage['/bubble.js'].lineData[129] = 0;
  _$jscoverage['/bubble.js'].lineData[133] = 0;
  _$jscoverage['/bubble.js'].lineData[137] = 0;
  _$jscoverage['/bubble.js'].lineData[139] = 0;
  _$jscoverage['/bubble.js'].lineData[141] = 0;
  _$jscoverage['/bubble.js'].lineData[144] = 0;
  _$jscoverage['/bubble.js'].lineData[145] = 0;
  _$jscoverage['/bubble.js'].lineData[149] = 0;
  _$jscoverage['/bubble.js'].lineData[150] = 0;
  _$jscoverage['/bubble.js'].lineData[151] = 0;
  _$jscoverage['/bubble.js'].lineData[152] = 0;
  _$jscoverage['/bubble.js'].lineData[154] = 0;
  _$jscoverage['/bubble.js'].lineData[155] = 0;
  _$jscoverage['/bubble.js'].lineData[156] = 0;
  _$jscoverage['/bubble.js'].lineData[158] = 0;
  _$jscoverage['/bubble.js'].lineData[160] = 0;
  _$jscoverage['/bubble.js'].lineData[162] = 0;
  _$jscoverage['/bubble.js'].lineData[169] = 0;
  _$jscoverage['/bubble.js'].lineData[170] = 0;
  _$jscoverage['/bubble.js'].lineData[171] = 0;
  _$jscoverage['/bubble.js'].lineData[173] = 0;
  _$jscoverage['/bubble.js'].lineData[174] = 0;
  _$jscoverage['/bubble.js'].lineData[175] = 0;
  _$jscoverage['/bubble.js'].lineData[179] = 0;
  _$jscoverage['/bubble.js'].lineData[181] = 0;
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
  _$jscoverage['/bubble.js'].branchData['18'] = [];
  _$jscoverage['/bubble.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['18'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['30'] = [];
  _$jscoverage['/bubble.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['42'] = [];
  _$jscoverage['/bubble.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['43'] = [];
  _$jscoverage['/bubble.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['44'] = [];
  _$jscoverage['/bubble.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['46'] = [];
  _$jscoverage['/bubble.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['48'] = [];
  _$jscoverage['/bubble.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['61'] = [];
  _$jscoverage['/bubble.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['88'] = [];
  _$jscoverage['/bubble.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['89'] = [];
  _$jscoverage['/bubble.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['90'] = [];
  _$jscoverage['/bubble.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['96'] = [];
  _$jscoverage['/bubble.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['96'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['101'] = [];
  _$jscoverage['/bubble.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['106'] = [];
  _$jscoverage['/bubble.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['106'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['108'] = [];
  _$jscoverage['/bubble.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['108'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['112'] = [];
  _$jscoverage['/bubble.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['112'][3] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['123'] = [];
  _$jscoverage['/bubble.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['149'] = [];
  _$jscoverage['/bubble.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['151'] = [];
  _$jscoverage['/bubble.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['155'] = [];
  _$jscoverage['/bubble.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['173'] = [];
  _$jscoverage['/bubble.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['184'] = [];
  _$jscoverage['/bubble.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['187'] = [];
  _$jscoverage['/bubble.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['191'] = [];
  _$jscoverage['/bubble.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/bubble.js'].branchData['202'] = [];
  _$jscoverage['/bubble.js'].branchData['202'][1] = new BranchData();
}
_$jscoverage['/bubble.js'].branchData['202'][1].init(18, 31, '!bubble.get("editorSelectedEl")');
function visit39_202_1(result) {
  _$jscoverage['/bubble.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['191'][1].init(295, 22, '!bubble.get("visible")');
function visit38_191_1(result) {
  _$jscoverage['/bubble.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['187'][1].init(119, 6, 'archor');
function visit37_187_1(result) {
  _$jscoverage['/bubble.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['184'][1].init(57, 2, 'xy');
function visit36_184_1(result) {
  _$jscoverage['/bubble.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['173'][1].init(138, 9, 'editorWin');
function visit35_173_1(result) {
  _$jscoverage['/bubble.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['155'][1].init(205, 1, 'a');
function visit34_155_1(result) {
  _$jscoverage['/bubble.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['151'][1].init(78, 12, '!lastElement');
function visit33_151_1(result) {
  _$jscoverage['/bubble.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['149'][1].init(158, 23, 'elementPath && elements');
function visit32_149_1(result) {
  _$jscoverage['/bubble.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['123'][1].init(117, 9, 'cfg || {}');
function visit31_123_1(result) {
  _$jscoverage['/bubble.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['112'][3].init(1546, 15, 'y !== undefined');
function visit30_112_3(result) {
  _$jscoverage['/bubble.js'].branchData['112'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['112'][2].init(1527, 15, 'x !== undefined');
function visit29_112_2(result) {
  _$jscoverage['/bubble.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['112'][1].init(1527, 34, 'x !== undefined && y !== undefined');
function visit28_112_1(result) {
  _$jscoverage['/bubble.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['108'][3].init(1459, 14, 'elLeft < right');
function visit27_108_3(result) {
  _$jscoverage['/bubble.js'].branchData['108'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['108'][2].init(1442, 13, 'elLeft > left');
function visit26_108_2(result) {
  _$jscoverage['/bubble.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['108'][1].init(1442, 31, 'elLeft > left && elLeft < right');
function visit25_108_1(result) {
  _$jscoverage['/bubble.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['106'][3].init(1381, 13, 'elLeft < left');
function visit24_106_3(result) {
  _$jscoverage['/bubble.js'].branchData['106'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['106'][2].init(1363, 14, 'elRight > left');
function visit23_106_2(result) {
  _$jscoverage['/bubble.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['106'][1].init(1363, 31, 'elRight > left && elLeft < left');
function visit22_106_1(result) {
  _$jscoverage['/bubble.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['101'][3].init(1270, 17, 'elBottom < bottom');
function visit21_101_3(result) {
  _$jscoverage['/bubble.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['101'][2].init(1252, 14, 'elBottom > top');
function visit20_101_2(result) {
  _$jscoverage['/bubble.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['101'][1].init(1252, 35, 'elBottom > top && elBottom < bottom');
function visit19_101_1(result) {
  _$jscoverage['/bubble.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['96'][3].init(1122, 14, 'elTop < bottom');
function visit18_96_3(result) {
  _$jscoverage['/bubble.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['96'][2].init(1101, 17, 'elBottom > bottom');
function visit17_96_2(result) {
  _$jscoverage['/bubble.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['96'][1].init(1101, 35, 'elBottom > bottom && elTop < bottom');
function visit16_96_1(result) {
  _$jscoverage['/bubble.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['90'][1].init(53, 17, 'elBottom > bottom');
function visit15_90_1(result) {
  _$jscoverage['/bubble.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['89'][2].init(919, 37, 'el[0].nodeName.toLowerCase() == \'img\'');
function visit14_89_2(result) {
  _$jscoverage['/bubble.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['89'][1].init(23, 71, 'el[0].nodeName.toLowerCase() == \'img\' && elBottom > bottom');
function visit13_89_1(result) {
  _$jscoverage['/bubble.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['88'][1].init(893, 95, 'S.UA.ie && el[0].nodeName.toLowerCase() == \'img\' && elBottom > bottom');
function visit12_88_1(result) {
  _$jscoverage['/bubble.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['61'][1].init(70, 3, '!el');
function visit11_61_1(result) {
  _$jscoverage['/bubble.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['48'][1].init(100, 33, 'archor.get("y") < bubble.get("y")');
function visit10_48_1(result) {
  _$jscoverage['/bubble.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['46'][1].init(22, 7, '!archor');
function visit9_46_1(result) {
  _$jscoverage['/bubble.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['44'][1].init(35, 63, 'bubble.get("visible") && overlap(self, bubble)');
function visit8_44_1(result) {
  _$jscoverage['/bubble.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['43'][2].init(58, 15, 'bubble !== self');
function visit7_43_2(result) {
  _$jscoverage['/bubble.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['43'][1].init(37, 99, 'bubble !== self && bubble.get("visible") && overlap(self, bubble)');
function visit6_43_1(result) {
  _$jscoverage['/bubble.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['42'][1].init(18, 137, 'bubble.isKeBubble && bubble !== self && bubble.get("visible") && overlap(self, bubble)');
function visit5_42_1(result) {
  _$jscoverage['/bubble.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['30'][1].init(213, 88, 'inRange(b1_top, b1_bottom, b2_bottom) || inRange(b1_top, b1_bottom, b2_top)');
function visit4_30_1(result) {
  _$jscoverage['/bubble.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['18'][3].init(27, 6, 'b >= r');
function visit3_18_3(result) {
  _$jscoverage['/bubble.js'].branchData['18'][3].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['18'][2].init(17, 6, 't <= r');
function visit2_18_2(result) {
  _$jscoverage['/bubble.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].branchData['18'][1].init(17, 16, 't <= r && b >= r');
function visit1_18_1(result) {
  _$jscoverage['/bubble.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/bubble.js'].lineData[5]++;
KISSY.add("editor/plugin/bubble", function(S, Overlay, Editor) {
  _$jscoverage['/bubble.js'].functionData[0]++;
  _$jscoverage['/bubble.js'].lineData[6]++;
  var undefined = {}['a'], BUBBLE_CFG = {
  zIndex: Editor.baseZIndex(Editor.zIndexManager.BUBBLE_VIEW), 
  elCls: "{prefixCls}editor-bubble", 
  prefixCls: "{prefixCls}editor-", 
  effect: {
  effect: "fade", 
  duration: 0.3}};
  _$jscoverage['/bubble.js'].lineData[17]++;
  function inRange(t, b, r) {
    _$jscoverage['/bubble.js'].functionData[1]++;
    _$jscoverage['/bubble.js'].lineData[18]++;
    return visit1_18_1(visit2_18_2(t <= r) && visit3_18_3(b >= r));
  }
  _$jscoverage['/bubble.js'].lineData[24]++;
  function overlap(b1, b2) {
    _$jscoverage['/bubble.js'].functionData[2]++;
    _$jscoverage['/bubble.js'].lineData[25]++;
    var b1_top = b1.get("y"), b1_bottom = b1_top + b1.get("el").outerHeight(), b2_top = b2.get("y"), b2_bottom = b2_top + b2.get("el").outerHeight();
    _$jscoverage['/bubble.js'].lineData[30]++;
    return visit4_30_1(inRange(b1_top, b1_bottom, b2_bottom) || inRange(b1_top, b1_bottom, b2_top));
  }
  _$jscoverage['/bubble.js'].lineData[37]++;
  function getTopPosition(self) {
    _$jscoverage['/bubble.js'].functionData[3]++;
    _$jscoverage['/bubble.js'].lineData[38]++;
    var archor = null, editor = self.get("editor"), myBubbles = editor.getControls();
    _$jscoverage['/bubble.js'].lineData[41]++;
    S.each(myBubbles, function(bubble) {
  _$jscoverage['/bubble.js'].functionData[4]++;
  _$jscoverage['/bubble.js'].lineData[42]++;
  if (visit5_42_1(bubble.isKeBubble && visit6_43_1(visit7_43_2(bubble !== self) && visit8_44_1(bubble.get("visible") && overlap(self, bubble))))) {
    _$jscoverage['/bubble.js'].lineData[46]++;
    if (visit9_46_1(!archor)) {
      _$jscoverage['/bubble.js'].lineData[47]++;
      archor = bubble;
    } else {
      _$jscoverage['/bubble.js'].lineData[48]++;
      if (visit10_48_1(archor.get("y") < bubble.get("y"))) {
        _$jscoverage['/bubble.js'].lineData[49]++;
        archor = bubble;
      }
    }
  }
});
    _$jscoverage['/bubble.js'].lineData[53]++;
    return archor;
  }
  _$jscoverage['/bubble.js'].lineData[56]++;
  function getXy(bubble) {
    _$jscoverage['/bubble.js'].functionData[5]++;
    _$jscoverage['/bubble.js'].lineData[58]++;
    var el = bubble.get("editorSelectedEl");
    _$jscoverage['/bubble.js'].lineData[61]++;
    if (visit11_61_1(!el)) {
      _$jscoverage['/bubble.js'].lineData[62]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[65]++;
    var editor = bubble.get("editor"), editorWin = editor.get("window"), iframeXY = editor.get("iframe").offset(), top = iframeXY.top, left = iframeXY.left, right = left + editorWin.width(), bottom = top + editorWin.height();
    _$jscoverage['/bubble.js'].lineData[76]++;
    var elXY = el.offset();
    _$jscoverage['/bubble.js'].lineData[78]++;
    elXY = Editor.Utils.getXY(elXY, editor);
    _$jscoverage['/bubble.js'].lineData[80]++;
    var elTop = elXY.top, elLeft = elXY.left, elRight = elLeft + el.width(), elBottom = elTop + el.height(), x, y;
    _$jscoverage['/bubble.js'].lineData[88]++;
    if (visit12_88_1(S.UA.ie && visit13_89_1(visit14_89_2(el[0].nodeName.toLowerCase() == 'img') && visit15_90_1(elBottom > bottom)))) {
      _$jscoverage['/bubble.js'].lineData[91]++;
      return undefined;
    }
    _$jscoverage['/bubble.js'].lineData[96]++;
    if (visit16_96_1(visit17_96_2(elBottom > bottom) && visit18_96_3(elTop < bottom))) {
      _$jscoverage['/bubble.js'].lineData[98]++;
      y = bottom - 30;
    } else {
      _$jscoverage['/bubble.js'].lineData[101]++;
      if (visit19_101_1(visit20_101_2(elBottom > top) && visit21_101_3(elBottom < bottom))) {
        _$jscoverage['/bubble.js'].lineData[102]++;
        y = elBottom;
      }
    }
    _$jscoverage['/bubble.js'].lineData[106]++;
    if (visit22_106_1(visit23_106_2(elRight > left) && visit24_106_3(elLeft < left))) {
      _$jscoverage['/bubble.js'].lineData[107]++;
      x = left;
    } else {
      _$jscoverage['/bubble.js'].lineData[108]++;
      if (visit25_108_1(visit26_108_2(elLeft > left) && visit27_108_3(elLeft < right))) {
        _$jscoverage['/bubble.js'].lineData[109]++;
        x = elLeft;
      }
    }
    _$jscoverage['/bubble.js'].lineData[112]++;
    if (visit28_112_1(visit29_112_2(x !== undefined) && visit30_112_3(y !== undefined))) {
      _$jscoverage['/bubble.js'].lineData[113]++;
      return [x, y];
    }
    _$jscoverage['/bubble.js'].lineData[115]++;
    return undefined;
  }
  _$jscoverage['/bubble.js'].lineData[118]++;
  Editor.prototype.addBubble = function(id, filter, cfg) {
  _$jscoverage['/bubble.js'].functionData[6]++;
  _$jscoverage['/bubble.js'].lineData[119]++;
  var editor = this, prefixCls = editor.get('prefixCls'), bubble;
  _$jscoverage['/bubble.js'].lineData[123]++;
  cfg = visit31_123_1(cfg || {});
  _$jscoverage['/bubble.js'].lineData[125]++;
  cfg.editor = editor;
  _$jscoverage['/bubble.js'].lineData[127]++;
  S.mix(cfg, BUBBLE_CFG);
  _$jscoverage['/bubble.js'].lineData[129]++;
  cfg.elCls = S.substitute(cfg.elCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[133]++;
  cfg.prefixCls = S.substitute(cfg.prefixCls, {
  prefixCls: prefixCls});
  _$jscoverage['/bubble.js'].lineData[137]++;
  bubble = new Overlay(cfg);
  _$jscoverage['/bubble.js'].lineData[139]++;
  bubble.isKeBubble = 1;
  _$jscoverage['/bubble.js'].lineData[141]++;
  editor.addControl(id + "/bubble", bubble);
  _$jscoverage['/bubble.js'].lineData[144]++;
  editor.on("selectionChange", function(ev) {
  _$jscoverage['/bubble.js'].functionData[7]++;
  _$jscoverage['/bubble.js'].lineData[145]++;
  var elementPath = ev.path, elements = elementPath.elements, a, lastElement;
  _$jscoverage['/bubble.js'].lineData[149]++;
  if (visit32_149_1(elementPath && elements)) {
    _$jscoverage['/bubble.js'].lineData[150]++;
    lastElement = elementPath.lastElement;
    _$jscoverage['/bubble.js'].lineData[151]++;
    if (visit33_151_1(!lastElement)) {
      _$jscoverage['/bubble.js'].lineData[152]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[154]++;
    a = filter(lastElement);
    _$jscoverage['/bubble.js'].lineData[155]++;
    if (visit34_155_1(a)) {
      _$jscoverage['/bubble.js'].lineData[156]++;
      bubble.set("editorSelectedEl", a);
      _$jscoverage['/bubble.js'].lineData[158]++;
      bubble.hide();
      _$jscoverage['/bubble.js'].lineData[160]++;
      S.later(onShow, 10);
    } else {
      _$jscoverage['/bubble.js'].lineData[162]++;
      onHide();
    }
  }
});
  _$jscoverage['/bubble.js'].lineData[169]++;
  function onHide() {
    _$jscoverage['/bubble.js'].functionData[8]++;
    _$jscoverage['/bubble.js'].lineData[170]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[171]++;
    var editorWin = editor.get("window");
    _$jscoverage['/bubble.js'].lineData[173]++;
    if (visit35_173_1(editorWin)) {
      _$jscoverage['/bubble.js'].lineData[174]++;
      editorWin.detach("scroll", onScroll);
      _$jscoverage['/bubble.js'].lineData[175]++;
      bufferScroll.stop();
    }
  }
  _$jscoverage['/bubble.js'].lineData[179]++;
  editor.on("sourceMode", onHide);
  _$jscoverage['/bubble.js'].lineData[181]++;
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
        xy[1] = archor.get("y") + archor.get("el").outerHeight();
        _$jscoverage['/bubble.js'].lineData[189]++;
        bubble.move(xy[0], xy[1]);
      }
      _$jscoverage['/bubble.js'].lineData[191]++;
      if (visit38_191_1(!bubble.get("visible"))) {
        _$jscoverage['/bubble.js'].lineData[192]++;
        bubble.show();
      } else {
        _$jscoverage['/bubble.js'].lineData[194]++;
        S.log("already show by selectionChange");
      }
    }
  }
  _$jscoverage['/bubble.js'].lineData[199]++;
  var bufferScroll = S.buffer(showImmediately, 350);
  _$jscoverage['/bubble.js'].lineData[201]++;
  function onScroll() {
    _$jscoverage['/bubble.js'].functionData[10]++;
    _$jscoverage['/bubble.js'].lineData[202]++;
    if (visit39_202_1(!bubble.get("editorSelectedEl"))) {
      _$jscoverage['/bubble.js'].lineData[203]++;
      return;
    }
    _$jscoverage['/bubble.js'].lineData[205]++;
    var el = bubble.get("el");
    _$jscoverage['/bubble.js'].lineData[206]++;
    bubble.hide();
    _$jscoverage['/bubble.js'].lineData[207]++;
    bufferScroll();
  }
  _$jscoverage['/bubble.js'].lineData[210]++;
  function onShow() {
    _$jscoverage['/bubble.js'].functionData[11]++;
    _$jscoverage['/bubble.js'].lineData[211]++;
    var editorWin = editor.get("window");
    _$jscoverage['/bubble.js'].lineData[212]++;
    editorWin.on("scroll", onScroll);
    _$jscoverage['/bubble.js'].lineData[213]++;
    showImmediately();
  }
};
}, {
  requires: ['overlay', 'editor']});
