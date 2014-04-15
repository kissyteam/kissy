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
  _$jscoverage['/editor/enterKey.js'].lineData[19] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[21] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[23] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[24] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[27] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[30] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[32] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[33] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[35] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[36] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[39] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[42] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[43] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[44] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[45] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[46] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[48] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[54] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[57] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[59] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[60] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[64] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[67] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[70] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[73] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[74] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[75] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[76] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[77] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[79] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[80] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[81] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[82] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[85] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[90] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[94] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[97] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[102] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[103] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[106] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[110] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[112] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[114] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[115] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[118] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[119] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[125] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[126] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[127] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[128] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[130] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[132] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[135] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[136] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[137] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[138] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[143] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[144] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[147] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[154] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[156] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[157] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[161] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[164] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[165] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[168] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[171] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[173] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[174] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[179] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[183] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[190] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[191] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[194] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[195] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[196] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[197] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[198] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[199] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[200] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[201] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[202] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[203] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[204] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[211] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[213] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[216] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[217] = 0;
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
  _$jscoverage['/editor/enterKey.js'].branchData['23'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['35'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['39'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['40'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['41'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['42'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['59'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['73'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['75'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['79'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['79'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['90'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['94'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['94'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['95'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['102'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['106'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['110'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['114'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['118'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['126'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['127'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['130'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['135'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['143'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['154'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['154'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['161'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['164'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['165'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['198'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['199'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['199'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['203'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['203'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['203'][1].init(188, 12, 're !== false');
function visit335_203_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['199'][3].init(39, 24, 'ev.ctrlKey || ev.metaKey');
function visit334_199_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['199'][2].init(24, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit333_199_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['199'][1].init(22, 42, '!(ev.shiftKey || ev.ctrlKey || ev.metaKey)');
function visit332_199_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['198'][1].init(57, 14, 'keyCode === 13');
function visit331_198_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['165'][1].init(18, 9, 'nextBlock');
function visit330_165_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['164'][1].init(5533, 7, '!OLD_IE');
function visit329_164_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['161'][1].init(2470, 31, 'isStartOfBlock && !isEndOfBlock');
function visit328_161_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['154'][3].init(2109, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit327_154_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['154'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['154'][2].init(2090, 72, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit326_154_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['154'][1].init(2080, 82, 'OLD_IE && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit325_154_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['143'][1].init(1649, 7, '!OLD_IE');
function visit324_143_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['135'][1].init(324, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit323_135_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['130'][1].init(90, 100, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit322_130_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['127'][1].init(69, 7, 'i < len');
function visit321_127_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['126'][1].init(946, 11, 'elementPath');
function visit320_126_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['118'][1].init(595, 9, '!newBlock');
function visit319_118_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['114'][1].init(503, 9, 'nextBlock');
function visit318_114_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['110'][2].init(218, 33, 'previousBlock.nodeName() === \'li\'');
function visit317_110_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['110'][1].init(218, 83, 'previousBlock.nodeName() === \'li\' || !headerTagRegex.test(previousBlock.nodeName())');
function visit316_110_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['106'][1].init(18, 13, 'previousBlock');
function visit315_106_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['102'][1].init(618, 9, 'nextBlock');
function visit314_102_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['95'][1].init(50, 108, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit313_95_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['94'][2].init(227, 29, 'nextBlock.nodeName() === \'li\'');
function visit312_94_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['94'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['94'][1].init(227, 159, 'nextBlock.nodeName() === \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit311_94_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['90'][1].init(2218, 32, '!isStartOfBlock && !isEndOfBlock');
function visit310_90_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['79'][3].init(1761, 24, 'node.nodeName() === \'li\'');
function visit309_79_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['79'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['79'][2].init(1727, 58, '(node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit308_79_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['79'][1].init(1709, 76, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit307_79_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['75'][1].init(58, 24, 'node.nodeName() === \'li\'');
function visit306_75_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['73'][1].init(1466, 9, 'nextBlock');
function visit305_73_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['59'][1].init(1054, 10, '!splitInfo');
function visit304_59_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['42'][1].init(22, 28, 'editor.hasCommand(\'outdent\')');
function visit303_42_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['41'][1].init(49, 34, 'block.parent().nodeName() === \'li\'');
function visit302_41_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['40'][2].init(26, 25, 'block.nodeName() === \'li\'');
function visit301_40_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['40'][1].init(26, 84, 'block.nodeName() === \'li\' || block.parent().nodeName() === \'li\'');
function visit300_40_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['39'][1].init(139, 112, 'block && (block.nodeName() === \'li\' || block.parent().nodeName() === \'li\')');
function visit299_39_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['35'][1].init(219, 52, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit298_35_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['23'][1].init(205, 5, 'i > 0');
function visit297_23_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['15'][1].init(177, 16, 'S.UA.ieMode < 11');
function visit296_15_1(result) {
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
  var OLD_IE = visit296_15_1(S.UA.ieMode < 11);
  _$jscoverage['/editor/enterKey.js'].lineData[16]++;
  var headerTagRegex = /^h[1-6]$/, dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/enterKey.js'].lineData[19]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[21]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[23]++;
    for (var i = ranges.length - 1; visit297_23_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[24]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[27]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[30]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[32]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[33]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[35]++;
    if (visit298_35_1(range.checkStartOfBlock() && range.checkEndOfBlock())) {
      _$jscoverage['/editor/enterKey.js'].lineData[36]++;
      var path = new ElementPath(range.startContainer), block = path.block;
      _$jscoverage['/editor/enterKey.js'].lineData[39]++;
      if (visit299_39_1(block && (visit300_40_1(visit301_40_2(block.nodeName() === 'li') || visit302_41_1(block.parent().nodeName() === 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[42]++;
        if (visit303_42_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[43]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enterKey.js'].lineData[44]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[45]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enterKey.js'].lineData[46]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[48]++;
          return false;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[54]++;
    var blockTag = 'p';
    _$jscoverage['/editor/enterKey.js'].lineData[57]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[59]++;
    if (visit304_59_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[60]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[64]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[67]++;
    var isStartOfBlock = splitInfo.wasStartOfBlock, isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[70]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[73]++;
    if (visit305_73_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[74]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[75]++;
      if (visit306_75_1(node.nodeName() === 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[76]++;
        nextBlock._4eBreakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[77]++;
        nextBlock._4eMove(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[79]++;
      if (visit307_79_1(previousBlock && visit308_79_2((node = previousBlock.parent()) && visit309_79_3(node.nodeName() === 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[80]++;
        previousBlock._4eBreakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[81]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[82]++;
        previousBlock._4eMove(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[85]++;
    var newBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[90]++;
    if (visit310_90_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[94]++;
      if (visit311_94_1(visit312_94_2(nextBlock.nodeName() === 'li') && visit313_95_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[97]++;
        (OLD_IE ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[102]++;
      if (visit314_102_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[103]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[106]++;
      if (visit315_106_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[110]++;
        if (visit316_110_1(visit317_110_2(previousBlock.nodeName() === 'li') || !headerTagRegex.test(previousBlock.nodeName()))) {
          _$jscoverage['/editor/enterKey.js'].lineData[112]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[114]++;
        if (visit318_114_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[115]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[118]++;
      if (visit319_118_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[119]++;
        newBlock = new Node('<' + blockTag + '>', null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[125]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[126]++;
      if (visit320_126_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[127]++;
        for (var i = 0, len = elementPath.elements.length; visit321_127_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[128]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[130]++;
          if (visit322_130_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[132]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[135]++;
          if (visit323_135_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[136]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[137]++;
            newBlock._4eMoveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[138]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[143]++;
      if (visit324_143_1(!OLD_IE)) {
        _$jscoverage['/editor/enterKey.js'].lineData[144]++;
        newBlock._4eAppendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[147]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[154]++;
      if (visit325_154_1(OLD_IE && visit326_154_2(isStartOfBlock && (visit327_154_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[156]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[157]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[161]++;
      range.moveToElementEditablePosition(visit328_161_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[164]++;
    if (visit329_164_1(!OLD_IE)) {
      _$jscoverage['/editor/enterKey.js'].lineData[165]++;
      if (visit330_165_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[168]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[171]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[173]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[174]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[179]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[183]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[190]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[191]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[194]++;
  function enterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[195]++;
    var doc = editor.get('document');
    _$jscoverage['/editor/enterKey.js'].lineData[196]++;
    doc.on('keydown', function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[197]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[198]++;
  if (visit331_198_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[199]++;
    if (visit332_199_1(!(visit333_199_2(ev.shiftKey || visit334_199_3(ev.ctrlKey || ev.metaKey))))) {
      _$jscoverage['/editor/enterKey.js'].lineData[200]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enterKey.js'].lineData[201]++;
      var re = editor.execCommand('enterBlock');
      _$jscoverage['/editor/enterKey.js'].lineData[202]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enterKey.js'].lineData[203]++;
      if (visit335_203_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[204]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[211]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[213]++;
  editor.addCommand('enterBlock', {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[216]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[217]++;
  enterKey(editor);
});
}};
});
