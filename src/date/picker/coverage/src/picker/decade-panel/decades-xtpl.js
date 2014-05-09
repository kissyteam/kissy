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
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js']) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'] = {};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[182] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[183] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[5] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[6] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData = {};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['48'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['61'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['82'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['99'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['112'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['129'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['142'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['160'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['160'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['160'][1].init(5919, 31, 'callRet40 && callRet40.isBuffer');
function visit19_160_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['142'][1].init(494, 31, 'callRet37 && callRet37.isBuffer');
function visit18_142_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['129'][1].init(4297, 14, '(id32) > (id33)');
function visit17_129_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['112'][1].init(494, 31, 'callRet29 && callRet29.isBuffer');
function visit16_112_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['99'][1].init(2846, 14, '(id24) < (id25)');
function visit15_99_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['82'][1].init(489, 31, 'callRet21 && callRet21.isBuffer');
function visit14_82_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'][1].init(207, 15, '(id15) <= (id16)');
function visit13_67_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['61'][1].init(1037, 15, '(id12) <= (id13)');
function visit12_61_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['48'][1].init(465, 29, 'callRet9 && callRet9.isBuffer');
function visit11_48_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[4]++;
  var decades = function(scope, buffer, undefined) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[20]++;
  buffer.write('', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[25]++;
  var id2 = scope.resolve(["decades"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[26]++;
  params1.push(id2);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[27]++;
  option0.params = params1;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[28]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[29]++;
  buffer.write('\r\n<tr role="row">\r\n    ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[30]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[33]++;
  var params4 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[34]++;
  var id6 = scope.resolve(["xindex"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[35]++;
  var id5 = scope.resolve(["decades", id6], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[36]++;
  params4.push(id5);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[37]++;
  option3.params = params4;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[38]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[39]++;
  buffer.write('\r\n    <td role="gridcell"\r\n        class="', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[40]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[43]++;
  var params8 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[44]++;
  params8.push('cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[45]++;
  option7.params = params8;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[46]++;
  var callRet9;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[47]++;
  callRet9 = callFnUtil(tpl, scope, option7, buffer, ["getBaseCssClasses"], 0, 5);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[48]++;
  if (visit11_48_1(callRet9 && callRet9.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[49]++;
    buffer = callRet9;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[50]++;
    callRet9 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[52]++;
  buffer.write(callRet9, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[53]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[54]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[57]++;
  var params11 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[58]++;
  var id12 = scope.resolve(["startDecade"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[59]++;
  var exp14 = id12;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[60]++;
  var id13 = scope.resolve(["year"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[61]++;
  exp14 = visit12_61_1((id12) <= (id13));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[62]++;
  var exp18 = exp14;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[63]++;
  if ((exp14)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[64]++;
    var id15 = scope.resolve(["year"], 0);
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[65]++;
    var exp17 = id15;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[66]++;
    var id16 = scope.resolve(["endDecade"], 0);
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[67]++;
    exp17 = visit13_67_1((id15) <= (id16));
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[68]++;
    exp18 = exp17;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[70]++;
  params11.push(exp18);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[71]++;
  option10.params = params11;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[72]++;
  option10.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[73]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[74]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[77]++;
  var params20 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[78]++;
  params20.push('selected-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[79]++;
  option19.params = params20;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[80]++;
  var callRet21;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[81]++;
  callRet21 = callFnUtil(tpl, scope, option19, buffer, ["getBaseCssClasses"], 0, 7);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[82]++;
  if (visit14_82_1(callRet21 && callRet21.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[83]++;
    buffer = callRet21;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[84]++;
    callRet21 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[86]++;
  buffer.write(callRet21, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[87]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[88]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[90]++;
  buffer = ifCommand.call(tpl, scope, option10, buffer, 6);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[91]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[92]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[95]++;
  var params23 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[96]++;
  var id24 = scope.resolve(["startDecade"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[97]++;
  var exp26 = id24;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[98]++;
  var id25 = scope.resolve(["startYear"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[99]++;
  exp26 = visit15_99_1((id24) < (id25));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[100]++;
  params23.push(exp26);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[101]++;
  option22.params = params23;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[102]++;
  option22.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[103]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[104]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[107]++;
  var params28 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[108]++;
  params28.push('last-century-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[109]++;
  option27.params = params28;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[110]++;
  var callRet29;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[111]++;
  callRet29 = callFnUtil(tpl, scope, option27, buffer, ["getBaseCssClasses"], 0, 10);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[112]++;
  if (visit16_112_1(callRet29 && callRet29.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[113]++;
    buffer = callRet29;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[114]++;
    callRet29 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[116]++;
  buffer.write(callRet29, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[117]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[118]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[120]++;
  buffer = ifCommand.call(tpl, scope, option22, buffer, 9);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[121]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[122]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[125]++;
  var params31 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[126]++;
  var id32 = scope.resolve(["endDecade"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[127]++;
  var exp34 = id32;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[128]++;
  var id33 = scope.resolve(["endYear"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[129]++;
  exp34 = visit17_129_1((id32) > (id33));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[130]++;
  params31.push(exp34);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[131]++;
  option30.params = params31;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[132]++;
  option30.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[133]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[134]++;
  var option35 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[137]++;
  var params36 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[138]++;
  params36.push('next-century-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[139]++;
  option35.params = params36;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[140]++;
  var callRet37;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[141]++;
  callRet37 = callFnUtil(tpl, scope, option35, buffer, ["getBaseCssClasses"], 0, 13);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[142]++;
  if (visit18_142_1(callRet37 && callRet37.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[143]++;
    buffer = callRet37;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[144]++;
    callRet37 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[146]++;
  buffer.write(callRet37, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[147]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[148]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[150]++;
  buffer = ifCommand.call(tpl, scope, option30, buffer, 12);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[151]++;
  buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[152]++;
  var option38 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[155]++;
  var params39 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[156]++;
  params39.push('decade');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[157]++;
  option38.params = params39;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[158]++;
  var callRet40;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[159]++;
  callRet40 = callFnUtil(tpl, scope, option38, buffer, ["getBaseCssClasses"], 0, 19);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[160]++;
  if (visit19_160_1(callRet40 && callRet40.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[161]++;
    buffer = callRet40;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[162]++;
    callRet40 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[164]++;
  buffer.write(callRet40, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[165]++;
  buffer.write('">\r\n            ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[166]++;
  var id41 = scope.resolve(["startDecade"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[167]++;
  buffer.write(id41, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[168]++;
  buffer.write('-', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[169]++;
  var id42 = scope.resolve(["endDecade"], 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[170]++;
  buffer.write(id42, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[171]++;
  buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[172]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[174]++;
  buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[175]++;
  buffer.write('\r\n</tr>\r\n', 0);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[176]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[178]++;
  buffer = eachCommand.call(tpl, scope, option0, buffer, 1);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[179]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[181]++;
  decades.TPL_NAME = module.name;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[182]++;
  decades.version = "5.0.0";
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[183]++;
  return decades;
});
