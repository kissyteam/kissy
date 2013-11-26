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
if (! _$jscoverage['/editor/enterKey.js']) {
  _$jscoverage['/editor/enterKey.js'] = {};
  _$jscoverage['/editor/enterKey.js'].lineData = [];
  _$jscoverage['/editor/enterKey.js'].lineData[10] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[11] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[12] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[13] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[14] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[15] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[16] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[20] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[22] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[24] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[25] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[28] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[31] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[33] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[34] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[36] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[37] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[40] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[44] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[45] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[46] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[47] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[48] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[50] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[56] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[59] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[61] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[62] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[65] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[68] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[71] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[74] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[75] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[76] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[77] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[78] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[81] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[82] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[83] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[84] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[90] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[94] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[97] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[101] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[102] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[105] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[107] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[111] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[113] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[116] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[117] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[119] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[120] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[125] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[126] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[127] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[128] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[130] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[131] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[133] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[134] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[135] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[136] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[141] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[142] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[144] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[151] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[153] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[154] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[158] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[161] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[162] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[165] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[168] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[170] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[171] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[176] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[181] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[188] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[189] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[192] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[193] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[194] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[195] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[196] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[197] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[199] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[200] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[201] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[202] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[203] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[210] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[212] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[215] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[216] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].functionData) {
  _$jscoverage['/editor/enterKey.js'].functionData = [];
  _$jscoverage['/editor/enterKey.js'].functionData[0] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[1] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[2] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[3] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[4] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[5] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[6] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].branchData) {
  _$jscoverage['/editor/enterKey.js'].branchData = {};
  _$jscoverage['/editor/enterKey.js'].branchData['15'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['24'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['36'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['40'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['41'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['41'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['44'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['61'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['74'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['76'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['81'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['81'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['90'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['94'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['94'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['95'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['101'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['107'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['111'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['116'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['119'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['126'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['127'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['130'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['133'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['141'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['151'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['151'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['158'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['161'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['162'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['196'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['197'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['202'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['202'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['202'][1].init(184, 12, 're !== false');
function visit333_202_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['197'][2].init(36, 24, 'ev.ctrlKey || ev.metaKey');
function visit332_197_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['197'][1].init(21, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit331_197_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['196'][1].init(55, 14, 'keyCode === 13');
function visit330_196_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['162'][1].init(17, 9, 'nextBlock');
function visit329_162_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['161'][1].init(5296, 7, '!OLD_IE');
function visit328_161_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['158'][1].init(2364, 31, 'isStartOfBlock && !isEndOfBlock');
function visit327_158_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['151'][3].init(2009, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit326_151_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['151'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['151'][2].init(1989, 74, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit325_151_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['151'][1].init(1979, 84, 'OLD_IE && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit324_151_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['141'][1].init(1573, 7, '!OLD_IE');
function visit323_141_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['133'][1].init(269, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit322_133_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['130'][1].init(87, 75, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit321_130_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['127'][1].init(68, 7, 'i < len');
function visit320_127_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['126'][1].init(933, 11, 'elementPath');
function visit319_126_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['119'][1].init(605, 9, '!newBlock');
function visit318_119_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['116'][1].init(532, 9, 'nextBlock');
function visit317_116_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['111'][2].init(214, 32, 'previousBlock.nodeName() == \'li\'');
function visit316_111_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['111'][1].init(214, 82, 'previousBlock.nodeName() == \'li\' || !headerTagRegex.test(previousBlock.nodeName())');
function visit315_111_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['107'][1].init(44, 13, 'previousBlock');
function visit314_107_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['101'][1].init(592, 9, 'nextBlock');
function visit313_101_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['95'][1].init(49, 108, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit312_95_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['94'][2].init(223, 28, 'nextBlock.nodeName() == \'li\'');
function visit311_94_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['94'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['94'][1].init(223, 158, 'nextBlock.nodeName() == \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit310_94_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['90'][1].init(2126, 32, '!isStartOfBlock && !isEndOfBlock');
function visit309_90_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['81'][3].init(1710, 23, 'node.nodeName() == \'li\'');
function visit308_81_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['81'][2].init(1675, 58, '(node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit307_81_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['81'][1].init(1656, 77, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit306_81_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['76'][1].init(56, 23, 'node.nodeName() == \'li\'');
function visit305_76_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['74'][1].init(1410, 9, 'nextBlock');
function visit304_74_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['61'][1].init(1023, 10, '!splitInfo');
function visit303_61_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['44'][1].init(21, 28, 'editor.hasCommand(\'outdent\')');
function visit302_44_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['41'][3].init(54, 33, 'block.parent().nodeName() == \'li\'');
function visit301_41_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['41'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['41'][2].init(26, 24, 'block.nodeName() == \'li\'');
function visit300_41_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['41'][1].init(26, 61, 'block.nodeName() == \'li\' || block.parent().nodeName() == \'li\'');
function visit299_41_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['40'][1].init(135, 90, 'block && (block.nodeName() == \'li\' || block.parent().nodeName() == \'li\')');
function visit298_40_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['36'][1].init(214, 52, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit297_36_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['24'][1].init(201, 5, 'i > 0');
function visit296_24_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['15'][1].init(172, 16, 'S.UA.ieMode < 11');
function visit295_15_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/enterKey.js'].functionData[0]++;
  _$jscoverage['/editor/enterKey.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/enterKey.js'].lineData[12]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/enterKey.js'].lineData[13]++;
  var Editor = require('./base');
  _$jscoverage['/editor/enterKey.js'].lineData[14]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/enterKey.js'].lineData[15]++;
  var OLD_IE = visit295_15_1(S.UA.ieMode < 11);
  _$jscoverage['/editor/enterKey.js'].lineData[16]++;
  var UA = S.UA, headerTagRegex = /^h[1-6]$/, dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/enterKey.js'].lineData[20]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[22]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[24]++;
    for (var i = ranges.length - 1; visit296_24_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[25]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[28]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[31]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[33]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[34]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[36]++;
    if (visit297_36_1(range.checkStartOfBlock() && range.checkEndOfBlock())) {
      _$jscoverage['/editor/enterKey.js'].lineData[37]++;
      var path = new ElementPath(range.startContainer), block = path.block;
      _$jscoverage['/editor/enterKey.js'].lineData[40]++;
      if (visit298_40_1(block && (visit299_41_1(visit300_41_2(block.nodeName() == 'li') || visit301_41_3(block.parent().nodeName() == 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[44]++;
        if (visit302_44_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[45]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[46]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[47]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[48]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[50]++;
          return false;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[56]++;
    var blockTag = "p";
    _$jscoverage['/editor/enterKey.js'].lineData[59]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[61]++;
    if (visit303_61_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[62]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[65]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[68]++;
    var isStartOfBlock = splitInfo.wasStartOfBlock, isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[71]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[74]++;
    if (visit304_74_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[75]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[76]++;
      if (visit305_76_1(node.nodeName() == 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[77]++;
        nextBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[78]++;
        nextBlock._4e_move(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[81]++;
      if (visit306_81_1(previousBlock && visit307_81_2((node = previousBlock.parent()) && visit308_81_3(node.nodeName() == 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[82]++;
        previousBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[83]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[84]++;
        previousBlock._4e_move(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[90]++;
    if (visit309_90_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[94]++;
      if (visit310_94_1(visit311_94_2(nextBlock.nodeName() == 'li') && visit312_95_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[97]++;
        (OLD_IE ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[101]++;
      if (visit313_101_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[102]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[105]++;
      var newBlock;
      _$jscoverage['/editor/enterKey.js'].lineData[107]++;
      if (visit314_107_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[111]++;
        if (visit315_111_1(visit316_111_2(previousBlock.nodeName() == 'li') || !headerTagRegex.test(previousBlock.nodeName()))) {
          _$jscoverage['/editor/enterKey.js'].lineData[113]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[116]++;
        if (visit317_116_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[117]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[119]++;
      if (visit318_119_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[120]++;
        newBlock = new Node("<" + blockTag + ">", null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[125]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[126]++;
      if (visit319_126_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[127]++;
        for (var i = 0, len = elementPath.elements.length; visit320_127_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[128]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[130]++;
          if (visit321_130_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[131]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[133]++;
          if (visit322_133_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[134]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[135]++;
            newBlock._4e_moveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[136]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[141]++;
      if (visit323_141_1(!OLD_IE)) {
        _$jscoverage['/editor/enterKey.js'].lineData[142]++;
        newBlock._4e_appendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[144]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[151]++;
      if (visit324_151_1(OLD_IE && visit325_151_2(isStartOfBlock && (visit326_151_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[153]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[154]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[158]++;
      range.moveToElementEditablePosition(visit327_158_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[161]++;
    if (visit328_161_1(!OLD_IE)) {
      _$jscoverage['/editor/enterKey.js'].lineData[162]++;
      if (visit329_162_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[165]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[168]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[170]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[171]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[176]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[181]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[188]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[189]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[192]++;
  function EnterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[193]++;
    var doc = editor.get("document");
    _$jscoverage['/editor/enterKey.js'].lineData[194]++;
    doc.on("keydown", function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[195]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[196]++;
  if (visit330_196_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[197]++;
    if (visit331_197_1(ev.shiftKey || visit332_197_2(ev.ctrlKey || ev.metaKey))) {
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[199]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[200]++;
      var re = editor.execCommand("enterBlock");
      _$jscoverage['/editor/enterKey.js'].lineData[201]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[202]++;
      if (visit333_202_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[203]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[210]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[212]++;
  editor.addCommand("enterBlock", {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[215]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[216]++;
  EnterKey(editor);
});
}};
});
